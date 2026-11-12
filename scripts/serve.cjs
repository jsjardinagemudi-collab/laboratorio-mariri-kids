// Servidor de desenvolvimento opcional, apenas com módulos nativos do Node.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const portIndex = process.argv.lastIndexOf('--port');
const port = Number(process.env.PORT || (portIndex >= 0 && process.argv[portIndex + 1]) || 3000);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? '/index.html' : pathname;
    const file = path.resolve(root, '.' + relative);
    if (!file.startsWith(root + path.sep) || relative.split('/').some(part => part.startsWith('.'))) {
      res.writeHead(403); return res.end('Forbidden');
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch (_) { res.writeHead(400); res.end('Bad request'); }
}).listen(port, '0.0.0.0', () => console.log(`Jardim das Descobertas em http://localhost:${port}`));
