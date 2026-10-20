import { ROUTES } from "./constant";
export const COURSES = [
  {
    label: "AI & Machine Learning",
    to: "/courses/ai-machine-learning",
    desc: "Models, neural networks and MLOps",
  },
  {
    label: "Full Stack Development",
    to: "/courses/full-stack-development",
    desc: "React, Node.js and databases",
  },
  {
    label: "Data Science",
    to: "/courses/data-science",
    desc: "Analytics, statistics and visualization",
  },
  {
    label: "Cloud Computing",
    to: "/courses/cloud-computing",
    desc: "AWS, Azure and DevOps foundations",
  },
  {
    label: "Cybersecurity",
    to: "/courses/cybersecurity",
    desc: "Ethical hacking, defense and compliance",
  },
  {
    label: "Python",
    to: "/courses/python-programming",
    desc: "From fundamentals to automation",
  },
  {
    label: "Java",
    to: "/courses/java-development",
    desc: "Core Java, Spring Boot and services",
  },
  {
    label: "Software Development",
    to: "/courses/software-development",
    desc: "Design, testing and delivery practice",
  },
];
export const SERVICES = [
  {
    label: "Web Development",
    to: "/services/web-development",
    desc: "Fast, scalable business websites",
  },
  {
    label: "Mobile App Development",
    to: "/services/mobile-app-development",
    desc: "iOS and Android products",
  },
  {
    label: "AI Solutions",
    to: "/services/ai-solutions",
    desc: "Automation and intelligent systems",
  },
  {
    label: "Cloud Solutions",
    to: "/services/cloud-solutions",
    desc: "Migration, hosting and infrastructure",
  },
  {
    label: "Software Development",
    to: "/services/software-development",
    desc: "Custom enterprise applications",
  },
  {
    label: "IT Consulting",
    to: "/services/it-consulting",
    desc: "Architecture and technology strategy",
  },
  {
    label: "Corporate Training",
    to: "/services/corporate-training",
    desc: "Upskilling programs for your teams",
  },
];
export const NAV_ITEMS = [
  { id: "home", label: "Home", to: ROUTES.home, end: true },
  { id: "about", label: "About", to: ROUTES.about },

  {
    id: "courses",
    label: "Courses",
    to: ROUTES.courses,
    items: COURSES,
    wide: true,
    allLabel: "View all courses",
  },

  {
    id: "services",
    label: "Services",
    to: ROUTES.services,
    items: SERVICES,
    wide: false,
    allLabel: "View all services",
  },
  { id: "internships", label: "Internships", to: ROUTES.internships },
  { id: "contact", label: "Contact", to: ROUTES.contact },
];
export const CTA = {
  label: "Enroll Now",
  to: ROUTES.contact,
};
export const LOGIN_ROUTE = ROUTES.login;
export const ACCOUNT_ROUTE = ROUTES.account;
export const DESKTOP_QUERY = "(min-width: 1200px)"; // Bootstrap "xl": must match the d-xl-* classes used in Navbar.jsx

/** NavLink ignores "?query", so "/?section=about" would be active on every home view. Match path and section ourselves. */
export function isNavActive(item, { pathname, search }) {
  const [path, query = ""] = item.to.split("?");
  const wanted = new URLSearchParams(query).get("section");
  const current = new URLSearchParams(search).get("section");
  if (wanted) return pathname === path && current === wanted;
  if (item.end) return pathname === path && !current;
  return pathname === path || pathname.startsWith(`${path}/`);
}
/** Shown instead of NAV_ITEMS when the signed-in user is an Admin (the server still enforces every permission). */
export const ADMIN_NAV_ITEMS = [
  { id: "admin-employees", label: "Employees", to: ROUTES.adminEmployees },
  { id: "admin-site", label: "View website", to: ROUTES.home, end: true },
];