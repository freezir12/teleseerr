import env from "../../env";

const { JELLYSEERR_URL, JELLYSEERR_KEY } = env;

/**
/**
 * Fetches data from the Jellyseerr API.
 *
 * This function constructs a URL using the provided endpoint and query parameters,
 * makes an HTTP request to the Jellyseerr API using the specified method, and returns the JSON response.
 *
 * @template T - The expected return type of the API response. Defaults to `any`.
 *
 * @param {string} endpoint - The API endpoint to call (e.g., "/search").
 * @param {Object} options - The options for the API request.
 * @param {string} [options.method="GET"] - The HTTP method to use for the request.
 * @param {Record<string, string>} [options.params={}] - An object representing the query parameters to include in the request.
 * @param {Object} [options.body] - The body of the request for POST and PUT methods.
 * 
 * @returns {Promise<T>} A promise that resolves to the JSON response from the API.
 *
 * @throws {Error} Throws an error if the fetch operation fails.
 *
 * @example
 * // Example usage of fetchFromJellyseerr to search for movies
 * const response = await fetchFromJellyseerr("/search", {
 *   params: { query: "Inception", page: "1" }
 * });
 * console.log(response);
 * // Output might be an array of movie objects
 *
 * @example
 * // Example usage with POST method
 * const response = await fetchFromJellyseerr("/request", {
 *   method: "POST",
 *   body: { mediaId: 12345, userId: 67890 }
 * });
 * console.log(response);
 * // Output might be a confirmation object
 */
export async function fetchFromJellyseerr<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    params?: Record<string, string>;
    body?: Record<string, any>;
  } = {}
) {
  const { method = "GET", params = {}, body } = options;
  const url = new URL(JELLYSEERR_URL + endpoint);

  console.log(`🌐 [fetchFromJellyseerr] Starting ${method} request to: ${endpoint}`);
  console.log(`🔧 [fetchFromJellyseerr] Base URL: ${JELLYSEERR_URL}`);
  console.log(`📄 [fetchFromJellyseerr] Query params:`, params);
  console.log(`📦 [fetchFromJellyseerr] Request body:`, body ? JSON.stringify(body, null, 2) : 'None');

  // Append query parameters to the URL
  Object.entries(params).forEach(([key, val]) =>
    url.searchParams.append(key, encodeURIComponent(val))
  );

  console.log(`🎯 [fetchFromJellyseerr] Final URL: ${url.toString()}`);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "X-Api-Key": JELLYSEERR_KEY,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
    console.log(`📤 [fetchFromJellyseerr] Serialized body: ${fetchOptions.body}`);
  }

  console.log(`🚀 [fetchFromJellyseerr] Making request with options:`, {
    method: fetchOptions.method,
    headers: { ...fetchOptions.headers, "X-Api-Key": "[REDACTED]" },
    hasBody: !!fetchOptions.body
  });

  // Make the API request
  let res: Response;
  try {
    res = await fetch(url.toString(), fetchOptions);
    console.log(`📡 [fetchFromJellyseerr] Response received - Status: ${res.status} ${res.statusText}`);
    console.log(`📊 [fetchFromJellyseerr] Response headers:`, {
      'content-type': res.headers.get('content-type'),
      'content-length': res.headers.get('content-length'),
      'server': res.headers.get('server')
    });
  } catch (error) {
    console.error(`❌ [fetchFromJellyseerr] Network error:`, error);
    throw error;
  }

  // Check for HTTP errors
  if (!res.ok) {
    let errorBody: any;
    try {
      errorBody = await res.text();
      console.error(`💥 [fetchFromJellyseerr] Error response body:`, errorBody);
      // Try to parse as JSON for more detailed error info
      try {
        const jsonError = JSON.parse(errorBody);
        console.error(`🔍 [fetchFromJellyseerr] Parsed error details:`, JSON.stringify(jsonError, null, 2));
      } catch {
        console.error(`📝 [fetchFromJellyseerr] Raw error text:`, errorBody);
      }
    } catch (bodyError) {
      console.error(`⚠️ [fetchFromJellyseerr] Could not read error response body:`, bodyError);
      errorBody = 'Unable to read response body';
    }
    
    const errorMessage = `HTTP ${res.status} ${res.statusText}${errorBody ? ` - ${errorBody}` : ''}`;
    console.error(`🚨 [fetchFromJellyseerr] Request failed: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // Return the JSON response
  let jsonResponse: T;
  try {
    jsonResponse = await res.json() as T;
    console.log(`✅ [fetchFromJellyseerr] Success! Response data:`, JSON.stringify(jsonResponse, null, 2));
  } catch (parseError) {
    console.error(`🔧 [fetchFromJellyseerr] JSON parse error:`, parseError);
    throw new Error(`Failed to parse JSON response: ${parseError}`);
  }

  const result = { json: jsonResponse, status: res.status, ok: res.ok };
  console.log(`🎉 [fetchFromJellyseerr] Request completed successfully`);
  return result;
}
