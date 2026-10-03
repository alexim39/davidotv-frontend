#!/usr/bin/env node
/**
 * Design token guard — 30BG Midnight zero-state enforcement.
 * Fails (exit 1) on banned literals reintroduced into projects/tv/src:
 *   1. Brand bans: #3f51b5 (indigo), #8f0045 (legacy maroon)
 *   2. Gray text/borders: #666 #888 #999 #ccc #333, bare `gray`
 *      (code only — comments stripped; rgba(0,0,0,*) scrims on backgrounds stay legal)
 *   3. Shape drift: radius px literals in non-radius props (token defs excluded)
 *   4. Type floor: font-size 9/10/11px or 0.65/0.6875/0.7rem
 * Usage: npm run lint:tokens. Wired into .github/workflows/design-guard.yml.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'projects', 'tv', 'src');
const SKIP_FILES = new Set(['_tokens.scss', '_variables.scss']);
const SKIP_SUFFIX = '.spec.ts';

const HEX3 = (alts) => new RegExp(`#(?:${alts})(?:${alts})?\\b`, 'gi');

const RULES = [
  {
    name: 'banned brand hex (#3f51b5/#8f0045)',
    rx: /#(?:3f51b5|8f0045)\b/gi,
    excludeFiles: null,
  },
  {
    name: 'legacy gray literal (#666/#888/#999/#ccc/#333/#606060/#555/#444 or bare gray)',
    rx: new RegExp(`${HEX3('666|888|999|ccc|333|606060|555|555555|444|444444').source}|\\bgray\\b`, 'gi'),
    excludeFiles: null,
  },
  {
    name: 'dark-on-dark text (color/fill: rgba(0,0,0,…))',
    // background(-color) scrims are legitimate dimmers; only exact `color:`
    // or `fill:` kills text. The prop class excludes `background-color`.
    rx: /(?:^|[;{\s])((?:background-)?color|fill)\s*:\s*rgba\(\s*0\s*,\s*0\s*,\s*0\b/gi,
    textPropOnly: true,
  },
];

function stripComments(src, ext) {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat((m.match(/\n/g) || []).length));
  if (ext === '.scss' || ext === '.ts') {
    out = out
      .split('\n')
      .map((line) => {
        const idx = line.indexOf('//');
        if (idx === -1) return line;
        // keep URL schemes (https://…) intact
        if (/https?:\s*$/.test(line.slice(0, idx).trimEnd()) || /:\s*\/$/.test(line.slice(0, idx))) return line;
        return line.slice(0, idx);
      })
      .join('\n');
  }
  return out;
}

function radiusViolations(code, file) {
  // Precise: border[-corner]-radius declarations holding a px literal.
  // Spacing props (padding:18px, gap:12px) are the spacing scale, not shape drift.
  // Skips token plumbing: --dt-* defs, $var defs, var(--dt-*) usage.
  const hits = [];
  code.split('\n').forEach((line, i) => {
    if (/^\s*\$[\w-]+\s*:/.test(line) || /--dt-[\w-]+\s*:/.test(line)) return;
    const decl = line.match(/border(?:-[a-z]+)*-radius\s*:\s*([^;{}]+)/i);
    if (!decl) return;
    if (/var\(--dt-/.test(decl[1])) return;
    const px = decl[1].match(/\b\d+px\b/);
    if (px) hits.push({ file, line: i + 1, rule: 'radius px literal (use --dt-radius-*)', text: line.trim().slice(0, 160) });
  });
  return hits;
}

function typeFloorViolations(code, file) {
  const hits = [];
  code.split('\n').forEach((line, i) => {
    if (!line.includes('font-size')) return;
    for (const seg of line.split(';')) {
      const prop = (seg.match(/([a-zA-Z-]+)\s*:/) || [])[1];
      if ((prop || '').toLowerCase() !== 'font-size') continue;
      if (/\b(9|10|11)px\b/.test(seg) || /\b0\.(65|6875|7)rem\b/.test(seg)) {
        hits.push({ file, line: i + 1, rule: 'sub-floor font-size', text: line.trim().slice(0, 160) });
        break;
      }
    }
  });
  return hits;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|scss)$/.test(e.name)) out.push(p);
  }
  return out;
}

const violations = [];
for (const file of walk(SRC)) {
  const base = path.basename(file);
  if (SKIP_FILES.has(base) || base.endsWith(SKIP_SUFFIX)) continue;
  const ext = path.extname(file);
  const raw = fs.readFileSync(file, 'utf8');
  const code = stripComments(raw, ext);
  const rel = path.relative(path.join(__dirname, '..'), file);
  for (const rule of RULES) {
    const rx = new RegExp(rule.rx.source, rule.rx.flags);
    let m;
    while ((m = rx.exec(code))) {
      if (rule.textPropOnly && !/^(color|fill)$/i.test(m[1] || '')) continue;
      const lineNo = code.slice(0, m.index).split('\n').length;
      const line = code.split('\n')[lineNo - 1].trim().slice(0, 160);
      violations.push({ file: rel, line: lineNo, rule: rule.name, text: line });
    }
  }
  violations.push(...radiusViolations(code, rel));
  violations.push(...typeFloorViolations(code, rel));
}

if (violations.length) {
  console.error(`token-guard: ${violations.length} violation(s):`);
  for (const v of violations.slice(0, 50)) console.error(`  ${v.file}:${v.line} [${v.rule}] ${v.text}`);
  if (violations.length > 50) console.error(`  …and ${violations.length - 50} more`);
  process.exit(1);
}
console.log('token-guard: clean (0 violations)');
