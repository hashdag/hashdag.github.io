#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const ENTRIES_PATH = path.join(ROOT, 'entries.json');

function load() {
  return JSON.parse(fs.readFileSync(ENTRIES_PATH, 'utf8'));
}

function save(entries) {
  fs.writeFileSync(ENTRIES_PATH, JSON.stringify(entries, null, 2) + '\n', 'utf8');
}

function genId() {
  const ts = Math.floor(Date.now() / 1000);
  const hex = Math.random().toString(16).slice(2, 6).padEnd(4, '0');
  return `${ts}_${hex}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function find(entries, prefix) {
  const matches = entries.filter(e => e.id.startsWith(prefix) || e.id.split('_')[1].startsWith(prefix));
  if (matches.length === 0) { console.error(`No entry matching "${prefix}"`); process.exit(1); }
  if (matches.length > 1) { console.error(`Ambiguous: "${prefix}" matches ${matches.length} entries. Use more characters.`); process.exit(1); }
  return matches[0];
}

function rebuild() {
  execSync(`node "${path.join(ROOT, 'build.js')}"`, { stdio: 'inherit' });
}

function commit(msg) {
  execSync(`git -C "${ROOT}" add entries.json "site/hashdag/index.html" "site/hashdag/raw.txt"`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" commit -m "${msg}"`, { stdio: 'inherit' });
  execSync(`git -C "${ROOT}" push origin main`, { stdio: 'inherit' });
}

const [,, cmd, ...args] = process.argv;

function getArg(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

if (cmd === 'add') {
  const rawTags = getArg('--tags');
  const body = getArg('--body');
  const timestamp = getArg('--date') || today();
  const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : [];
  if (!body) { console.error('--body is required'); process.exit(1); }
  const entry = {
    id: genId(),
    timestamp,
    tags,
    body,
    weight: 0,
    created_at: new Date().toISOString()
  };
  const entries = load();
  entries.push(entry);
  save(entries);
  console.log(`added ${entry.id}`);
  rebuild();
  commit(`add ${entry.id.slice(-4)}`);

} else if (cmd === 'pin') {
  if (!args[0]) { console.error('usage: hashdag pin <id>'); process.exit(1); }
  const entries = load();
  const e = find(entries, args[0]);
  e.weight = 100;
  save(entries);
  rebuild();
  commit(`pin ${args[0]}`);

} else if (cmd === 'unpin') {
  if (!args[0]) { console.error('usage: hashdag unpin <id>'); process.exit(1); }
  const entries = load();
  const e = find(entries, args[0]);
  e.weight = 0;
  save(entries);
  rebuild();
  commit(`unpin ${args[0]}`);

} else if (cmd === 'weight') {
  if (!args[0] || args[1] === undefined) { console.error('usage: hashdag weight <id> <n>'); process.exit(1); }
  const entries = load();
  const e = find(entries, args[0]);
  e.weight = parseInt(args[1], 10);
  save(entries);
  rebuild();
  commit(`weight ${args[0]} ${args[1]}`);

} else if (cmd === 'delete') {
  if (!args[0]) { console.error('usage: hashdag delete <id>'); process.exit(1); }
  const entries = load();
  const e = find(entries, args[0]);
  const idx = entries.indexOf(e);
  entries.splice(idx, 1);
  save(entries);
  rebuild();
  commit(`delete ${args[0]}`);

} else if (cmd === 'edit') {
  if (!args[0]) { console.error('usage: hashdag edit <id>'); process.exit(1); }
  const entries = load();
  const e = find(entries, args[0]);
  const tmpFile = path.join(os.tmpdir(), `hashdag_${e.id}.txt`);
  fs.writeFileSync(tmpFile, e.body, 'utf8');
  const editor = process.env.EDITOR || (process.platform === 'win32' ? 'notepad' : 'vi');
  const result = spawnSync(editor, [tmpFile], { stdio: 'inherit' });
  if (result.status !== 0) { console.error('Editor exited with error'); process.exit(1); }
  e.body = fs.readFileSync(tmpFile, 'utf8').trimEnd();
  fs.unlinkSync(tmpFile);
  save(entries);
  rebuild();
  commit(`edit ${args[0]}`);

} else if (cmd === 'list') {
  const entries = load();
  const sorted = [...entries].sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return b.timestamp.localeCompare(a.timestamp);
  });
  sorted.forEach(e => {
    const preview = e.body.replace(/\n/g, ' ').slice(0, 60);
    const tags = e.tags.length ? ` [${e.tags.join(',')}]` : '';
    const w = String(e.weight).padStart(5);
    console.log(`${e.id}  ${e.timestamp}  w:${w}  ${preview}…${tags}`);
  });

} else {
  console.log(`hashdag — content CLI for hashd.ag

usage:
  hashdag add --body "..." [--tags "t1,t2"] [--date YYYY-MM-DD]
  hashdag pin <id>            set weight to 100 (canon)
  hashdag unpin <id>          set weight to 0 (stream)
  hashdag weight <id> <n>     set weight to n
  hashdag edit <id>           open body in $EDITOR
  hashdag delete <id>         remove entry
  hashdag list                show all entries sorted by weight then date

weight convention:
  100      top-tier canon
  50–99    secondary canon
  0        stream (default)
  negative pushed to bottom

<id> can be a prefix of the full id or just the 4-char hex suffix.`);
}
