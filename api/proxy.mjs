// Vercel Serverless Function — same-origin CORS proxy.
// Public CORS proxies (allorigins/corsproxy/codetabs) are flaky on mobile networks,
// so on production we proxy through our own origin for reliable Market/News/Research data.
export default async function handler(req, res) {
  const target = req.query.url;
  if (!target || !/^https?:\/\//i.test(target)) {
    res.status(400).json({ error: 'missing or invalid url param' });
    return;
  }
  // Allow-list hosts we actually call, to avoid being an open proxy.
  const ALLOW = [
    'query1.finance.yahoo.com', 'query2.finance.yahoo.com',
    'export.arxiv.org', 'arxiv.org',
    'www.nhk.or.jp', 'www3.nhk.or.jp', 'news.yahoo.co.jp',
    'feeds.bbci.co.uk', 'bbci.co.uk', 'www.aljazeera.com', 'aljazeera.com',
    'api.semanticscholar.org', 'wttr.in',
  ];
  let host;
  try { host = new URL(target).hostname; } catch { res.status(400).json({ error: 'bad url' }); return; }
  if (!ALLOW.some(h => host === h || host.endsWith('.' + h))) {
    res.status(403).json({ error: 'host not allowed: ' + host });
    return;
  }
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 12000);
    const r = await fetch(target, {
      signal: ac.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (MorningOS proxy)', 'accept': '*/*' },
    });
    clearTimeout(t);
    const body = await r.text();
    const ct = r.headers.get('content-type') || 'text/plain; charset=utf-8';
    res.setHeader('content-type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ error: 'upstream failed: ' + String(e && e.message || e) });
  }
}
