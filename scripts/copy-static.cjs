const fs = require('node:fs');
for (const file of ['robots.txt', 'sitemap.xml', '.htaccess']) {
  fs.copyFileSync(`public/${file}`, `dist/${file}`);
}
// Parcel treats noscript contents as text, so copy its fallback stylesheet explicitly.
fs.mkdirSync('dist/css', { recursive: true });
fs.copyFileSync('src/css/nojs.css', 'dist/css/nojs.css');
