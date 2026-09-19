// Prepends the endpoint (e.g. `POST /my/{name}/action/move`) to each stub's
// JSDoc in the generated sdk.gen.ts. @hey-api/openapi-ts has no option for
// this (its comments are hardcoded to summary/description/@deprecated), so
// `yarn generate` chains this step after codegen. Method and URL are read
// from each stub's own body, so no naming logic is duplicated. Idempotent.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../generated-src/artifactsmmo/sdk.gen.ts', import.meta.url);
const src = readFileSync(FILE, 'utf8');

const stubRe = /\/\*\*\n(?<doc>(?: \*(?: .*)?\n)*?) \*\/\n(?=export const \w+ = (?<decl>[\s\S]*?client\)\.(?<method>\w+)<[\s\S]*?url: '(?<url>[^']*)'))/g;

let annotated = 0;
const out = src.replace(stubRe, (match, ...rest) => {
    const { doc, method, url } = rest.at(-1);
    annotated += 1;
    const endpointLine = ` * \`${method.toUpperCase()} ${url}\`\n`;
    if (doc.startsWith(endpointLine)) return match;
    return `/**\n${endpointLine} *\n${doc} */\n`;
});

const stubCount = (src.match(/^export const /gm) ?? []).length;
if (annotated !== stubCount) {
    throw new Error(`Annotated ${annotated} of ${stubCount} stubs — sdk.gen.ts format changed; update annotate-sdk.mjs`);
}

writeFileSync(FILE, out);
console.log(`Annotated ${annotated} stubs with their endpoints`);
