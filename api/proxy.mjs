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
    'export.arxiv.org', 'arxiv.org', 'rss.arxiv.org',
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
  // arXiv / Semantic Scholar はクラウドの共有IPだと 429 が多発するため、
  // ①429時は少し待ってリトライ ②成功レスポンスはCDNでキャッシュ(stale-while-revalidate)し、
  //   以降はarXivを叩かずCDNから配信。失敗時も直近の成功コピーを返せるようにする。
  const cacheable = /(^|\.)arxiv\.org$/.test(host) || host === 'api.semanticscholar.org';
  const fetchOnce = async (ms) => {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    try {
      return await fetch(target, {
        signal: ac.signal,
        headers: { 'user-agent': 'MorningResearchOS/1.0 (+https://morning-research-os-p9dn.vercel.app)', 'accept': '*/*' },
      });
    } finally { clearTimeout(t); }
  };
  try {
    let r = await fetchOnce(11000);
    // 429/5xx は最大2回リトライ（レート制限ウィンドウをずらす）
    for (let i = 0; i < 2 && (r.status === 429 || r.status >= 500); i++) {
      await new Promise(res2 => setTimeout(res2, 1500 * (i + 1)));
      r = await fetchOnce(11000);
    }
    const body = await r.text();
    const ct = r.headers.get('content-type') || 'text/plain; charset=utf-8';
    res.setHeader('content-type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (cacheable && r.ok) {
      // 一度成功すれば30分はCDNから配信、最大1日はstaleを返しつつ裏で更新
      res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    } else {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
    }
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ error: 'upstream failed: ' + String(e && e.message || e) });
  }
}
