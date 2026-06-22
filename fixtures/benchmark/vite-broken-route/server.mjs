import http from 'node:http';

const server = http.createServer((request, response) => {
  if (request.url === '/missing') {
    response.writeHead(404, { 'content-type': 'text/html' });
    response.end('<html><body>Not found</body></html>');
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html' });
  response.end('<html><body><main>Home</main><a href="/missing">Missing</a></body></html>');
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  console.log(`Local: http://127.0.0.1:${address.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
