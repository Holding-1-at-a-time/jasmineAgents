const http = require('http');

const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const PROXY_PORT = 3000;

console.log('Starting proxy server...');

const server = http.createServer((req, res) => {
  console.log(`[Proxy] ${req.method} ${req.url}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url.startsWith('/api/ollama/')) {
    const urlPath = req.url.substring('/api/ollama'.length);
    const targetPath = '/v1' + urlPath;
    
    console.log(`[Proxy] Forwarding to http://${OLLAMA_HOST}:${OLLAMA_PORT}${targetPath}`);

    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${OLLAMA_HOST}:${OLLAMA_PORT}`
      }
    };
    
    delete options.headers['authorization'];
    delete options.headers['Authorization'];
    delete options.headers['content-length']; 

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (e) => {
      console.error(`[Proxy] Upstream Error: ${e.message}`);
      res.writeHead(502);
      res.end(`Upstream Error: ${e.message}`);
    });

    req.pipe(proxyReq, { end: true });
  } else {
    res.writeHead(404);
    res.end('Not Found. Point OLLAMA_BASE_URL to /api/ollama');
  }
});

server.listen(PROXY_PORT, () => {
  console.log(`Standalone Proxy running on port ${PROXY_PORT}`);
  console.log(`Forwarding /api/ollama/* -> http://localhost:11434/v1/*`);
});

server.on('error', (e) => {
    console.error('Server error:', e);
});
