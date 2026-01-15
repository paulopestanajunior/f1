type QueryParams = Record<string, string | number | boolean | undefined>;

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ""}/api`;

function buildUrl(path: string, params?: QueryParams) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const finalPath = path.startsWith("http")
    ? path
    : `${base}/${path.replace(/^\//, "")}`;
  const url = finalPath.startsWith("http")
    ? new URL(finalPath)
    : new URL(finalPath, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function getJson<T>(path: string, params?: QueryParams): Promise<T> {
  const response = await fetch(buildUrl(path, params));
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  getJson,
};
