import { serviceCatalog } from "../data/serviceDetails";
import { getServiceRoute } from "./constant";
import { validateEnrollment } from "./enrollValidation";

/** Catalogue with a display number and a stable route for each service. */
export const allServices = serviceCatalog.map((s, i) => ({ ...s, id: i + 1, href: getServiceRoute(s.slug) }));

export const getServiceBySlug = (slug) => allServices.find((s) => s.slug === slug) || null;

export const enquiryHref = (slug) => `${getServiceRoute(slug)}/enquiry`;

/** Related services: the explicit `related` list first, then same-category services to fill the gap. */
export function getRelatedServices(service, n = 3) {
  const picked = (service.related || []).map(getServiceBySlug).filter(Boolean);
  const filler = allServices.filter((s) => s.slug !== service.slug && !picked.includes(s) && s.category === service.category);
  return [...picked, ...filler].slice(0, n);
}

export const MESSAGE_MAX = 1000;

/** Enquiry = the existing name/email/phone rules plus an optional message. */
export function validateEnquiry(values) {
  const errors = validateEnrollment(values);
  if ((values.message || "").length > MESSAGE_MAX) errors.message = `Keep your message under ${MESSAGE_MAX} characters.`;
  return errors;
}

/** schema.org Service markup for the detail page. */
export const serviceJsonLd = (service, origin) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: service.title,
  description: service.summary,
  serviceType: service.category,
  url: `${origin}${service.href}`,
  provider: { "@type": "Organization", name: "INVYN TECH", url: origin },
});