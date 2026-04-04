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
html { font-size: 14px; }
body { background: #fafafa; color: #1a1a1a; font-family: 'IBM Plex Mono', monospace; line-height: 1.7; max-width: 680px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.sig { font-size: 14px; color: #1a1a1a; margin-bottom: 1.5rem; display: block; }
.entry { margin-bottom: 1.2rem; padding-bottom: 1.2rem; border-bottom: 0.5px solid #e8e8e8; }
.entry:last-of-type { border-bottom: none; }
.meta { font-size: 14px; color: #888; margin-bottom: 0.3rem; }
.tag { margin-left: 0.5em; }
.body { font-size: 14px; color: #1a1a1a; line-height: 1.7; }
.body p + p { margin-top: 0.7em; }
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
