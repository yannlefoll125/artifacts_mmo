import {Type, type Static} from 'typebox';

export const HealthStatusSchema = Type.Object({
    status: Type.Literal('ok'),
});

export type HealthStatus = Static<typeof HealthStatusSchema>;
