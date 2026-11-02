export const MAX_IMAGE_BYTES = 15* 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const IMAGE_HELP = "PNG, JPG or WebP, up to 15MB";

/** Quick feedback before uploading. The server re-checks the real file contents, so this is a convenience only. */
export function validateImageFile(file) {
  if (!file) return null;
  if (!IMAGE_TYPES.includes(file.type)) return "Choose a PNG, JPG or WebP image.";
  if (file.size > MAX_IMAGE_BYTES) return "The image must be 15 MB or smaller.";
  return null;
}
