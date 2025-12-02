export default async function handler(req, res) {
  const allowedOrigins = [
    'https://sport-data.vercel.app',
    'http://localhost:5173' // For local dev
  ];
  
  const origin = req.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : '';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    const { dateFrom, dateTo } = req.query;
    let url = 'https://api.football-data.org/v4/matches';
    
    // Add query parameters if they exist
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Football data API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Set CORS headers for the actual response
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=60');
    
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error in live-matches API:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch matches',
      details: err.message 
    });
  }
}
