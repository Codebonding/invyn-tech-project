import axiosInstance from "../services/axiosInstance";

/**
 * Private PDFs are fetched through the authorised API (cookies + CSRF header via axiosInstance) and opened from a
 * temporary blob URL. The real file path is never exposed to the browser.
 */
export async function openMaterialFile(material) {
  const response = await axiosInstance.get(material.downloadPath, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);

  if (material.allowDownload) {
    const link = document.createElement("a");
    link.href = url;
    link.download = material.fileName || "material.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.open(url, "_blank", "noopener");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}