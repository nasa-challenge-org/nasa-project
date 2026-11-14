/**
 * FastAPI client. Member 1 owns this file; Member 2 consumes it.
 */

import type {
  AnalysisRequest,
  AnalysisResponse,
  ApiErrorEnvelope,
  CompareRequest,
  CompareResponse,
  HealthResponse,
  LandingSite,
} from "@/lib/types";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: string | null;

  constructor(
    status: number,
    code: string,
    message: string,
    details: string | null,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:8000/api/v1"
  );
}

async function parseError(response: Response): Promise<ApiClientError> {
  try {
    const body = (await response.json()) as ApiErrorEnvelope;
    return new ApiClientError(
      response.status,
      body.error?.code ?? "UNKNOWN",
      body.error?.message ?? response.statusText,
      body.error?.details ?? null,
    );
  } catch {
    return new ApiClientError(
      response.status,
      "UNKNOWN",
      response.statusText,
      null,
    );
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiClientError(
      0,
      "NETWORK_ERROR",
      "Cannot reach the LunarEdge API.",
      url,
    );
  }
  if (!response.ok) {
    throw await parseError(response);
  }
  return (await response.json()) as T;
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export function getSites(): Promise<LandingSite[]> {
  return request<LandingSite[]>("/sites");
}

export function getSite(siteId: string): Promise<LandingSite> {
  return request<LandingSite>(`/sites/${encodeURIComponent(siteId)}`);
}

export function postAnalysis(
  payload: AnalysisRequest,
): Promise<AnalysisResponse> {
  return request<AnalysisResponse>("/analysis", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function postCompare(payload: CompareRequest): Promise<CompareResponse> {
  return request<CompareResponse>("/compare", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
