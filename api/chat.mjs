// Vercel Serverless Function — Groq chat proxy.
// APIキーをブラウザに置かず、サーバの環境変数 GROQ_API_KEY で代理実行する。
//   GET  /api/chat        -> { ready: <bool> }  （キーが設定済みかの確認用）
//   POST /api/chat {system,user,model,maxTokens} -> { reply, model }
// モデルのフォールバック（429時の20B/70B切替）はクライアント側のキューが担当するため、
// ここは指定モデル1つを叩く薄い実装にする。

async function readJson(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  return await new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  const key = process.env.GROQ_API_KEY;
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    res.status(200).json({ ready: !!key });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  if (!key) {
    // サーバにキーが無い（ローカル等）→ クライアントは自分のキーにフォールバックする
    res.status(501).json({ error: 'no_server_key' });
    return;
  }

  let body;
  try { body = await readJson(req); } catch { body = {}; }
  const { system, user, model, maxTokens } = body || {};
  if (!user) { res.status(400).json({ error: 'missing user message' }); return; }

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 20000);
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: ac.signal,
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: model || 'openai/gpt-oss-120b',
        max_tokens: maxTokens || 400,
        messages: [
          { role: 'system', content: system || '' },
          { role: 'user', content: user },
        ],
      }),
    });
    clearTimeout(t);
    const j = await r.json().catch(() => ({}));
    if (r.status === 429) { res.status(429).json({ error: 'rate_limited' }); return; }
    if (!r.ok) { res.status(502).json({ error: 'groq ' + r.status + ' ' + JSON.stringify(j).slice(0, 160) }); return; }
    res.status(200).json({ reply: j.choices?.[0]?.message?.content || '', model: model || 'openai/gpt-oss-120b' });
  } catch (e) {
    res.status(502).json({ error: 'upstream failed: ' + String(e && e.message || e) });
  }
}
