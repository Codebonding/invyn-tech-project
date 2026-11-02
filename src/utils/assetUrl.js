
const API_ORIGIN = "http://localhost:5000";

export function assetUrl(path) {
  if (!path) return null;

  const value = String(path).trim();

  if (!value) return null;

  // Keep absolute URLs unchanged.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Normalize Windows slashes and remove leading slashes.
  const normalizedPath = value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  // Prevent duplicate uploads/ prefix.
  const uploadPath = normalizedPath.startsWith("uploads/")
    ? normalizedPath
    : `uploads/${normalizedPath}`;

  return `${API_ORIGIN}/${uploadPath}`;
}
