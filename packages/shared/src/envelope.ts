export interface ApiError {
  message: string;
  /** Upstream ArtifactsMMO error code, when the failure came from the game API. */
  upstreamCode?: number;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
