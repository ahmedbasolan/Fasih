/**
 * The icon barrel is a bundle-size invariant, and invariants that live only in
 * a comment rot.
 *
 * `src/components/icons.ts` states the cost in its own header: Metro does not
 * tree-shake in dev, so a bare `from 'lucide-react-native'` pulls the entire
 * ~3,390-icon set (~1,700 modules) into the dev bundle. Every component is
 * supposed to deep-import through the barrel instead.
 *
 * Three files had drifted off it — two of them newly written primitives mounted
 * on the app's highest-traffic screens, which is how a rule stated once in a
 * file header fails. This asserts it instead.
 */

declare const __dirname: string;
declare function require(id: 'fs'): {
  readFileSync(path: string, encoding: 'utf8'): string;
  readdirSync(path: string, opts: { withFileTypes: true }): { name: string; isDirectory(): boolean }[];
};
declare function require(id: 'path'): { join(...parts: string[]): string };

const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

const SRC = join(__dirname, '../..');
const APP = join(__dirname, '../../../app');

/** The barrel itself, and the ambient module declaration for the subpaths. */
const ALLOWED = ['components/icons.ts', 'types/lucide-icons.d.ts'];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('icon imports go through the barrel', () => {
  it('no file imports named icons straight from lucide-react-native', () => {
    const offenders = [...walk(SRC), ...walk(APP)].filter((file) => {
      if (ALLOWED.some((a) => file.replace(/\\/g, '/').endsWith(a))) return false;
      // The bare package specifier only. `lucide-react-native/icons/<name>`
      // is the deep import the barrel is built from, and importing the
      // LucideIcon TYPE costs nothing at runtime.
      const src = readFileSync(file, 'utf8');
      return /^\s*import\s+(?!type\b)[^;]*from\s+'lucide-react-native'/m.test(src);
    });

    expect(offenders.map((f) => f.replace(/\\/g, '/').split('/src/').pop())).toEqual([]);
  });
});
