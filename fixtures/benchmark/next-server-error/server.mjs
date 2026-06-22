import http from 'node:http';

const server = http.createServer((request, response) => {
  if (request.url === '/api/fail') {
    response.writeHead(500, { 'content-type': 'text/plain' });
    response.end('server error');
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html' });
  response.end('<html><body><main>Home</main><a href="/api/fail">Failing API</a></body></html>');
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  console.log(`Local: http://127.0.0.1:${address.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
