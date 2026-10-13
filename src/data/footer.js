import { courses } from "./courses";
import { allServices } from "../utils/services-page";
import { ROUTES } from "../utils/constant";

 
export const LIVE = {
  about: true,    // "/#about" section on the homepage
  careers: false, // "/careers" page does not exist yet
  privacy: false, // "/privacy-policy"
  terms: false,   // "/terms-and-conditions"
};
const path = (flag, p) => (flag ? p : null);

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
      { label: "Careers", to: path(LIVE.careers, ROUTES.careers) },
      { label: "Contact", to: ROUTES.contact },
    ],
  },
  {
    id: "services",
    title: "Services",
    links: allServices.map((s) => ({ label: s.title, to: s.href })),
  },
  {
    id: "courses",
    title: "Courses",
    links: courses.map((c) => ({ label: c.title, to: c.href })),
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