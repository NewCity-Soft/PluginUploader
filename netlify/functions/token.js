exports.handler = async (event) => {
  // 处理 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { code, redirect_uri } = JSON.parse(event.body);

    if (!code) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'Missing code' }) 
      };
    }

    const client_id = process.env.GITHUB_CLIENT_ID || 'Ov23liDf9IeTPqBf8zX0';
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    if (!client_secret) {
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: 'Server configuration error: Missing GITHUB_CLIENT_SECRET env var' }) 
      };
    }

    const exchangeBody = {
      client_id,
      client_secret,
      code,
    };

    if (redirect_uri) {
      exchangeBody.redirect_uri = redirect_uri;
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(exchangeBody),
    });

    const data = await response.json();
    return {
      statusCode: data.error ? 400 : 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
};
