export const MB = 1024 * 1024;

export const MATERIAL_TYPES = [
  ["pdf", "PDF document"],
  ["document", "Document (Word / PowerPoint)"],
  ["image", "Image"],
  ["notes", "Study notes"],
  ["video", "Video link"],
  ["link", "External link"],
];

export const STATUSES = [["draft", "Draft"], ["published", "Published"], ["archived", "Archived"]];

export const FILE_RULES = {
  pdf: { exts: [".pdf"], max: 20 * MB, accept: ".pdf,application/pdf", label: "PDF, up to 20 MB" },
  document: { exts: [".doc", ".docx", ".ppt", ".pptx"], max: 20 * MB, accept: ".doc,.docx,.ppt,.pptx", label: "DOC, DOCX, PPT or PPTX, up to 20 MB" },
  image: { exts: [".jpg", ".jpeg", ".png", ".webp"], max: 5 * MB, accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp", label: "JPG, PNG or WebP, up to 5 MB" },
};

export const isFileType = (type) => Object.prototype.hasOwnProperty.call(FILE_RULES, type);
export const isLinkType = (type) => type === "video" || type === "link";

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
};

/** Returns an error message, or "" when the link is acceptable (https only, no credentials). */
export function validateUrl(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "Enter a link.";
  if (value.length > 500) return "The link must be 500 characters or fewer.";
  let url;
  try { url = new URL(value); } catch { return "Enter a valid https:// link."; }
  if (url.protocol !== "https:") return "Only https:// links are allowed.";
  if (url.username || url.password) return "Links cannot contain a username or password.";
  if (!url.hostname.includes(".")) return "Enter a valid https:// link.";
  return "";
}

export function validateFile(type, file) {
  const rule = FILE_RULES[type];
  if (!rule || !file) return "";
  const name = (file.name || "").toLowerCase();
  if (!rule.exts.some((ext) => name.endsWith(ext))) return `Use a file of type: ${rule.exts.join(", ")}.`;
  if (file.size === 0) return "That file is empty.";
  if (file.size > rule.max) return `The file must be ${rule.max / MB} MB or smaller.`;
  return "";
}

/** values: { courseId, moduleIndex, title, description, type, url, content, allowDownload, status } */
export function validateMaterialForm(values, { editing = false, file = null, hasExistingFile = false } = {}) {
  const e = {};
  if (!editing && !values.courseId) e.courseId = "Choose a course.";
  const title = String(values.title ?? "").trim();
  if (title.length < 3) e.title = "Title must be at least 3 characters.";
  else if (title.length > 150) e.title = "Title must be 150 characters or fewer.";
  if (String(values.description ?? "").trim().length > 500) e.description = "Description must be 500 characters or fewer.";
  if (!values.type) e.type = "Choose a material type.";

  if (isFileType(values.type)) {
    if (!file && !(editing && hasExistingFile)) e.file = "Choose a file to upload.";
    else if (file) { const problem = validateFile(values.type, file); if (problem) e.file = problem; }
  }
  if (isLinkType(values.type)) {
    const problem = validateUrl(values.url);
    if (problem) e.url = problem;
  }
  if (values.type === "notes" && !String(values.content ?? "").trim()) e.content = "Write the notes.";
  return e;
}

/** Builds the multipart body. Immutable fields (course, type) are sent on create only. */
export function buildFormData(values, file, { editing = false, status } = {}) {
  const fd = new FormData();
  if (!editing) {
    fd.append("courseId", String(values.courseId));
    fd.append("type", values.type);
  }
  fd.append("title", values.title.trim());
  fd.append("description", (values.description || "").trim());
  if (values.moduleIndex !== "" && values.moduleIndex !== null && values.moduleIndex !== undefined) fd.append("moduleIndex", String(values.moduleIndex));
  else if (editing) fd.append("moduleIndex", "");
  if (isLinkType(values.type)) fd.append("url", values.url.trim());
  if (values.type === "notes") fd.append("content", values.content.trim());
  if (isFileType(values.type)) fd.append("allowDownload", values.allowDownload ? "true" : "false");
  if (status) fd.append("status", status);
  if (file) fd.append("file", file);
  return fd;
}