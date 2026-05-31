# 🌅 Morning Briefing — セットアップ手順

AIモーニングブリーフィングアプリ。毎朝 8:55 に、天気・S&P500・日産株・今日の予定・Gmail要約・ニュース・今日やるべきこと を1画面で。

スマホの**ホーム画面に追加**してネイティブアプリのように使えます（PWA）。

---

## 1. ローカルで動かす

このアプリはサーバー不要の静的サイトですが、Service Worker と Google連携の都合上 `file://` ではなく **HTTPでの配信**が必要です。

### 一番簡単な方法（Python）
```powershell
cd C:\Users\s1280\Desktop\JAAD_clips\morning_dashboard
python -m http.server 8000
```
ブラウザで `http://localhost:8000` を開く。

> 天気・株価・ニュース・タスク（ローカル保存）は**この時点で動きます**。
> Gmail・カレンダー・Google Tasks 連携を使うには、以下の手順 2 が必要です。

---

## 2. Google連携を有効にする（Gmail / カレンダー / タスク）

バックエンド不要のクライアント側OAuthを使います。**読み取り中心・あなたのブラウザ内だけ**で完結します。

### 2-1. Google Cloud プロジェクトを作る
1. https://console.cloud.google.com/ にアクセス
2. 上部のプロジェクト選択 →「新しいプロジェクト」→ 名前（例: `morning-briefing`）で作成

### 2-2. APIを有効化
「APIとサービス」→「ライブラリ」で次の3つを検索して**有効化**:
- **Google Calendar API**
- **Gmail API**
- **Tasks API**

### 2-3. OAuth同意画面を設定
1. 「APIとサービス」→「OAuth同意画面」
2. User Type =「外部」→ 作成
3. アプリ名・サポートメール・デベロッパー連絡先 を入力して保存
4. 「対象ユーザー（Test users）」に**自分のGoogleアカウントを追加**
   （テスト中はここに登録したアカウントだけが使えます）

### 2-4. OAuthクライアントIDを発行
1. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」
2. アプリケーションの種類 =「**ウェブアプリケーション**」
3. **承認済みのJavaScript生成元** に、アプリを開くURLを追加:
   - `http://localhost:8000`
   - （スマホやサーバーで公開する場合はそのURLも。例 `https://xxxx.github.io`）
4. 作成すると**クライアントID**が表示されるのでコピー

### 2-5. config.js に貼り付け
`config.js` を開き、`GOOGLE_CLIENT_ID` に貼り付け:
```js
window.APP_CONFIG = {
  GOOGLE_CLIENT_ID: '123456789-xxxxxxxx.apps.googleusercontent.com',
  ...
};
```
保存してページを再読み込み →「🔗 Google連携」ボタンを押すと認証画面が出ます。

---

## 3. スマホのホーム画面に追加（PWA）

ローカルでは同じWi-Fi内のスマホから `http://<PCのIP>:8000` で開けます。
常に使うなら、無料で公開できる **GitHub Pages / Netlify / Vercel** にこのフォルダを置くのが簡単です。

- **iPhone (Safari)**: 共有ボタン → 「ホーム画面に追加」
- **Android (Chrome)**: メニュー → 「アプリをインストール」/「ホーム画面に追加」

> ⚠️ Google連携を公開URLで使う場合は、手順 2-4 の「承認済みJavaScript生成元」にそのURLを追加してください。

---

## 4. 8:55 の通知について

「🔔 8:55通知」ボタンで通知をONにできます。
- **アプリ（タブ）を開いている間**は、毎朝8:55に通知が出て自動更新します。
- 完全にバックグラウンド（アプリを閉じた状態）で時刻ぴったりに通知するには、Web標準だけでは Push サーバーが必要です。確実な定時通知が欲しい場合は、スマホ標準の「アラーム/リマインダー」を8:55に併用するのが手軽です。

---

## カスタマイズ（config.js）

| 項目 | 説明 |
|------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID |
| `DEFAULT_CITY` | 天気のデフォルト都市（例: `Tokyo`, `Osaka`） |
| `NISSAN_TICKER` | 株のティッカー（東証日産は `7201.T`） |
| `BRIEF_HOUR` / `BRIEF_MINUTE` | 通知時刻（既定 8:55） |
| `NEWS_RSS` | ニュースRSS（既定: NHK主要ニュース） |
| `NEWS_MAX` | ニュース表示件数 |

---

## ファイル構成
```
morning_dashboard/
├── index.html      # アプリ本体（全カード＋Google連携＋通知）
├── config.js       # 設定（Client ID等）← ここを編集
├── manifest.json   # PWA設定
├── sw.js           # Service Worker（オフライン・通知）
├── icons/          # アプリアイコン
├── make_icons.py   # アイコン生成スクリプト（再生成用）
└── SETUP.md        # この手順書
```

---

## Vercelで公開（スマホ向け本番運用）

1. [Vercel](https://vercel.com/) に GitHub 連携でログイン
2. `s1280061/morning-research-os` を `Import Project`
3. Framework Preset は `Other`（静的サイト）
4. Build Command は空欄、Output Directory も空欄（ルート配信）
5. Deploy

このリポジトリには `vercel.json` を追加済みなので、`index.html` ルート配信とPWA関連ヘッダはそのまま有効になります。

### Google連携の本番ドメイン設定（重要）
Google Calendar / Gmail / Tasks を本番で使うには、Google Cloud Console の OAuth クライアント設定で以下を追加してください。

- Authorized JavaScript origins: `https://<your-vercel-domain>`
- 例: `https://morning-research-os.vercel.app`

`localhost` だけ登録している状態だと、本番URLでは Google 連携が失敗します。

---

## API実装チェック結果

### 1) Weather API
- 実装: あり
- 取得先: `wttr.in`（失敗時は `allorigins/corsproxy/codetabs` 経由フォールバック）
- 判定: 実装済み（外部無料API依存のため、プロキシ側障害時は失敗する可能性あり）

### 2) Market API
- 実装: あり
- 取得先: Yahoo Finance chart API（プロキシ経由）
- 判定: 実装済み

### 3) Tasks API
- 実装: あり
- 取得先: Google Tasks API（OAuth）
- フォールバック: 未連携時は LocalStorage タスク管理
- 判定: 実装済み

### 4) Gmail API
- 実装: あり
- 取得先: Gmail API（OAuth）
- 判定: 実装済み

### 5) Google Calendar API
- 実装: あり
- 取得先: Google Calendar API（OAuth）
- 判定: 実装済み

### 動かない時の最短確認
- `config.js` の `GOOGLE_CLIENT_ID` が正しいか
- Google Cloud で `Calendar API / Gmail API / Tasks API` が有効化済みか
- OAuth consent screen の Test users に利用Googleアカウントを追加済みか
- OAuth クライアントの Authorized JavaScript origins に Vercel ドメインを追加済みか
