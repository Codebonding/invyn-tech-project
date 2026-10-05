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
    to: "/courses/python",
    desc: "From fundamentals to automation",
  },
  {
    label: "Java",
    to: "/courses/java",
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
  { id: "home", label: "Home", to: "/", end: true },
  { id: "about", label: "About", to: "/about" },
  {
    id: "courses",
    label: "Courses",
    to: "/courses",
    items: COURSES,
    wide: true,
    allLabel: "View all courses",
  },
  {
    id: "services",
    label: "Services",
    to: "/services",
    items: SERVICES,
    wide: false,
    allLabel: "View all services",
  },
  { id: "careers", label: "Careers", to: "/careers" },
  { id: "contact", label: "Contact", to: "/contact" },
];
export const CTA = {
  label: "Enroll Now",
  to: "/contact",
};
export const DESKTOP_QUERY = "(min-width: 992px)";
