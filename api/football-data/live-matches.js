export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://sport-data.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://api.football-data.org/v4/matches?status=LIVE', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY, // set in Vercel dashboard
      },
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', 'https://sport-data.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}