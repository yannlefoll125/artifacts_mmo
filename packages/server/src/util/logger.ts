import {pino} from 'pino';
import pinoPretty from 'pino-pretty';

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

const REDACTED_HEADERS = new Set(['authorization', 'cookie', 'set-cookie']);

// Jersey-style wire dump. Title line, then start line and headers prefixed
// with "<id> >" (request) or "<id> <" (response), then the raw unprefixed
// body, then a blank line to separate from the next log entry.
export function httpMessage(
    kind: 'Request' | 'Response',
    id: string, // exchange id, e.g. "req-1" or "api-3"
    summary: string, // e.g. "GET /my/characters"
    startLine: string,
    headers: Headers | Record<string, string | string[] | number | undefined>,
    body?: string,
): string {
    const prefix = `${id} ${kind === 'Request' ? '>' : '<'}`;
    const entries: Array<[string, unknown]> =
        headers instanceof Headers ? [...headers.entries()] : Object.entries(headers);
    const lines = [`${kind}[${id}]: ${summary}`, `${prefix} ${startLine}`];
    for (const [name, value] of entries) {
        if (value === undefined) continue;
        const shown = REDACTED_HEADERS.has(name.toLowerCase()) ? '***' : value;
        lines.push(`${prefix} ${name}: ${Array.isArray(shown) ? shown.join(', ') : shown}`);
    }
    if (body) {
        lines.push(body);
    }
    return lines.join('\n') + '\n';
}

const LEVEL_WIDTH = 5;  // longest label: DEBUG/TRACE/ERROR/FATAL

// pino-pretty runs as an in-process stream (not the worker transport) because
// the fixed-width prettifiers below are functions, which a worker can't receive.
const prettyStream = pretty
    ? pinoPretty({
        colorize: process.stdout.isTTY,
        translateTime: 'HH:MM:ss.l',
        ignore: 'pid,hostname,scope,reqId',
        customPrettifiers: {
            // Right-align to LEVEL_WIDTH (like logback's %5p). Pad by the plain
            // label's deficit — the colorized label carries ANSI codes, so
            // padStart on it would miscount.
            level: (_value, _key, _log, {label, labelColorized}) =>
                ' '.repeat(Math.max(0, LEVEL_WIDTH - label.length)) + labelColorized,
        },
        messageFormat: (log, messageKey) => {
            const tag = (log.reqId ?? log.scope) as string | undefined;
            return `${tag ? `[${tag}] ` : ''}${log[messageKey] ?? ''}`;
        },
    })
    : undefined;

export const logger = pino({level: process.env.LOG_LEVEL ?? 'info'}, prettyStream);
