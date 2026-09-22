import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import fastifySwagger from '@fastify/swagger';
import {buildServer} from '@/server';

// Generates the server's own OpenAPI document from the route schemas and
// writes it to packages/shared/spec/openapi.yaml (checked in — regenerate
// with `yarn api:spec` whenever routes or schemas change). The webapp
// generates its REST client from that file.
const server = buildServer((s) => {
    s.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'artifacts_mmo server',
                version: '0.1.0',
            },
        },
    });
});

await server.ready();
const yaml = server.swagger({yaml: true});
await server.close();

const specPath = fileURLToPath(new URL('../../shared/spec/openapi.yaml', import.meta.url));
fs.mkdirSync(path.dirname(specPath), {recursive: true});
fs.writeFileSync(specPath, yaml);
console.log(`wrote ${path.relative(process.cwd(), specPath)}`);
