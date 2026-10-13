export const homeSeo = {
  title: "INVYN TECH | IT Solutions, AI, Software Development & Technology Training",
  description:
    "INVYN TECH provides IT solutions, software development, AI services, practical technology training, and internship programs for businesses, students, and aspiring developers.",
  canonical: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
};

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export function applySeo({ title, description, canonical }) {
  if (typeof document === "undefined") return;
  document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:type", "website");
  if (canonical) {
    setMeta("property", "og:url", canonical);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
  }
}
/** Adds (or removes, when data is null) one JSON-LD block for the current page. */
export function setJsonLd(data) {
  if (typeof document === "undefined") return;
  let el = document.getElementById("inv-jsonld");
  if (!data) { el?.remove(); return; }
  if (!el) {
    el = document.createElement("script");
    el.id = "inv-jsonld";
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}