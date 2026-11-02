import { ROUTES } from "./constant";

export const slugify = (s) =>
  String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Stable slug: explicit `slug`, else the last segment of the `href`, else the slugified title. */
export const slugOf = (c) =>
  c.slug || (typeof c.href === "string" && c.href.split("/").filter(Boolean).pop()) || slugify(c.title);

export const courseHref = (slug) => `${ROUTES.courses}/${slug}`;
export const enrollHref = (slug) => `${ROUTES.courses}/${slug}/enroll`;

export function getRelated(course, n = 3, list = []) {
  const tech = new Set(course.technologies || []);
  return list
    .filter((c) => c.slug !== course.slug)
    .map((c) => ({
      c,
      score: (c.category === course.category ? 10 : 0) + (c.technologies || []).filter((t) => tech.has(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.c);
}

export const hasKnownFee = (c) => typeof c.fee === "number" && c.fee >= 0;

export function feeLabel(c) {
  if (!hasKnownFee(c)) return "Contact for fee details";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: c.feeCurrency || "INR", maximumFractionDigits: 0 }).format(c.fee);
}

export const trimText = (s, n = 155) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`);