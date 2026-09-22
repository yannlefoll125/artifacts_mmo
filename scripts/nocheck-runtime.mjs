// Prepends // @ts-nocheck to a generated client's runtime (core/, client/).
// Those files are vendored library code — the equivalent of node_modules —
// and don't typecheck under this repo's compiler settings. Opting them out
// mirrors what skipLibCheck does for .d.ts files; the stubs and types
// (sdk.gen.ts, types.gen.ts) stay fully checked, and their types still flow
// to consumers. Chained into each package's codegen script (`mmo:sdk` in the
// server, `api:client` in the webapp). Idempotent.
//
// Usage: node scripts/nocheck-runtime.mjs <generated-dir>
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const target = process.argv[2];
if (!target) {
    console.error('usage: node nocheck-runtime.mjs <generated-dir>');
    process.exit(1);
}

const GENERATED = pathToFileURL(`${resolve(target)}/`);
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
