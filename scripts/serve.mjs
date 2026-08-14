import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const root = process.cwd();
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webmanifest':'application/manifest+json' };
createServer(async (request, response) => {
  try {
    const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname)).replace(/^(\.\.(\/|\\|$))+/, '');
    let file = join(root, path === '/' ? 'index.html' : path);
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(Number(process.env.PORT ?? 4173), () => console.log(`Spurgo Flow 8: http://localhost:${process.env.PORT ?? 4173}`));
