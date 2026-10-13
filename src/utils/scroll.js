import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useReducedMotion from "../hooks/useReducedMotion";

// ROUTES in constant.js link to "/?section=<key>"; map each key to the real section id on the home page.
export const SECTION_IDS = {
  about: "about",
  services: "services",
  courses: "courses",
  internship: "internship",
  technology: "technology",
  why: "why",
  testimonials: "testimonials",
  cta: "get-started",
};

/** Scrolls to "/?section=..." targets; scrolls to top on other page changes. ("/#id" links are handled in Footer.) */
export function useSectionScroll() {
  const { pathname, search, hash } = useLocation();
  const reduced = useReducedMotion();
  const section = new URLSearchParams(search).get("section");
  useEffect(() => {
    const id = section && SECTION_IDS[section];
    if (!id) {
      if (!hash) window.scrollTo(0, 0);
      return undefined;
    }
    // Wait a tick so the home sections are mounted when arriving from another route.
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(t);
  }, [pathname, section, hash, reduced]);
}