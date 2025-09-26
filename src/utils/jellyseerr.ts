import env from "../../env";
import type { MediaType } from "./types";

const { JELLYSEERR_URL, JELLYSEERR_KEY } = env;

type JellyseerrSearchItem = {
  id: number;
  mediaType: MediaType;
  name?: string;
  title?: string;
  overview?: string;
  posterPath?: string | null;
  firstAirDate?: string;
  releaseDate?: string;
};

type JellyseerrSearchResponse = {
  results: JellyseerrSearchItem[];
};

export type JellyseerrTvDetails = {
  id: number;
  name?: string;
  overview?: string;
  firstAirDate?: string;
  posterPath?: string | null;
  seasons?: { seasonNumber?: number | null }[];
};

export type JellyseerrMovieDetails = {
  id: number;
  title?: string;
  overview?: string;
  releaseDate?: string;
  posterPath?: string | null;
};

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

async function jellyseerrFetch<T>(
  path: string,
  init: FetchOptions = {}
): Promise<T> {
  const response = await fetch(`${JELLYSEERR_URL}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "X-Api-Key": JELLYSEERR_KEY,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Jellyseerr request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function searchJellyseerr(
  query: string
): Promise<JellyseerrSearchItem[]> {
  const data = await jellyseerrFetch<JellyseerrSearchResponse>(
    `/search?query=${encodeURIComponent(query)}&page=1&language=en`,
    {
      method: "GET",
    }
  );

  return data.results ?? [];
}

export async function getTvDetails(id: number): Promise<JellyseerrTvDetails> {
  return await jellyseerrFetch<JellyseerrTvDetails>(`/tv/${id}?language=en`, {
    method: "GET",
  });
}

export async function getMovieDetails(
  id: number
): Promise<JellyseerrMovieDetails> {
  return await jellyseerrFetch<JellyseerrMovieDetails>(
    `/movie/${id}?language=en`,
    {
      method: "GET",
    }
  );
}

export type JellyseerrRequestBody = {
  mediaType: MediaType;
  mediaId: number;
  tvdbId: number;
  seasons?: number[];
  is4k?: boolean;
  serverId?: number;
  profileId?: number;
  rootFolder?: string;
  languageProfileId?: number;
  userId?: number;
};

export async function createRequest(
  body: JellyseerrRequestBody
): Promise<void> {
  await jellyseerrFetch<void>(`/request`, {
    method: "POST",
    body: JSON.stringify({
      is4k: false,
      serverId: 0,
      profileId: 0,
      rootFolder: "string",
      languageProfileId: 0,
      userId: 0,
      ...body,
      seasons: body.mediaType === "tv" ? body.seasons ?? [] : [],
    }),
  });
}
