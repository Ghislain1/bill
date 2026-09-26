const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.mp4':'video/mp4','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req, res) => {
  let filename;
  try { filename = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400).end(); return; }
  if (filename === root) filename = path.join(root, 'index.html');
  if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://www.googletagmanager.com/gtag/; style-src 'self'; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self'; media-src 'self'; connect-src https://*.google-analytics.com https://*.google.com https://www.googletagmanager.com; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  fs.createReadStream(filename).pipe(res);
}).listen(4200, '127.0.0.1');
