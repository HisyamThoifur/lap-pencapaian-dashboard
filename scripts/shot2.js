// Screenshot semua tab via Chrome DevTools Protocol (tanpa dependensi eksternal)
const { execFile } = require('child_process');
const http = require('http');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'C:/Users/syahr/AppData/Local/hermes/cache/scratch';
const PORT = 9223, APP = 'http://localhost:8477/';

function launchChrome() {
  return new Promise((resolve, reject) => {
    const proc = execFile(CHROME, [
      '--headless=new', '--remote-debugging-port=' + PORT,
      '--user-data-dir=' + OUT + '/cdp-profile',
      '--no-sandbox', '--disable-gpu',
      '--window-size=1440,1000'
    ], { timeout: 120000 }, () => {});
    setTimeout(() => resolve(proc), 3500);
  });
}

function jget(path) {
  return new Promise((res, rej) => {
    http.get({ host: '127.0.0.1', port: PORT, path }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}
function jpost(ws, method, params, id) {
  return JSON.stringify({ id, method, params: params || {} });
}

(async () => {
  await launchChrome();
  const list = await jget('/json/list');
  const page = list.find(t => t.type === 'page');
  const wsUrl = page.webSocketDebuggerUrl;

  // WebSocket minimal
  const WebSocket = (() => {
    try { return require('ws'); } catch { return null; }
  })();
  if (!WebSocket) { console.log('NO_WS_MODULE'); process.exit(2); }

  const ws = new WebSocket(wsUrl, { perMessageDeflate: false });
  const send = (method, params, id) => ws.send(jpost(ws, method, params, id));
  let nextId = 1;
  const pending = {};
  const call = (method, params) => new Promise(res => {
    const id = nextId++; pending[id] = res; send(method, params, id);
  });

  ws.on('message', d => {
    const m = JSON.parse(d);
    if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
  });
  ws.on('open', async () => {
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Page.navigate', { url: APP });
    await new Promise(r => setTimeout(r, 4000));

    // cek error console
    const errs = [];
    ws.on('message', d => {
      const m = JSON.parse(d);
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
        errs.push(m.params.args.map(a => a.value).join(' '));
      if (m.method === 'Runtime.exceptionThrown')
        errs.push(m.params.exceptionDetails.text);
    });

    // screenshot overview
    let r = await call('Page.captureScreenshot', { format: 'png' });
    require('fs').writeFileSync(OUT + '/dash_overview.png', Buffer.from(r.result.data, 'base64'));

    for (const tab of ['indicators', 'trend', 'infografis']) {
      await call('Runtime.evaluate', { expression: `document.querySelector('.tab[data-tab="${tab}"]').click()` });
      await new Promise(r => setTimeout(r, 1600));
      r = await call('Page.captureScreenshot', { format: 'png' });
      require('fs').writeFileSync(OUT + `/dash_${tab}.png`, Buffer.from(r.result.data, 'base64'));
    }

    // verifikasi konten DOM kunci
    const check = await call('Runtime.evaluate', { expression: `(() => { try { return JSON.stringify({
      kpi: document.querySelectorAll('.kpi').length,
      heat: document.querySelectorAll('.heat-cell').length,
      rows: document.querySelectorAll('#indTable tr').length,
      heatrows: document.querySelectorAll('#heatTable tr').length,
      analisa: document.querySelectorAll('.sa-block').length,
      cause: document.querySelectorAll('.cbar').length,
      charts: document.querySelectorAll('canvas').length,
      ihstats: document.querySelectorAll('.ih-stat').length
    }); } catch (e) { return 'ERR:' + e.message; } })()`, returnByValue: true });
    console.log('DOM:', check.result ? check.result.value : JSON.stringify(check).slice(0, 400));
    console.log('CONSOLE ERRORS:', errs.length ? errs.join(' || ') : 'NONE');
    ws.close();
    process.exit(0);
  });
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
