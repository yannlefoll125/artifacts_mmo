import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    resolve: {
        alias: [
            // Bare specifier → the package index; subpaths (e.g.
            // @artifacts/shared/dto/items) → the matching source file.
            {find: /^@artifacts\/shared$/, replacement: fileURLToPath(new URL('../shared/src/index.ts', import.meta.url))},
            {find: /^@artifacts\/shared\/(.*)$/, replacement: fileURLToPath(new URL('../shared/src', import.meta.url)) + '/$1'},
            {find: /^@generated\/(.*)$/, replacement: fileURLToPath(new URL('./generated-src', import.meta.url)) + '/$1'},
            {find: /^@\/(.*)$/, replacement: fileURLToPath(new URL('./src', import.meta.url)) + '/$1'},
        ],
    },
    test: {
        globals: true,
        environment: 'node',
    },
});
