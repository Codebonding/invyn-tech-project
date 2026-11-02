import { assetUrl } from "./assetUrl";
import { ROUTES } from "./constant";

/** Maps a course from the API into the shape the card, pages and chatbot use. Detail fields are filled only for the single-course endpoint. */
export function toCardCourse(c) {
  return {
    id: `live-${c.slug}`,   
    courseId: c.id ?? null, // the database id, sent when a student enrols
    slug: c.slug,
    title: c.title,
    shortTitle: c.shortTitle || c.title,
    description: c.description || "",
    category: c.category,
    duration: c.duration,
    mode: c.mode,
    level: c.level,
    technologies: c.technologies || [],
    ...(typeof c.fee === "number" ? { fee: c.fee, feeCurrency: "INR" } : {}),
    ...(c.imageUrl ? { image: assetUrl(c.imageUrl) } : {}), // no image -> the card's built-in artwork is used
    eligibility: c.eligibility || "",
    prerequisites: c.prerequisites || [],
    moduleTitles: c.moduleTitles || [],
    curriculum: c.curriculum || [],
    outcomes: c.outcomes || [],
    projects: c.projects || [],
    faqs: c.faqs || [],
    certificate: c.certificate || "",
    href: `${ROUTES.courses}/${c.slug}`,
    source: "live",
  };
}