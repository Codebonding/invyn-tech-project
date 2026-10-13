import { hasKnownFee } from "./courses";

export const SORTS = [
  { value: "default", label: "Featured order" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "duration-asc", label: "Duration: shortest first" },
  { value: "duration-desc", label: "Duration: longest first" },
  { value: "fee-asc", label: "Fee: low to high" },
  { value: "fee-desc", label: "Fee: high to low" },
];

export const BUCKETS = [
  { value: "short", label: "Up to 3 months", test: (m) => m <= 3 },
  { value: "medium", label: "4 to 5 months", test: (m) => m > 3 && m <= 5 },
  { value: "long", label: "6 months or more", test: (m) => m > 5 },
];

export function monthsOf(c) {
  const m = String(c.duration || "").match(/(\d+(?:\.\d+)?)\s*(week|month|year)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const u = m[2].toLowerCase();
  return u === "week" ? n / 4.345 : u === "year" ? n * 12 : n;
}

export const modesOf = (c) => String(c.mode || "").split(/[\/,&]| and /i).map((s) => s.trim()).filter(Boolean);

const unique = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b));

export function buildOptions(list) {
  const months = list.map(monthsOf).filter((m) => m !== null);
  return {
    categories: unique(list.map((c) => c.category).filter(Boolean)),
    modes: unique(list.flatMap(modesOf)),
    durations: BUCKETS.filter((b) => months.some(b.test)),
    sorts: SORTS.filter((s) => (s.value.startsWith("fee") ? list.some(hasKnownFee) : s.value.startsWith("duration") ? months.length > 0 : true)),
  };
}

export function filterCourses(list, { q = "", category = "", mode = "", duration = "" } = {}) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const bucket = BUCKETS.find((b) => b.value === duration);
  return list.filter((c) => {
    if (words.length) {
      const hay = [c.title, c.shortTitle, c.category, c.description, ...(c.technologies || [])].join(" ").toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    if (category && c.category !== category) return false;
    if (mode && !modesOf(c).includes(mode)) return false;
    if (bucket) {
      const m = monthsOf(c);
      if (m === null || !bucket.test(m)) return false;
    }
    return true;
  });
}

export function sortCourses(list, sort = "default") {
  if (sort === "default") return list;
  const byName = (a, b) => a.title.localeCompare(b.title);
  const num = (get, dir) => (a, b) => {
    const x = get(a), y = get(b);
    if (x === null && y === null) return byName(a, b);
    if (x === null) return 1;
    if (y === null) return -1;
    return (x - y) * dir || byName(a, b);
  };
  const fee = (c) => (hasKnownFee(c) ? c.fee : null);
  const cmp = {
    "name-asc": byName,
    "name-desc": (a, b) => byName(b, a),
    "duration-asc": num(monthsOf, 1),
    "duration-desc": num(monthsOf, -1),
    "fee-asc": num(fee, 1),
    "fee-desc": num(fee, -1),
  }[sort];
  return cmp ? [...list].sort(cmp) : list;
}