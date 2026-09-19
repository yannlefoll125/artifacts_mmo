// Prepends // @ts-nocheck to the generated client runtime (core/, client/).
// Those files are vendored library code — the equivalent of node_modules —
// and don't typecheck under this repo's compiler settings (strictNullChecks
// off). Opting them out mirrors what skipLibCheck does for .d.ts files; the
// stubs and types (sdk.gen.ts, types.gen.ts) stay fully checked, and their
// types still flow to consumers. Chained into `yarn generate`. Idempotent.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const GENERATED = new URL('../generated-src/artifactsmmo/', import.meta.url);
const PRAGMA = '// @ts-nocheck\n';

let patched = 0;
for (const dir of ['core', 'client']) {
    for (const entry of readdirSync(new URL(`${dir}/`, GENERATED))) {
        if (!entry.endsWith('.ts')) continue;
        const file = new URL(`${dir}/${entry}`, GENERATED);
        const src = readFileSync(file, 'utf8');
        if (src.startsWith(PRAGMA)) continue;
        writeFileSync(file, PRAGMA + src);
        patched += 1;
    }
}
console.log(`Prepended @ts-nocheck to ${patched} generated runtime files`);
