import {Type, type Static, type TSchema, type TUnsafe} from 'typebox';

/**
 * Names a DTO schema and derives its route-schema reference in one step:
 * stamps the given $id onto the schema and returns it together with a
 * `$ref: '<id>#'` pointer typed as the schema's Static<> (so the Fastify
 * type provider still sees the real payload type through the ref).
 *
 *   export const [ItemSchema, ItemRef] = defineDto('Item', Type.Object({...}));
 *   export type Item = Static<typeof ItemSchema>;
 *
 * Use the schema where it is registered (server.addSchema) and the ref
 * where it is used (route response/body schemas). Keeping id, schema and
 * ref born from one call is what makes the ref's type assertion safe.
 */
export function defineDto<Id extends string, S extends TSchema>(
    id: Id,
    schema: S,
): [schema: S, ref: TUnsafe<Static<S>>] {
    const named = {...schema, $id: id};
    return [named, Type.Unsafe<Static<S>>(Type.Ref(`${id}#`))];
}
