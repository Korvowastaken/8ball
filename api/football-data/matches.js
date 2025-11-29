export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token, Content-Type');
    return res.status(200).end();
  }

  // Get the API key from the request headers
  const apiKey = req.headers['x-auth-token'] || req.headers['X-Auth-Token'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing X-Auth-Token header' });
  }

  // Get query string from request
  const queryString = new URL(req.url, `http://${req.headers.host}`).search;
  
  // Build the target URL
  const targetUrl = `https://api.football-data.org/v4/matches${queryString}`;
  
  console.log('Proxying to:', targetUrl);
  
  try {
    // Forward the request to the API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-Auth-Token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'API request failed', 
        status: response.status,
        message: errorText 
      });
    }

    const data = await response.json();
    
    // Forward the response with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token, Content-Type');
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy request', 
      message: error.message
    });
  }
}

