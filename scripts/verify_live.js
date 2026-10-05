// Verifikasi visual LIVE dari deployment Vercel (Chrome headless + CDP)
// Screenshot + hitung elemen DOM + kumpulkan error console
const { execFile } = require('child_process');
const http = require('http');
const fs = require('fs');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'C:/Users/syahr/AppData/Local/hermes/cache/scratch';
const PORT = 9227;
const URL = process.argv[2] || 'https://lap-pencapaian-dashboard-kacrut.vercel.app/';

function launchChrome() {
  return new Promise((resolve) => {
    const proc = execFile(CHROME, [
      '--headless=new', '--remote-debugging-port=' + PORT,
      '--user-data-dir=' + OUT + '/cdp-live-profile',
      '--no-sandbox', '--disable-gpu', '--window-size=1440,1000'
    ], { timeout: 180000 }, () => {});
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

(async () => {
  await launchChrome();
  const list = await jget('/json/list');
  const page = list.find(t => t.type === 'page');
  const WebSocket = require('C:/Users/syahr/lap-pencapaian-dashboard/node_modules/ws');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false });
  let nextId = 1;
  const pending = {};
  const call = (method, params) => new Promise(res => {
    const id = nextId++; pending[id] = res;
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
  const errs = [];
  const netFails = [];
  ws.on('message', d => {
    const m = JSON.parse(d);
    if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      errs.push(m.params.args.map(a => a.value).join(' '));
    if (m.method === 'Runtime.exceptionThrown')
      errs.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || '').slice(0, 200));
    if (m.method === 'Network.loadingFailed')
      netFails.push(m.params.errorText + ' ' + (m.params.blockedReason || ''));
  });
  ws.on('open', async () => {
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Network.enable');
    await call('Page.navigate', { url: URL });
    await new Promise(r => setTimeout(r, 9000));

    const stats = await call('Runtime.evaluate', { returnByValue: true, expression: `(() => { try {
      const txt = document.body.innerText.slice(0, 500);
      return JSON.stringify({
        kpi: document.querySelectorAll('.kpi').length,
        kpiText: (document.querySelector('.kpi .k-num')||{}).textContent || null,
        heat: document.querySelectorAll('.heat-cell').length,
        rows: document.querySelectorAll('#indTable tr').length,
        saBlocks: document.querySelectorAll('.sa-block').length,
        charts: document.querySelectorAll('canvas').length,
        hasLAP: typeof LAP !== 'undefined',
        lapH: (typeof LAP !== 'undefined') ? LAP.rekap['H'].rata : null,
        bodySnippet: txt.replace(/\\s+/g,' ').slice(0, 260)
      }); } catch(e) { return 'ERR:' + e.message; } })()` });
    console.log('DOM:', stats.result ? stats.result.value : JSON.stringify(stats).slice(0, 300));

    const shot = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(OUT + '/vercel_live.png', Buffer.from(shot.result.data, 'base64'));
    console.log('CONSOLE ERRORS:', errs.length ? errs.join(' || ').slice(0, 500) : 'NONE');
    console.log('NET FAILS:', netFails.length ? netFails.join(' || ') : 'NONE');
    ws.close();
    process.exit(0);
  });
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
