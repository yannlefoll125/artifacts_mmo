import {Type, type Static} from 'typebox';
import {defineDto} from './define';

export const [HealthStatusSchema, HealthStatusRef] = defineDto('HealthStatus', Type.Object({
    status: Type.Literal('ok'),
}));

export type HealthStatus = Static<typeof HealthStatusSchema>;
