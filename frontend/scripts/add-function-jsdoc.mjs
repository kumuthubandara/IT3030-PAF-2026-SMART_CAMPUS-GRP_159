/**
 * Inserts short JSDoc above common function shapes when missing:
 * `function` / `export function`, `const x = useCallback`, `const x = useMemo`,
 * `const x = function(`, `const x = (...) =>`, and single-arg `const x = id =>`.
 *
 * Run from repo root: node frontend/scripts/add-function-jsdoc.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "src");

// Match `function` declarations (single line); optional name before `(`.
const FUNC_LINE =
  /^(\s*)((?:export\s+)?(?:default\s+)?(?:async\s+)?)function(?:\s+(\w+))?\s*\(/;

const USECALLBACK_LINE = /^(\s*)const\s+(\w+)\s*=\s*useCallback\s*\(/;
const USEMEMO_LINE = /^(\s*)const\s+(\w+)\s*=\s*useMemo\s*\(/;

// const name = function( …
const CONST_NAMED_FUNCTION =
  /^(\s*)(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function\s*\(/;
// const name = ( … ) =>  or const name = async ( … ) =>
const CONST_ARROW =
  /^(\s*)(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/;
// const name = arg =>  (single parameter without parens)
const CONST_ARROW_UNPAREN =
  /^(\s*)(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?[a-zA-Z_$][\w$]*\s*=>/;

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(jsx?)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function hasJdocAbove(lines, idx) {
  let p = idx - 1;
  while (p >= 0 && lines[p].trim() === "") p--;
  if (p < 0) return false;
  const t = lines[p].trim();
  if (t.startsWith("//")) return true;
  if (t === "*/") {
    while (p >= 0) {
      if (lines[p].includes("/**")) return true;
      p--;
    }
  }
  if (t.startsWith("/**") || t.startsWith("*") || t.endsWith("*/")) return true;
  return false;
}

function briefForName(name, fullLine) {
  if (!name) {
    if (/export\s+default\s+function\s*\(/.test(fullLine)) return "Default-exported React component.";
    return "Module function.";
  }
  if (/^use[A-Z]/.test(name)) return `React hook ${name}.`;
  if (/Icon$/.test(name)) return `Inline SVG / icon fragment (${name}).`;
  if (/^format|^parse|^normalize|^validate|^build|^get|^is|^can|^read|^write|^load|^save|^handle/.test(name)) {
    return `Helper: ${name}.`;
  }
  if (/Page$|Route$|Shell$|Provider$|Modal$|Form$|Card$|Badge$|Button$|List$|Filters$/.test(name)) {
    return `UI: ${name}.`;
  }
  return `${name}.`;
}

function hookSummary(kind, name) {
  if (kind === "useCallback") return `Stable callback \`${name}\` (useCallback).`;
  return `Memoized value \`${name}\` (useMemo).`;
}

function arrowSummary(name) {
  if (/^on[A-Z]/.test(name)) return `Event handler \`${name}\`.`;
  if (/^handle[A-Z]/.test(name)) return `Action handler \`${name}\`.`;
  return `Arrow function \`${name}\`.`;
}

function processFile(absPath) {
  let raw = fs.readFileSync(absPath, "utf8");
  let lines = raw.split(/\r?\n/);
  let changed = 0;

  const passHook = (lineRegex, kind) => {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(lineRegex);
      if (!m || hasJdocAbove(lines, i)) {
        out.push(line);
        continue;
      }
      const indent = m[1] || "";
      const name = m[2];
      out.push(`${indent}/** ${hookSummary(kind, name)} */`);
      out.push(line);
      changed++;
    }
    lines = out;
  };

  {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(FUNC_LINE);
      if (!m || hasJdocAbove(lines, i)) {
        out.push(line);
        continue;
      }
      const indent = m[1] || "";
      const name = m[3] || null;
      out.push(`${indent}/** ${briefForName(name, line)} */`);
      out.push(line);
      changed++;
    }
    lines = out;
  }

  passHook(USECALLBACK_LINE, "useCallback");
  passHook(USEMEMO_LINE, "useMemo");

  const passPlain = (regex, summaryFn) => {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(regex);
      if (!m || hasJdocAbove(lines, i)) {
        out.push(line);
        continue;
      }
      const indent = m[1] || "";
      const name = m[2];
      out.push(`${indent}/** ${summaryFn(name, line)} */`);
      out.push(line);
      changed++;
    }
    lines = out;
  };

  passPlain(CONST_NAMED_FUNCTION, (name) => `Function expression \`${name}\`.`);
  passPlain(CONST_ARROW, (name) => arrowSummary(name));
  passPlain(CONST_ARROW_UNPAREN, (name) => arrowSummary(name));

  if (changed === 0) return 0;
  fs.writeFileSync(absPath, lines.join("\n"), "utf8");
  return changed;
}

let total = 0;
let files = 0;
for (const f of walk(SRC)) {
  const n = processFile(f);
  if (n) {
    files++;
    total += n;
    console.log(`${n}\t${path.relative(SRC, f)}`);
  }
}
console.log(`Done: ${total} blocks in ${files} files.`);
