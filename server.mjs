import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8', '.json': 'application/json; charset=utf-8'
};
const port = Number(process.env.PORT ?? 5174);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('PORT must be 1–65535');

const headers = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
};
createServer(async (request, response) => {
  const method = request.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    response.writeHead(405, {...headers, Allow: 'GET, HEAD'}).end();
    return;
  }
  try {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    const rawPath = decodeURIComponent(pathname);
    if (rawPath.includes('\0')) throw Object.assign(Error('Invalid path'), {code:'BAD_PATH'});
    const filePath = resolve(root, '.' + (rawPath === '/' ? '/index.html' : rawPath));
    if (!filePath.startsWith(root + sep)) {
      response.writeHead(403, headers).end('Forbidden');
      return;
    }
    const info = await stat(filePath);
    if (!info.isFile()) {
      response.writeHead(404, headers).end('Not found');
      return;
    }
    const ext = extname(filePath).toLowerCase();
    const cache = ext === '.html' || ext === '.css' || ext === '.js' ? 'no-cache' : 'public, max-age=3600';
    response.writeHead(200, { ...headers, 'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
      'Content-Length': info.size, 'Cache-Control': cache });
    if (method === 'HEAD') {response.end();return;}
    response.end(await readFile(filePath));
  } catch (error) {
    const bad = error?.code === 'ENOENT' || error?.code === 'ENOTDIR' || error?.code === 'EISDIR' || error?.code === 'BAD_PATH';
    response.writeHead(bad ? 404 : 500, headers).end(bad ? 'Not found' : 'Internal server error');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`ZOND Labs: http://localhost:${port}`);
  console.log(`На телефоне в той же сети: http://<IP-MacBook>:${port}`);
});
