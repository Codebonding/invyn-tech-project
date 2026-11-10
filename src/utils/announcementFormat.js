export const TYPES = [["general", "General"], ["holiday", "Holiday"], ["exam", "Examination"], ["registration", "Registration"], ["course", "Course update"], ["schedule", "Schedule change"], ["assignment", "Assignment"], ["material", "Learning material"], ["event", "Event"]];
export const PRIORITIES = [["normal", "Normal"], ["important", "Important"], ["urgent", "Urgent"]];
export const STATUSES = [["draft", "Draft"], ["scheduled", "Scheduled"], ["published", "Published"], ["archived", "Archived"]];
export const AUDIENCES = [["all_students", "All students"], ["course_students", "Students of a course"]];
export const CATEGORIES = [["general", "General announcements"], ["course", "Course updates"], ["important", "Important updates"], ["individual", "Personal"]];

const label = (list, v) => list.find(([id]) => id === v)?.[1] || v;
export const priorityLabel = (v) => label(PRIORITIES, v);
export const statusLabel = (v) => label(STATUSES, v);
export const typeLabel = (v) => label(TYPES, v);
export const categoryLabel = (v) => label(CATEGORIES, v);
export const isImportant = (priority) => priority === "important" || priority === "urgent";
export const audienceText = (a) => (a.targetAudience === "all_students" ? "All students" : a.courseTitle || "A course");

// Mirrors the server rule: an internal path or an https link. The server is the authority.
const INTERNAL = /^\/(?![/\\])[A-Za-z0-9\-._~%/?#=&+,:@]*$/;
export function actionUrlError(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (v.length > 500) return "Use 500 characters or fewer.";
  if (v.startsWith("/")) return INTERNAL.test(v) && !v.split(/[?#]/)[0].split("/").includes("..") ? "" : "Use a simple internal path such as /student/courses/3.";
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password && u.hostname.includes(".") ? "" : "Only https:// links are allowed.";
  } catch { return "Use an internal path such as /student/courses/3 or an https:// link."; }
}

export const isInternalLink = (url) => typeof url === "string" && url.startsWith("/") && !url.startsWith("//");

const MINUTE = 60_000;
export const toIso = (local) => (local ? new Date(local).toISOString() : null);
export const toLocalInput = (iso) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * MINUTE).toISOString().slice(0, 16) : "");

/** v: { title, description, targetAudience, courseId, priority, scheduledAt, expiresAt, actionUrl } with datetime-local strings */
export function validateAnnouncement(v, { editing = false, published = false, now = Date.now() } = {}) {
  const e = {};
  const title = String(v.title ?? "").trim();
  if (title.length < 3) e.title = "Title must be at least 3 characters.";
  else if (title.length > 150) e.title = "Title must be 150 characters or fewer.";
  const description = String(v.description ?? "").trim();
  if (description.length < 3) e.description = "Write the announcement.";
  else if (description.length > 5000) e.description = "Use 5000 characters or fewer.";
  if (!editing) {
    if (!v.targetAudience) e.targetAudience = "Choose who should receive this.";
    if (v.targetAudience === "course_students" && !v.courseId) e.courseId = "Choose a course.";
  }
  const scheduled = v.scheduledAt ? new Date(v.scheduledAt).getTime() : null;
  const expires = v.expiresAt ? new Date(v.expiresAt).getTime() : null;
  if (!published && scheduled !== null && scheduled < now + MINUTE) e.scheduledAt = "Choose a publication time at least a minute in the future.";
  if (expires !== null && expires <= (scheduled !== null && !published ? scheduled : now)) e.expiresAt = scheduled !== null && !published ? "The expiry must be after the publication time." : "The expiry must be in the future.";
  const url = actionUrlError(v.actionUrl);
  if (url) e.actionUrl = url;
  return e;
}

/** The request body: no identity, status or recipient fields. */
export function buildPayload(v, { editing = false } = {}) {
  const base = {
    title: v.title.trim(), description: v.description.trim(), announcementType: v.announcementType || "general", priority: v.priority || "normal",
    scheduledAt: toIso(v.scheduledAt), expiresAt: toIso(v.expiresAt), actionUrl: v.actionUrl.trim() || null,
  };
  return editing ? base : { ...base, targetAudience: v.targetAudience, ...(v.targetAudience === "course_students" ? { courseId: Number(v.courseId) } : {}) };
}