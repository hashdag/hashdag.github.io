'use strict';

const fs = require('fs');
const path = require('path');

const ENTRIES_PATH = path.join(__dirname, 'entries.json');
const OUT_DIR = path.join(__dirname, 'site', 'hashdag');

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
  return `<div class="entry">
  <div class="meta">${escapeHTML(e.timestamp)}${tagSpans}</div>
  <div class="body">${paragraphs}</div>
</div>`;
}

function buildHTML(entries) {
  const body = entries.map(renderEntry).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>hashd.ag</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital@0;1&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { --bg: #0f0f0e; --ink: #d4d0c8; --dim: #6b6860; --rule: #1e1d1b; }
html { font-size: 14px; }
body { background: var(--bg); color: var(--ink); font-family: 'IBM Plex Mono', monospace; line-height: 1.7; max-width: 680px; margin: 0 auto; padding: 3rem 1.5rem 6rem; }
.sig { font-size: 11px; letter-spacing: 0.14em; color: var(--dim); margin-bottom: 4rem; display: block; }
.entry { margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 0.5px solid var(--rule); }
.entry:last-of-type { border-bottom: none; }
.meta { font-size: 10px; letter-spacing: 0.06em; color: var(--dim); margin-bottom: 0.8rem; }
.tag { margin-left: 0.6em; }
.body { font-size: 13px; color: var(--ink); line-height: 1.8; }
.body p + p { margin-top: 0.85em; }
</style>
</head>
<body>
<span class="sig">hashd.ag</span>
${body}
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

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), buildHTML(sorted), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'raw.txt'), buildRaw(sorted), 'utf8');

console.log(`built ${sorted.length} entries → site/hashdag/index.html + raw.txt`);
