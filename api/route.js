module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, query, startX, startY, endX, endY } = req.query;

  if (type === 'address') {
    try {
      const r1 = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}&size=5`,
        { headers: { Authorization: 'KakaoAK 919c3312f6ce069ca2076328c40b4a56' } }
      );
      const d1 = await r1.json();
      if (d1.documents && d1.documents.length) return res.status(200).json(d1);

      const r2 = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`,
        { headers: { Authorization: 'KakaoAK 919c3312f6ce069ca2076328c40b4a56' } }
      );
      const d2 = await r2.json();
      return res.status(200).json(d2);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (type === 'route') {
    try {
      const r = await fetch('https://apis.openapi.sk.com/tmap/routes?version=1&format=json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'appKey': 'EPMc1DKBPk7bejPe51Vlm8t9PeCjuAmO78LMKmIl',
        },
        body: JSON.stringify({
          startX: String(startX), startY: String(startY),
          endX: String(endX), endY: String(endY),
          reqCoordType: 'WGS84GEO', resCoordType: 'WGS84GEO',
          startName: '출발지', endName: '도착지',
          trafficInfo: 'Y', tollgateFareOption: 16,
        }),
      });
      const d = await r.json();
      return res.status(200).json(d);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'type 필요' });
};
