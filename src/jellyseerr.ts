import { fetchFromJellyseerr } from "./utils/fetchFromJellyseerr";
import type { MediaType, SearchResult } from "./utils/types";
import { SearchInput, SearchOutput } from "./zodSchema";
import { logger } from "./utils/logger";

/**
 * Searches the Jellyseerr API for results.
 *
 * @param {SearchInput} input - The search input parameters.
 * @returns {Promise<SearchOutput>} A promise that resolves to the search results.
 */
export async function search(input: SearchInput): Promise<SearchOutput> {
  const parsed = SearchInput.parse(input);
  const { json } = await fetchFromJellyseerr("/search", { params: parsed });

  const results = json.results as SearchResult[];

  return SearchOutput.parse(
    results
      .filter((res) => res.mediaType !== "person")
      .map((r: SearchResult) => ({
        mediaId: r.id,
        title: r.title || r.name,
        overview: r.overview,
        releaseDate: r.releaseDate ?? r.firstAirDate,
        posterPath: r.posterPath,
        mediaType: r.mediaType,
      }))
  );
}

export async function request(mediaType: MediaType, mediaId: number, options?: {
  seasons?: number[] | "all";
  is4k?: boolean;
  serverId?: number;
  profileId?: number;
  rootFolder?: string;
  languageProfileId?: number;
  userId?: number | null;
}) {
  console.log(`🎬 [request] Starting request for ${mediaType} with ID: ${mediaId}`);
  console.log(`🎯 [request] Media type: ${mediaType}`);
  console.log(`📋 [request] Additional options:`, options);

  // Prepare request body based on media type
  const requestBody: any = {
    mediaType,
    mediaId,
  };

  // Add TV-specific parameters
  if (mediaType === "tv") {
    if (options?.seasons) {
      requestBody.seasons = options.seasons;
      console.log(`📺 [request] TV show - requesting seasons:`, options.seasons);
    } else {
      // Default to requesting all seasons for TV shows
      requestBody.seasons = "all";
      console.log(`📺 [request] TV show - requesting all seasons (default)`);
    }
  }

  // Add optional parameters if provided
  if (options?.is4k !== undefined) {
    requestBody.is4k = options.is4k;
    console.log(`🎥 [request] 4K requested: ${options.is4k}`);
  }
  if (options?.serverId !== undefined) {
    requestBody.serverId = options.serverId;
    console.log(`🖥️ [request] Server ID: ${options.serverId}`);
  }
  if (options?.profileId !== undefined) {
    requestBody.profileId = options.profileId;
    console.log(`👤 [request] Profile ID: ${options.profileId}`);
  }
  if (options?.rootFolder !== undefined) {
    requestBody.rootFolder = options.rootFolder;
    console.log(`📁 [request] Root folder: ${options.rootFolder}`);
  }
  if (options?.languageProfileId !== undefined) {
    requestBody.languageProfileId = options.languageProfileId;
    console.log(`🌐 [request] Language profile ID: ${options.languageProfileId}`);
  }
  if (options?.userId !== undefined) {
    requestBody.userId = options.userId;
    console.log(`👥 [request] User ID: ${options.userId}`);
  }

  console.log(`📦 [request] Final request body:`, JSON.stringify(requestBody, null, 2));

  try {
    const { status, json } = await fetchFromJellyseerr("/request", {
      body: requestBody,
      method: "POST",
    });

    console.log(`📊 [request] Response status: ${status}`);
    console.log(`📄 [request] Response data:`, JSON.stringify(json, null, 2));

    const success = status === 201;
    console.log(`${success ? '✅' : '❌'} [request] Request ${success ? 'successful' : 'failed'}`);
    
    // Use enhanced TV request analysis for TV shows
    if (mediaType === "tv") {
      logger.tvRequestAnalysis(mediaId, requestBody, { status, json });
    }
    
    return success;
  } catch (error) {
    console.error(`💥 [request] Request failed with error:`, error);
    console.error(`🔍 [request] Error details:`, {
      mediaType,
      mediaId,
      options,
      requestBody,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    
    // Use enhanced TV request analysis for failed TV requests
    if (mediaType === "tv") {
      logger.tvRequestAnalysis(mediaId, requestBody, undefined, error);
    }
    
    throw error;
  }
}
