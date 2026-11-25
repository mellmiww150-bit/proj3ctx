const http = require('http');
let handler = null;
const realCreate = http.createServer;
http.createServer = function (fn) {
  handler = fn;
  return { on(){}, listen(){}, };
};
require('/mnt/data/app.js');
http.createServer = realCreate;

function call(path) {
  return new Promise(function (res) {
    const out = { code: 0, headers: {}, body: '' };
    const r = {
      writeHead(c, h) { out.code = c; out.headers = h || {}; },
      end(b) { out.body = b ? String(b) : ''; res(out); }
    };
    handler({ url: path, method: 'GET', headers: {} }, r);
  });
}

(async () => {
  let a = await call('/');
  console.log('GET /      ->', a.code, '| bytes', a.body.length,
    '| PROJ3CTX:', a.body.indexOf('PROJ') > -1,
    '| fallback page:', a.body.indexOf('ไม่พบไฟล์') > -1,
    '| ctype:', a.headers['content-type']);
  let b = await call('/ping');
  console.log('GET /ping  ->', b.code, b.body);
  let c = await call('/zzz');
  console.log('GET /zzz   ->', c.code, c.body);
})();
