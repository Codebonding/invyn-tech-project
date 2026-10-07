import { services } from "./services";
import { courses } from "./courses";
import { ROUTES } from "../utils/constant";

/* ------------------------------------------------------------------
   ROUTE FLAGS: set a flag to true once that route exists in your router.
   A link whose flag is false renders as plain "coming soon" text, never a broken link.
   ------------------------------------------------------------------ */
export const LIVE = {
  about: true,          // links to the #about section on the homepage
  careers: true,        // "/careers"
  privacy: false,       // "/privacy-policy"
  terms: false,         // "/terms-and-conditions"
  serviceDetail: false, // "/services/:slug"
  courseDetail: false,  // "/courses/:id"
};
const path = (flag, p) => (flag ? p : null);
const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");


export const CONTACT = {
  email: "inyv@gmail.com",     
  phone: "+91 9876543210",     
  location: "Salem, Tamil Nadu, India",  
};

export const SOCIAL = {
  linkedin: "",   
  instagram: "",
  github: "",
  youtube: ""
};

export const footerBrand = {
  description:
    "INVYN TECH is a technology company focused on building practical digital solutions and developing industry-ready technology skills through modern training and hands-on learning.",
};

export const footerColumns = [
  {
    id: "quick",
    title: "Quick Links",
    links: [
      { label: "Home", to: "/" },
      { label: "About", to: path(LIVE.about, "/#about") },
      { label: "Services", to: ROUTES.services },
      { label: "Courses", to: ROUTES.courses },
      { label: "Internships", to: ROUTES.internships },
      { label: "Careers", to: path(LIVE.careers, "/#internship") },
      { label: "Contact", to: ROUTES.contact },
    ],
  },
  {
    id: "services",
    title: "Services",
    links: services.map((s) => ({
      label: s.title,
      to: LIVE.serviceDetail ? `${ROUTES.services}/${slug(s.title)}` : ROUTES.services,
    })),
  },
  {
    id: "courses",
    title: "Courses",
    links: courses.map((c) => ({
      label: c.title,
      to: LIVE.courseDetail ? `${ROUTES.courses}/${c.id}` : ROUTES.courses,
    })),
  },
  {
    id: "internships",
    title: "Internships",
    links: [
      { label: "Internship Programs", to: ROUTES.internships },
      { label: "Apply for Internship", to: ROUTES.contact },
    ],
  },
];

export const legalLinks = [
  { label: "Privacy Policy", to: path(LIVE.privacy, "/privacy-policy") },
  { label: "Terms & Conditions", to: path(LIVE.terms, "/terms-and-conditions") },
];