const http = require('http');
const fs = require('fs');
const path = require('path');
const MIME = {'.html':'text/html','.css':'text/css','.js':'application/javascript'};
const srv = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const f = path.join(__dirname, '..', p);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'text/plain'});
    res.end(d);
  });
});
srv.listen(8477, () => console.log('serving on 8477'));
