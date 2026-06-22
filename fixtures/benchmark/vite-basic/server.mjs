import http from 'node:http';

const server = http.createServer((request, response) => {
  if (request.url === '/settings') {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end('<html><body><main>Settings</main></body></html>');
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html' });
  response.end('<html><body><main>Ready</main><a href="/settings">Settings</a><button>Save</button></body></html>');
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  console.log(`Local: http://127.0.0.1:${address.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
