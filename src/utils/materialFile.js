import axiosInstance from "../services/axiosInstance";

/**
 * Private files are fetched through the authorised API (cookies + CSRF header via axiosInstance) and opened from a
 * temporary blob URL. The real storage path is never exposed to the browser.
 */
export async function openPrivateFile(path, { download = false, fileName = "file", params } = {}) {
  const response = await axiosInstance.get(path, { responseType: "blob", params });
  const url = URL.createObjectURL(response.data);

  if (download) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.open(url, "_blank", "noopener");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}