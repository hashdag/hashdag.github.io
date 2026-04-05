'use strict';

const fs = require('fs');
const path = require('path');

const ENTRIES_PATH = path.join(__dirname, 'entries.json');
const OUT_DIR = path.join(__dirname, 'site', 'hashdag');

const FILTERS = {
  kaspa:    e => e.tags.some(t => ['kaspa','koko'].includes(t)),
  staghunt: e => e.tags.some(t => ['staghunt','stag-hunt','coordination-markets'].includes(t)),
};

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderEntry(e) {
  const tagSpans = e.tags.length
    ? e.tags.map(t => `<span class="tag">[${escapeHTML(t)}]</span>`).join('')
    : '';
  const paragraphs = e.body
    .split('\n\n')
    .map(p => `<p>${escapeHTML(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

  const plain = e.body.replace(/\n/g, ' ');
  const isLong = plain.length > 200;

  const pdfLink = e.pdf
    ? `\n  <div class="meta pdf-link"><a href="/${escapeHTML(e.pdf)}"><strong>pdf</strong></a></div>`
    : '';
  const toggle = isLong ? `\n  <span class="toggle">\u2026[+]</span>` : '';

  return `<div class="entry">
  <div class="meta">${escapeHTML(e.timestamp)}${tagSpans}</div>${pdfLink}
  <div class="body${isLong ? ' clipped' : ''}">${paragraphs}</div>${toggle}
</div>`;
}

function buildHTML(entries, active) {
  const sigHTML = active
    ? `<a class="sig" href="/">hashd.ag</a>`
    : `<span class="sig">hashd.ag</span>`;

  function handle(name, label) {
    if (name === active) return `<span class="handle active">${label}</span>`;
    return `<a class="handle" href="/${name}">${label}</a>`;
  }

  const handlesHTML = [
    handle('kaspa', 'kaspa'),
    handle('staghunt', 'staghunt'),
    `<a class="handle" href="/raw">raw</a>`,
  ].join('&nbsp;&nbsp;');

  const title = active ? `hashd.ag / ${active}` : 'hashd.ag';
  const body = entries.map(e => renderEntry(e)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital@0;1&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #fafaf8; color: #1a1a1a; font-family: Georgia, serif; font-size: 14px; line-height: 1.75; max-width: 640px; margin: 0 auto; padding: 20px 1.5rem 4rem; }
.header { margin-bottom: 12px; }
.sig { font-family: Georgia, serif; font-size: 14px; color: #1a1a1a; display: block; text-decoration: none; }
.handles { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #999; text-align: right; margin-top: 8px; }
.handle { color: #999; text-decoration: none; }
.handle:hover { text-decoration: underline; }
.handle.active { color: #1a1a1a; }
.entry { margin-bottom: 1.2rem; padding-bottom: 1.2rem; border-bottom: 1px solid #e8e8e8; }
.entry:last-of-type { border-bottom: none; }
.meta { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #999; margin-bottom: 0.3rem; line-height: 1.5; }
.tag { margin-left: 0.5em; letter-spacing: 0.03em; }
.pdf-link { margin-bottom: 0.3rem; }
.pdf-link a { color: #1a1a1a; text-decoration: none; }
.pdf-link a:hover { text-decoration: underline; }
.body { font-size: 14px; color: #1a1a1a; line-height: 1.75; }
.body.clipped { max-height: 5.25rem; overflow: hidden; }
.body p { margin-bottom: 0.8em; }
.body p:last-child { margin-bottom: 0; }
.toggle { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #999; cursor: pointer; user-select: none; display: block; margin-top: -1.5rem; }
.footer { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #999; margin-top: 1.2rem; }
.footer a { color: #999; text-decoration: none; }
.footer a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="header">
${sigHTML}
<div class="handles">${handlesHTML}</div>
</div>
${body}
${active ? '' : '<div class="footer"><a href="/raw">raw.txt</a></div>'}
<script>
document.querySelectorAll('.toggle').forEach(function(g){
  g.onclick = function(){
    var body = g.previousElementSibling;
    if (body.classList.contains('clipped')) {
      body.classList.remove('clipped');
      g.textContent = '[\u2212]';
    } else {
      body.classList.add('clipped');
      g.textContent = '\u2026[+]';
    }
  };
});
</script>
</body>
</html>
`;
}

function buildRaw(entries) {
  const blocks = entries.map(e => {
    const tagStr = e.tags.length ? ' ' + e.tags.map(t => `[${t}]`).join(' ') : '';
    return `[${e.timestamp}]${tagStr}\n${e.body}`;
  });
  return blocks.join('\n---\n') + '\n';
}

function sort(entries) {
  return [...entries].sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return b.timestamp.localeCompare(a.timestamp);
  });
}

const entries = JSON.parse(fs.readFileSync(ENTRIES_PATH, 'utf8'));
const sorted = sort(entries);

// Root
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), buildHTML(sorted, null), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'raw.txt'), buildRaw(sorted), 'utf8');
console.log(`built ${sorted.length} entries → index.html + raw.txt`);

// Dashboard
function buildDashboard(entries) {
  const rows = entries.map(e => {
    const tags = e.tags.join(', ');
    const preview = e.body.replace(/\n/g, ' ').slice(0, 60).trimEnd() + '…';
    return `| ${e.weight} | ${e.timestamp} | ${tags} | ${preview} |`;
  });
  return `| w | date | tags | preview |\n|---|------|------|------|\n${rows.join('\n')}\n`;
}
fs.writeFileSync(path.join(__dirname, 'dashboard.md'), buildDashboard(sorted), 'utf8');
console.log('built dashboard.md');

// Filtered views
for (const [name, filterFn] of Object.entries(FILTERS)) {
  const filtered = sorted.filter(filterFn);
  const dir = path.join(OUT_DIR, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildHTML(filtered, name), 'utf8');
  fs.writeFileSync(path.join(dir, 'raw.txt'), buildRaw(filtered), 'utf8');
  console.log(`built ${filtered.length} entries → ${name}/index.html + raw.txt`);
}
