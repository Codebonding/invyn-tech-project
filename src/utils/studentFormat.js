const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const TIME = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
const WEEKDAY = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

const valid = (v) => (v && !Number.isNaN(new Date(v).getTime()) ? new Date(v) : null);

export const formatDate = (v) => (valid(v) ? DATE.format(valid(v)) : "—");
export const formatTime = (v) => (valid(v) ? TIME.format(valid(v)) : "—");
export const formatSessionDay = (v) => (valid(v) ? WEEKDAY.format(valid(v)) : "—");

/** "5 minutes ago", "yesterday"... falls back to a calendar date after a week. */
export function formatRelative(v, now = Date.now()) {
  const d = valid(v);
  if (!d) return "—";
  const seconds = Math.round((now - d.getTime()) / 1000);
  if (seconds < 45) return "just now";
  const units = [["minute", 60], ["hour", 3600], ["day", 86400]];
  if (seconds < 7 * 86400) {
    let best = units[0];
    for (const u of units) if (seconds >= u[1]) best = u;
    const n = Math.floor(seconds / best[1]);
    return `${n} ${best[0]}${n === 1 ? "" : "s"} ago`;
  }
  return DATE.format(d);
}

export const initials = (name = "") =>
  name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "S";