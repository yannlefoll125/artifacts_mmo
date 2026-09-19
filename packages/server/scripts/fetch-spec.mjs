// Downloads the ArtifactsMMO OpenAPI spec and vendors it into spec/openapi.json.
// This is the only step that touches the network; `yarn generate` works offline
// from the committed spec, so codegen output is reproducible.
import { mkdir, writeFile } from 'node:fs/promises';

const SPEC_URL = 'https://api.artifactsmmo.com/openapi.json';
const OUT_URL = new URL('../spec/openapi.json', import.meta.url);

const res = await fetch(SPEC_URL);
if (!res.ok) {
    throw new Error(`Failed to fetch ${SPEC_URL}: ${res.status} ${res.statusText}`);
}
const spec = await res.json();

await mkdir(new URL('.', OUT_URL), { recursive: true });
// Pretty-print so spec refreshes produce reviewable diffs.
await writeFile(OUT_URL, JSON.stringify(spec, null, 2) + '\n');
console.log(`Wrote ${OUT_URL.pathname} (OpenAPI ${spec.openapi}, version ${spec.info?.version ?? 'unknown'})`);
