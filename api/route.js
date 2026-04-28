export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { type, query, startX, startY, endX, endY } = req.body || req.query;

  // 카카오 주소 검색
  if (type === 'address') {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`,
      { headers: { Authorization: `KakaoAK 919c3312f6ce069ca2076328c40b4a56` } }
    );
    const data = await response.json();
    return res.status(200).json(data);
  }

  // T-map 경로 검색
  if (type === 'route') {
    const response = await fetch(
      'https://apis.openapi.sk.com/tmap/routes?version=1&format=json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'appKey': 'EPMc1DKBPk7bejPe51Vlm8t9PeCjuAmO78LMKmIl',
        },
        body: JSON.stringify({
          startX: String(startX),
          startY: String(startY),
          endX: String(endX),
          endY: String(endY),
          reqCoordType: 'WGS84GEO',
          resCoordType: 'WGS84GEO',
          startName: '출발지',
          endName: '도착지',
          trafficInfo: 'Y',
          tollgateFareOption: 16,
        }),
      }
    );
    const data = await response.json();
    return res.status(200).json(data);
  }

  return res.status(400).json({ error: 'type 파라미터가 필요합니다' });
}
