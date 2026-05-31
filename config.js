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
  USER_PERSONA: '氏名: Kaito Asai（浅井海斗）。LinkedIn: jp.linkedin.com/in/kaito-asai-267671393。自動運転・AI研究者を志す若手エンジニア。博士進学を視野。関心領域: 自動運転(end-to-end / Vision-Language Model)、HCI・eHMI(歩車間インタラクション)、認識・行動予測。現在はCARLA上でのジェスチャー制御eHMIなど研究プロトタイプを開発中。目標: Tier IV / Wayve / Waabi / NVIDIA / Zoox 等での研究職・リサーチエンジニア。',

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
  NEWS_RSS: 'https://www.nhk.or.jp/rss/news/cat0.xml',
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
  RESEARCH_MAX: 6,                 // 表示する論文数（重要度順）
  ENABLE_SEMANTIC_SCHOLAR: true,   // 引用数で重要度を補強（任意・失敗時は無視）

  // ── Career Radar（Phase 2 で使用予定。今は未使用） ────────
  WATCH_COMPANIES: ['Tier IV', 'Wayve', 'Waabi', 'NVIDIA', 'Zoox'],

  // ── GitHub Activity（Phase 2 で使用予定） ────────────────
  GITHUB_USERNAME: '',
};
