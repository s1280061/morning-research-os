# Morning Research OS — アーキテクチャ設計図

自動運転・AI研究者向けの「研究パーソナルOS」PWA。
**フロントは静的サイト（バニラJS）**、**APIキーや混雑しやすい外部APIはVercelのサーバーレス関数が代理**する構成。

![Architecture](docs/architecture.png)

> 画像版: [docs/architecture.png](docs/architecture.png) ／ 高解像度 [docs/architecture@2x.png](docs/architecture@2x.png) ／ ベクター [docs/architecture.svg](docs/architecture.svg)

---

## 1. システム全体構成

```mermaid
flowchart TB
    subgraph Client["📱 ブラウザ (PWA / 静的サイト)"]
        UI["index.html + config.js<br/>(バニラJS, Service Worker)"]
        LS["localStorage<br/>(設定 / 結果キャッシュ)"]
        UI <--> LS
    end

    subgraph Vercel["☁️ Vercel (ホスティング + サーバーレス)"]
        Static["静的配信<br/>index.html / favicon / icons"]
        Chat["/api/chat.mjs<br/>(Groq 代理・キーはサーバ環境変数)"]
        Proxy["/api/proxy.mjs<br/>(同一オリジンCORS代理 + CDNキャッシュ)"]
        ENV["環境変数<br/>GROQ_API_KEY"]
        Chat --- ENV
    end

    subgraph Ext["🌐 外部API"]
        Groq["Groq LLM API<br/>(gpt-oss / Llama)"]
        OA["OpenAlex<br/>(論文)"]
        OM["Open-Meteo<br/>(天気 / ジオコーディング)"]
        YF["Yahoo Finance<br/>(株価)"]
        RSS["NHK / BBC / Al Jazeera<br/>(ニュースRSS)"]
        ARX["arXiv API / RSS<br/>(論文・予備)"]
        GOO["Google OAuth + Tasks API"]
    end

    UI -->|HTML/JS取得| Static
    UI -->|"AI生成 (キー不要)"| Chat
    Chat --> Groq
    UI -->|"市況/ニュース/論文<br/>(プロキシ経由)"| Proxy
    Proxy --> YF
    Proxy --> RSS
    Proxy --> ARX
    UI -->|"天気/論文<br/>(CORS対応=直接)"| OM
    UI -->|"論文<br/>(CORS対応=直接)"| OA
    UI -->|"クライアントOAuth"| GOO

    classDef cli fill:#e8f0ff,stroke:#2d7ff9,color:#16243b
    classDef ver fill:#eafff4,stroke:#00b894,color:#16243b
    classDef ext fill:#fff4e8,stroke:#e17055,color:#16243b
    class UI,LS cli
    class Static,Chat,Proxy,ENV ver
    class Groq,OA,OM,YF,RSS,ARX,GOO ext
```

---

## 2. AIリクエストの流れ（キーをブラウザに出さない）

```mermaid
sequenceDiagram
    participant B as ブラウザ (callLLM)
    participant Q as キュー (callLLMQueued)
    participant C as /api/chat (Vercel)
    participant G as Groq API

    Note over B: 起動時に GET /api/chat で _backendReady を判定
    B->>Q: system / user / model
    Q->>Q: 45分キャッシュ確認 (aic_*)
    alt キャッシュHIT
        Q-->>B: キャッシュ結果
    else 生成が必要
        Q->>C: POST {system,user,model}
        C->>G: Bearer GROQ_API_KEY 付きで呼び出し
        alt 429 (枠切れ)
            C-->>Q: 429
            Q->>C: 次モデルで再試行 (120B→20B→70B)
        else 成功
            G-->>C: reply
            C-->>Q: {reply}
            Q-->>B: 結果 (localStorageへキャッシュ)
        end
    end
    Note over B: 失敗時はローカル要約にフォールバック (空にしない)
```

**フォールバックの段階**
1. サーバキー(`/api/chat`) → 2. ブラウザのキー(localStorage) → 3. ローカル要約（ニュース/論文/天気から生成）

---

## 3. データ取得の流れ（プロキシと直接の使い分け）

```mermaid
flowchart LR
    subgraph FE["fetchViaProxy()"]
        P1["/api/proxy (同一オリジン・最優先)"]
        P2["allorigins / corsproxy / codetabs / thingproxy<br/>(公開プロキシ・フォールバック)"]
        P1 -. 失敗 .-> P2
    end

    M["Market: Yahoo Finance"] --> FE
    N["News: NHK / BBC / Al Jazeera"] --> FE
    AX["Papers(予備): arXiv"] --> FE

    W["Weather: Open-Meteo"] -->|CORS対応で直接| D["fetchT (直叩き2回→proxy)"]
    PA["Papers(主): OpenAlex"] -->|CORS対応で直接| D2["直fetch"]
```

| データ | ソース | 取得方法 | 堅牢化 |
|---|---|---|---|
| 天気 / 時間帯予報 | Open-Meteo | 直fetch→失敗時proxy | リトライ + 既定座標fallback + 結果キャッシュ |
| 論文 | OpenAlex（主）→ arXiv API → RSS | 直fetch / proxy | 多段フォールバック + キャッシュ優先表示 |
| 株価 | Yahoo Finance | proxy | 公開proxy多段フォールバック |
| ニュース | NHK + BBC + Al Jazeera | proxy | フィード多段フォールバック |
| カレンダーTasks | Google Tasks | クライアントOAuth | ローカルタスクfallback |

---

## 4. フロントエンドのモジュール構成（論理）

```mermaid
flowchart TB
    Boot["Boot: 設定移行 → /api/chat プローブ → loadAll()"]
    Boot --> LoadAll["loadAll()"]
    LoadAll --> WX["loadWeather (Open-Meteo + hourly)"]
    LoadAll --> MK["loadMarket (Yahoo)"]
    LoadAll --> NW["loadNews (国内+世界)"]
    LoadAll --> RS["loadResearch (OpenAlex)"]
    LoadAll --> CB["generateAIBriefing"]
    LoadAll --> CA["renderCareer"]
    LoadAll --> CO["renderCoach"]

    subgraph AI["AIレイヤ (Groq経由・全て45分キャッシュ+ローカルfallback)"]
        CB
        RT["researchTrendsAuto (動向+予測)"]
        NT["newsTrendAuto (傾向要約)"]
        CC["careerAdviceAuto (企業別まとめ)"]
        COA["coachAdviceAuto (ニュース×論文×企業)"]
    end
    RS --> RT
    NW --> NT
    CA --> CC
    NW --> COA
    RS --> COA
```

---

## 5. 設計の要点（なぜこの構成か）

- **セキュリティ**: APIキーは Vercel 環境変数 `GROQ_API_KEY` に保持し、ブラウザへ出さない（`/api/chat` 代理）。
- **堅牢性 (Robustness first)**: すべての外部依存に「リトライ → 別ソース → キャッシュ → ローカル要約」の多段フォールバック。どの端末でも空白/エラーで止まらない。
- **コスト/レート制限対策**: AI出力を45分 localStorage キャッシュ、Groqモデルの自動フォールバック（120B→20B→70B）。
- **可用性**: クラウドIPが弾かれやすい arXiv/株価は同一オリジンプロキシ＋CDNキャッシュ、CORS対応の OpenAlex/Open-Meteo はブラウザ直叩きで安定。
- **オフライン**: Service Worker（network-first）でPWA化、最低限のシェルとキャッシュ結果を表示。

---

## 6. デプロイ

```mermaid
flowchart LR
    Dev["ローカル編集"] --> GH["git push → GitHub<br/>(s1280061/morning-research-os)"]
    GH -->|自動デプロイ| VC["Vercel<br/>morning-research-os-p9dn.vercel.app"]
    ENV2["Vercel 環境変数<br/>GROQ_API_KEY"] -. 設定 .-> VC
```

- 静的ファイル + `/api/*.mjs`（**ESMビルドのため拡張子は必ず `.mjs`**）をVercelが自動デプロイ。
- `vercel.json` でヘッダ/リライト、`sw.js` の `CACHE` 版数更新でクライアント更新を促す。
