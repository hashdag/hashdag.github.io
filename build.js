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

function renderEntry(e, noFold) {
  const tagSpans = e.tags.length
    ? e.tags.map(t => `<span class="tag">[${escapeHTML(t)}]</span>`).join('')
    : '';
  const paragraphs = e.body
    .split('\n\n')
    .map(p => `<p>${escapeHTML(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
  const noFoldAttr = noFold ? ' data-nofold="1"' : '';
  return `<div class="entry"${noFoldAttr}>
  <div class="meta">${escapeHTML(e.timestamp)}${tagSpans}</div>
  <div class="body">${paragraphs}</div>
</div>`;
}

function buildHTML(entries, active) {
  // active: null | 'kaspa' | 'staghunt'
  const rawHref = active ? `/${active}/raw.txt` : '/raw';

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
    `<a class="handle" href="${rawHref}">raw</a>`,
  ].join('&nbsp;&nbsp;');

  const title = active ? `hashd.ag / ${active}` : 'hashd.ag';
  const body = entries.map((e, i) => renderEntry(e, i < 2)).join('\n');

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
html { font-size: 11px; }
body { background: #fafafa; color: #1a1a1a; font-family: 'IBM Plex Mono', monospace; line-height: 1.7; max-width: 680px; margin: 0 auto; padding: 20px 1.5rem 4rem; }
.header { margin-bottom: 8px; }
.sig { font-size: 11px; color: #1a1a1a; display: block; text-decoration: none; }
.handles { font-size: 11px; color: #999; text-align: right; }
.handle { color: #999; text-decoration: none; }
.handle:hover { text-decoration: underline; }
.handle.active { color: #1a1a1a; }
.header-gap { height: 8px; }
.entries-gap { height: 0.6rem; }
.entry { position: relative; margin-bottom: 0.7rem; padding-bottom: 0.7rem; border-bottom: 0.5px solid #e8e8e8; }
.entry:last-of-type { border-bottom: none; }
.meta { font-size: 10px; color: #888; margin-bottom: 0.2rem; }
.tag { margin-left: 0.6em; font-size: 11px; letter-spacing: 0.02em; }
.body { font-size: 11px; color: #1a1a1a; line-height: 1.7; }
.body p + p { margin-top: 0.5em; }
.body.folded { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.fold-toggle { position: absolute; left: -1.2em; cursor: pointer; font-size: 10px; color: #888; font-family: inherit; user-select: none; line-height: 1.7; }
</style>
</head>
<body>
<div class="header">
${sigHTML}
<div class="header-gap"></div>
<div class="handles">${handlesHTML}</div>
</div>
<div class="entries-gap"></div>
${body}
<script>
(function(){
  document.querySelectorAll('.entry:not([data-nofold])').forEach(function(entry){
    var body = entry.querySelector('.body');
    if (!body) return;
    var lh = parseFloat(getComputedStyle(body).lineHeight);
    if (body.scrollHeight <= lh * 3 + 1) return;
    body.classList.add('folded');
    var g = document.createElement('span');
    g.className = 'fold-toggle';
    g.textContent = '+';
    g.style.top = body.offsetTop + 'px';
    g.onclick = function(){ body.classList.toggle('folded'); g.textContent = body.classList.contains('folded') ? '+' : '\u2212'; };
    entry.appendChild(g);
  });
})();
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

// Filtered views
for (const [name, filterFn] of Object.entries(FILTERS)) {
  const filtered = sorted.filter(filterFn);
  const dir = path.join(OUT_DIR, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildHTML(filtered, name), 'utf8');
  fs.writeFileSync(path.join(dir, 'raw.txt'), buildRaw(filtered), 'utf8');
  console.log(`built ${filtered.length} entries → ${name}/index.html + raw.txt`);
}
