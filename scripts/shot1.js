// Verifikasi headless: buka dashboard, kumpulkan error console, screenshot tiap tab
const { execFile } = require('child_process');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'C:/Users/syahr/AppData/Local/hermes/cache/scratch';

const args = [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  '--enable-logging=stderr', '--v=0',
  '--virtual-time-budget=8000',
  '--window-size=1440,1000',
  '--screenshot=' + OUT + '/dash_overview.png',
  'http://localhost:8477/'
];
execFile(CHROME, args, { timeout: 60000 }, (err, stdout, stderr) => {
  const lines = String(stderr).split('\n').filter(l =>
    /CONSOLE|ERROR|error|Uncaught/i.test(l) && !/GCM|gpu|dawn|Fallback|Font|network_change/i.test(l));
  console.log('--- console/error lines ---');
  console.log(lines.slice(0, 30).join('\n') || '(bersih)');
});
