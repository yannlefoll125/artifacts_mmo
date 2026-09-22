import {Type, type Static} from 'typebox';
import {defineDto} from './define';

export const [ItemSchema, ItemRef] = defineDto('Item', Type.Object({
    name: Type.String(),
    level: Type.Number(),
    description: Type.String(),
}));

export type Item = Static<typeof ItemSchema>;
