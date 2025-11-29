export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token, Content-Type');
    return res.status(200).end();
  }

  // Get the path from the request
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';
  
  // Get the API key from the request headers
  const apiKey = req.headers['x-auth-token'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing X-Auth-Token header' });
  }

  // Build query string from request query parameters (excluding 'path')
  const queryParams = { ...req.query };
  delete queryParams.path; // Remove the path parameter
  const queryString = new URLSearchParams(queryParams).toString();
  const queryPart = queryString ? `?${queryString}` : '';
  
  // Build the target URL
  const targetUrl = `https://api.football-data.org/v4/${apiPath}${queryPart}`;
  
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

    const data = await response.json();
    
    // Forward the response with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token, Content-Type');
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request', message: error.message });
  }
}

