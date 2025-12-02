export default async function handler(req, res) {
  const allowedOrigins = [
    'https://sport-data.vercel.app',
    'http://localhost:5173', // For local dev
  ];

  const origin = req.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : '';

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { id } = req.query || {};

  if (!id) {
    return res.status(400).json({ error: 'Missing match id' });
  }

  try {
    const response = await fetch(`https://api.football-data.org/v4/matches/${id}`, {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Football data API error: ${response.status}`);
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error in match-details API:', err);
    return res.status(500).json({
      error: 'Failed to fetch match details',
      details: err.message,
    });
  }
}
