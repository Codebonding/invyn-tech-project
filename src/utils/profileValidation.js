export const MIN_YEAR = 1950;
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const NAME_RE = /^\p{L}[\p{L}\p{M} .'’-]*$/u;
const PHONE_RE = /^\+?[0-9][0-9 ()-]{5,18}$/;
const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{2,10}$/;
const GRADE_RE = /^[0-9A-Za-z .%/+-]+$/;

const blank = (v) => v === undefined || v === null || String(v).trim() === "";
const tooLong = (v, max) => !blank(v) && String(v).trim().length > max;

/** Each validator returns { field: message } and an empty object when everything is valid. */
export function validatePersonal(values, today = new Date()) {
  const e = {};
  const name = String(values.name ?? "").trim();
  if (!name) e.name = "Full name is required.";
  else if (name.length < 2 || name.length > 100) e.name = "Name must be 2 to 100 characters.";
  else if (!NAME_RE.test(name)) e.name = "Name can contain letters, spaces, apostrophes, hyphens and dots only.";

  if (!blank(values.phone)) {
    const phone = values.phone.trim();
    const digits = phone.replace(/\D/g, "").length;
    if (!PHONE_RE.test(phone)) e.phone = "Enter a valid phone number.";
    else if (digits < 7 || digits > 15) e.phone = "Phone number must have 7 to 15 digits.";
  }

  if (!blank(values.dateOfBirth)) {
    const v = values.dateOfBirth;
    const d = new Date(`${v}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) e.dateOfBirth = "Enter a real date.";
    else if (d > today) e.dateOfBirth = "Date of birth cannot be in the future.";
    else if (v < "1900-01-01") e.dateOfBirth = "Enter a date after 1900.";
  }

  if (tooLong(values.addressLine, 200)) e.addressLine = "Address must be 200 characters or fewer.";
  ["city", "state", "country"].forEach((k) => {
    if (tooLong(values[k], 100)) e[k] = "Must be 100 characters or fewer.";
  });
  if (!blank(values.postalCode) && !POSTAL_RE.test(values.postalCode.trim())) e.postalCode = "Enter a valid postal code.";
  return e;
}

export function validateAcademic(values, year = new Date().getFullYear()) {
  const e = {};
  ["collegeName", "department", "degreeProgram", "universityName"].forEach((k) => {
    if (tooLong(values[k], 150)) e[k] = "Must be 150 characters or fewer.";
  });
  if (!blank(values.graduationYear)) {
    const n = Number(values.graduationYear);
    if (!Number.isInteger(n) || n < MIN_YEAR || n > year + 10) e.graduationYear = `Enter a year between ${MIN_YEAR} and ${year + 10}.`;
  }
  return e;
}

export function validateEducation(values, year = new Date().getFullYear()) {
  const e = {};
  if (blank(values.level)) e.level = "Choose a qualification level.";
  const degree = String(values.degreeName ?? "").trim();
  if (degree.length < 2) e.degreeName = "Degree name is required.";
  else if (degree.length > 150) e.degreeName = "Must be 150 characters or fewer.";
  const institution = String(values.institution ?? "").trim();
  if (institution.length < 2) e.institution = "College or institution is required.";
  else if (institution.length > 150) e.institution = "Must be 150 characters or fewer.";
  ["specialization", "university", "department"].forEach((k) => {
    if (tooLong(values[k], 150)) e[k] = "Must be 150 characters or fewer.";
  });

  const start = Number(values.startYear);
  if (blank(values.startYear)) e.startYear = "Start year is required.";
  else if (!Number.isInteger(start) || start < MIN_YEAR || start > year) e.startYear = `Enter a year between ${MIN_YEAR} and ${year}.`;

  if (values.isCurrent) {
    if (!blank(values.completionYear)) e.completionYear = "A qualification you are studying now has no completion year.";
  } else if (blank(values.completionYear)) {
    e.completionYear = "Completion year is required unless you are currently studying.";
  } else {
    const end = Number(values.completionYear);
    if (!Number.isInteger(end) || end < MIN_YEAR) e.completionYear = `Enter a year of ${MIN_YEAR} or later.`;
    else if (!e.startYear && end < start) e.completionYear = "Completion year cannot be earlier than the start year.";
    else if (end > year) e.completionYear = `Completion year cannot be later than ${year}.`;
  }

  if (!blank(values.grade)) {
    if (String(values.grade).trim().length > 30) e.grade = "Must be 30 characters or fewer.";
    else if (!GRADE_RE.test(String(values.grade).trim())) e.grade = "Use letters, numbers, spaces and . % / + - only.";
  }
  return e;
}

/** Returns an error message for an unusable avatar file, or "" when it is fine. */
export function validateAvatarFile(file) {
  if (!file) return "Choose an image.";
  const name = (file.name || "").toLowerCase();
  const extensionOk = AVATAR_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!AVATAR_TYPES.includes(file.type) || !extensionOk) return "Use a JPG, JPEG, PNG or WebP image.";
  if (file.size > MAX_AVATAR_BYTES) return `The image must be ${MAX_AVATAR_BYTES / (1024 * 1024)} MB or smaller.`;
  if (file.size === 0) return "That file is empty.";
  return "";
}

/** The API returns { message, code, errors: [{ field, message }] }. */
export const serverFieldErrors = (err) =>
  Object.fromEntries((err?.data?.errors || []).map((x) => [x.field, x.message]));

export const serverMessage = (err, fallback = "Something went wrong. Please try again.") =>
  err?.data?.message || fallback;