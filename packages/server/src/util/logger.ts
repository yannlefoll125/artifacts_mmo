import {pino} from 'pino';

// Shared pino instance: Fastify gets it via `loggerInstance`, the Artifacts
// client logs through a child of it, so both streams share one format.
// Pretty-printed unless running in production (set LOG_PRETTY=0/1 to force).
const pretty = process.env.LOG_PRETTY != null
    ? process.env.LOG_PRETTY === '1'
    : process.env.NODE_ENV !== 'production';

// Trim a payload for debug logging so a big JSON body stays one short line.
export function payloadPreview(payload: unknown, max = 300): string {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload) ?? '';
    return text.length > max ? `${text.slice(0, max)}… (${text.length} chars)` : text;
}

export const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    ...(pretty && {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss.l',
                ignore: 'pid,hostname,scope,reqId',
                messageFormat: '{if reqId}[{reqId}] {end}{if scope}[{scope}] {end}{msg}',
            },
        },
    }),
});
