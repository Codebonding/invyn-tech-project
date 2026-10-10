
export const homeContent = {
  technology: {
    eyebrow: "TECHNOLOGY STACK",
    title: ["Technologies We ", "Build With", ""],
    description:
      "From modern web frameworks to AI and cloud tools, INVYN TECH works with practical, industry-relevant technologies for both technology solutions and technology training.",
    filterLabel: "Highlight technologies by category"
  },
  why: {
    eyebrow: "WHY INVYN TECH",
    title: ["Where Learning Meets ", "Real Technology", ""],
    description: "Practical training and real technology solutions, built on the same modern engineering practices.",
  },
  testimonials: {
    eyebrow: "TESTIMONIALS",
    title: ["What Our ", "Community Says", ""],
    description: "What learners and clients say about working and learning with INVYN TECH.",
    emptyText: "Learner and client stories will appear here soon.",
    emptyCta: "Start your own story with INVYN TECH",
  },
  cta: {
    eyebrow: "GET STARTED",
    title: ["Ready to Build, Learn and ", "Grow With INVYN TECH?", ""],
    description:
      "Start a technology course or internship, or talk to us about web, software and AI solutions for your business.",
    primary: "Explore Courses",
    secondary: "Talk to INVYN TECH",
    // route = key of ROUTES; items whose route is missing are skipped (never a broken link)
    paths: [
      { step: "01", route: "courses", title: "Learn", text: "Courses" },
    //   { step: "02", route: "internships", title: "Practice", text: "Internships" },
      { step: "02", route: "services", title: "Build", text: "Services" },
    ],
  },
};