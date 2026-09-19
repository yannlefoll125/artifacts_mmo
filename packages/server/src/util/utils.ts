import type {Cooldown} from "@/types/types";
import type {ErrorResponseSchema, ErrorSchema} from "@generated/artifactsmmo";

export async function sleep(sleepMs: number) {
    await new Promise(resolve => setTimeout(resolve, sleepMs));
}



export function isApiError(e: unknown): e is ErrorResponseSchema {
    return typeof e === 'object' && e !== null
        && 'error' in e
        && typeof (e as any).error?.code === 'number';
}

export function handleApiError<R>(error: unknown, handler: (error: ErrorSchema) => R): R {
    if(isApiError(error) && handler) {
        return handler(error.error);
    }
    throw error;
}
