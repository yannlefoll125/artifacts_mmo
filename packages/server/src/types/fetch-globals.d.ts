// @types/node declares fetch's Request/Response globally but not BodyInit,
// which the generated ArtifactsMMO client references. Alias it from
// undici-types, the source of Node's fetch typings.
type BodyInit = import('undici-types').BodyInit;
