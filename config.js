// ──────────────────────────────────────────────────────────
//  Morning Research OS — 設定ファイル
//  自分の値に書き換えてください。Google連携を使わない場合は空のままでOK。
// ──────────────────────────────────────────────────────────
window.APP_CONFIG = {
  // ユーザープロフィール（Briefingのパーソナライズに使用）
  USER_NAME: 'Kaito',            // 例: 'Kastanet'（空なら省略）
  CITY_LABEL: '厚木',            // 天気カード・Briefing本文で使う地名表記
  DEFAULT_CITY: 'Atsugi',        // 天気APIに渡す都市名（入力欄の初期表示）
  DEFAULT_COORDS: '35.4427,139.3625',  // 厚木の座標。DEFAULT_CITY選択時はこの座標で正確に取得

  // ── キャリアのペルソナ（Career Radar の専用アドバイス生成に使用） ──
  // LinkedIn等の自分のプロフィールを要約して記入。AIがこれを元に個別助言します。
  USER_PERSONA: [
    '氏名: Kaito Asai（浅井海斗）。LinkedIn: jp.linkedin.com/in/kaito-asai-267671393。',
    '現職: 日産自動車 AD/ADAS開発エンジニア。学歴: 九州大学大学院 修士（自動車工学／情報・制御システム／知能モビリティ／自動運転）。',
    '専門分野: ADAS・自動運転、Human-AI Interaction、Vision-Language Model(VLM)、SDV、HMI/eHMI、協調知能(Cooperative Intelligence)、駐車システム。',
    '研究の中心: 運転シーン理解と運転助言のためのVLM。テーマ=リスク認識型運転支援/運転シーン理解/Explainable AI/マルチモーダル推論。',
    'プロジェクト: ①VLMベース運転アドバイス分析(LLaVA・運転データセット・定量評価, 説明可能性と信頼性向上) ②RiSA-V2X(路側機×車両のAI協調, RSU知覚/協調シーン理解/リスク要約/V2X知能共有) ③eHMI研究(地面投影/意図可視化/ドライバージェスチャー→車両通信/AV交渉インタフェース) ④駐車知能(駐車枠検出/占有予測/VLMベース駐車推薦)。',
    '技術: PyTorch/Deep Learning/Computer Vision/VLM/Multimodal AI、CARLA、Python/Git/Docker/Linux/LangGraph/Claude Code、科学論文執筆/実験計画/定量分析/学会発表。',
    '実績: IEEE BigData ポスター発表、IEICE ITS 発表（VLMベース運転助言システム）。',
    '長期目標: 自動運転研究/Human-Centered AI/V2X・A2X知能/国際研究連携/博士号(PhD)/Research Scientist・Research Engineer。'
  ].join(' '),

  // ── AI Briefing 用 LLM API ───────────────────────────────
  // OpenAI なら 'openai'、Anthropic(Claude) なら 'anthropic'
  AI_PROVIDER: 'groq',           // gsk_ キーは自動で Groq と判定されます
  AI_API_KEY: '',                // ⚠️ ここには書かない。アプリ右上の ⚙️ 設定画面で入力（ブラウザ内に保存され公開されません）
  AI_MODEL: 'openai/gpt-oss-120b',  // Groq: 推論・多言語対応の高品質モデル。軽量にするなら 'llama-3.3-70b-versatile'

  // Google Cloud で発行した OAuth 2.0 クライアントID（手順は SETUP.md）
  GOOGLE_CLIENT_ID: '602193109479-bsi442hdsqvr68au9pu24viam9dimghf.apps.googleusercontent.com',

  // 株（東証日産 7201）
  NISSAN_TICKER: '7201.T',

  // モーニングブリーフィングの通知時刻（24h表記）
  BRIEF_HOUR: 8,
  BRIEF_MINUTE: 55,

  // ニュースRSS（NHK 主要ニュース）
  NEWS_RSS: 'https://www.nhk.or.jp/rss/news/cat0.xml',  // 国内（NHK主要）
  WORLD_NEWS_RSS: [                                      // 世界（BBC World / Al Jazeera）
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.aljazeera.com/xml/rss/all.xml'
  ],
  NEWS_MAX: 5,

  // ── Research Radar ───────────────────────────────────────
  // 各カテゴリの検索語。arXiv / Semantic Scholar 横断で使用。
  RESEARCH_CATEGORIES: [
    { label: 'Autonomous Driving', terms: ['autonomous driving', 'self-driving', 'end-to-end driving'] },
    { label: 'ADAS',               terms: ['advanced driver assistance', 'ADAS', 'driver monitoring'] },
    { label: 'VLM',                terms: ['vision-language model', 'vision language model', 'VLM driving'] },
    { label: 'HCI',                terms: ['human-computer interaction', 'driver interface', 'in-vehicle interface'] },
    { label: 'eHMI',               terms: ['external human-machine interface', 'eHMI', 'pedestrian vehicle interaction'] },
    { label: 'V2X',                terms: ['vehicle-to-everything', 'V2X', 'connected vehicles'] },
  ],
  RESEARCH_MAX: 6,                 // 表示する論文数
  // 論文ソース: OpenAlex(主)→ arXiv API → arXiv RSS の順でフォールバック
  OPENALEX_QUERY: '',              // 空なら RESEARCH_CATEGORIES から自動生成。指定例: 'autonomous driving vision-language model eHMI'
  CONTACT_EMAIL: '',               // OpenAlex polite pool用（任意・入れると安定）。例: 'you@example.com'
  ENABLE_SEMANTIC_SCHOLAR: false,  // S2はクラウドIPで429が多いため既定OFF

  // ── Career Radar（注目企業。各社まとめ＋本人ペルソナ向け助言を生成） ──
  WATCH_COMPANIES: ['Tesla', 'Tier IV', 'Turing', '日産自動車', 'Honda', 'Toyota', 'AUMOVIO', 'Bosch', 'Valeo', 'Mobileye'],

  // ── GitHub Activity（Phase 2 で使用予定） ────────────────
  GITHUB_USERNAME: '',
};
