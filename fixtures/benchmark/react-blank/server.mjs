import http from 'node:http';

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html' });
  response.end('<html><body>   </body></html>');
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  console.log(`Local: http://127.0.0.1:${address.port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
