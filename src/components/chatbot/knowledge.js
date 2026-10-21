import { courses } from "../../data/courses";
import { courseDetails } from "../../data/courseDetails";
import { internshipIntro, internshipBenefits, internshipJourney } from "../../data/internship";
import { CONTACT } from "../../data/footer";
import { ROUTES } from "../../utils/constant";

/**
 * Rule-based answers built ONLY from the site's own public data files. Nothing is sent to a server to answer a
 * question, and the bot has no access to user records. Anything the site does not publish (fees, internship
 * duration or stipend, placements, batch dates...) is never guessed: the bot says so and offers the enquiry form.
 */

export const QUICK_MAIN = ["Courses", "Fees", "Internships", "How to enroll", "Eligibility", "Talk to support"];
export const WELCOME = {
  text: "Hi! I'm the INVYN TECH assistant. I can help with courses, eligibility, internships and how to enrol. What would you like to know?",
  quickReplies: QUICK_MAIN,
};

const norm = (s) => ` ${String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
const hasStem = (t, stems) => stems.some((s) => t.includes(s));
const hasWord = (t, words) => words.some((w) => t.includes(` ${w} `));
const slugOf = (c) => c.href.split("/").pop();

const ALIASES = {
  "ai-ml": ["ai", "ml", "artificial intelligence", "machine learning", "deep learning"],
  "full-stack": ["full stack", "fullstack", "mern", "react", "node", "node js", "nodejs", "javascript", "js", "web development", "web dev"],
  "data-science": ["data science", "data analysis", "data analytics", "data analyst", "pandas", "statistics"],
  cloud: ["cloud", "aws", "docker", "devops", "ci cd"],
  cybersecurity: ["cyber", "cyber security", "security", "ethical hacking", "hacking"],
  python: ["python"],
  java: ["java", "spring"],
  software: ["software", "software engineering", "git", "system design"],
};

const COURSE_INDEX = courses.map((course) => ({
  course,
  names: [course.title, course.shortTitle, ...(ALIASES[course.id] ?? [])].map((n) => norm(n)),
}));
export const findCourse = (text) => {
  const t = norm(text);
  return COURSE_INDEX.find(({ names }) => names.some((n) => t.includes(n)))?.course ?? null;
};

const TECH_INDEX = [...new Set(courses.flatMap((c) => c.technologies))].map((tech) => ({
  tech,
  key: norm(tech),
  courses: courses.filter((c) => c.technologies.includes(tech)),
}));

const KEYS = {
  private: { stems: ["student data", "student record", "student list", "list of students", "all students", "other student", "someone else", "personal data", "database", "other users"], words: ["password", "passwords", "token", "secret", "credentials"] },
  enquiry: ["enquir", "inquir", "call back", "callback", "contact me", "get in touch", "leave my details", "share my details", "request details", "request fee", "request a call", "counsel", "demo class"],
  support: ["support", "talk to", "speak to", "helpline", "phone number", "contact", "email", "reach you", "call you", "address", "location", "office"],
  supportWords: ["human", "agent", "representative"],
  fees: ["fee", "fees", "price", "prices", "pricing", "cost", "costs", "how much", "charges", "payment", "installment", "installments", "emi", "discount", "scholarship"],
  eligibility: ["eligib", "qualif", "prerequisite", "pre requisite", "who can", "requirement", "background", "can i join", "can i apply", "fresher"],
  duration: ["durat", "how long", "months", "weeks", "length", "timeline"],
  mode: ["online", "offline", "mode", "classroom", "remote", "hybrid", "in person", "physical", "virtual"],
  curriculum: ["syllabus", "curriculum", "modules", "topics", "what will i learn", "what do you teach"],
  unlisted: ["placement", "placements", "job", "jobs", "certificate", "certification", "batch", "batches", "start date", "timing", "timings", "schedule", "refund", "trainer", "trainers", "faculty"],
  internship: ["internship", "internships", "intern", "interns", "stipend"],
  enroll: ["enroll", "enrol", "register", "registration", "admission", "apply", "join", "sign up", "signup", "how to start", "get started", "seat"],
  courses: ["course", "courses", "program", "programs", "programme", "training", "technology", "technologies", "learn", "offer", "offers", "available", "catalog", "catalogue", "skills", "stack", "tech"],
  greeting: ["hi", "hii", "hello", "hey", "good morning", "good afternoon", "good evening", "namaste", "vanakkam"],
  thanks: ["thanks", "thank you", "thx", "bye", "goodbye"],
};

const reply = (text, extra = {}) => ({ text, links: [], quickReplies: QUICK_MAIN, action: null, prefill: null, course: null, ...extra });
const viewLink = (c) => ({ label: `View ${c.shortTitle}`, to: c.href });
const enrollLink = (c) => ({ label: `Enrol in ${c.shortTitle}`, to: `${c.href}/enroll` });
const detailsFor = (c) => courseDetails[slugOf(c)] ?? {};

const NOT_PUBLISHED = "That isn't published on our website, and I don't want to guess. Our team can share the exact details.";
const OFFER = ["Request fee details", "Leave my details", "Talk to support"];

function courseList() {
  const lines = courses.map((c) => `• ${c.title}: ${c.duration}, ${c.mode}`).join("\n");
  return reply(`We currently offer ${courses.length} courses:\n${lines}\nTell me a course name to see its details.`, {
    links: [{ label: "Browse all courses", to: ROUTES.courses }],
    quickReplies: [...courses.slice(0, 6).map((c) => c.shortTitle), "Fees"],
  });
}

function courseOverview(c) {
  const eligibility = detailsFor(c).eligibility;
  const lines = [
    c.description,
    `Duration: ${c.duration}`,
    `Mode: ${c.mode}`,
    `Level: ${c.level}`,
    `Technologies: ${c.technologies.join(", ")}`,
    eligibility ? `Eligibility: ${eligibility}` : null,
  ].filter(Boolean);
  return reply(lines.join("\n"), {
    links: [viewLink(c), enrollLink(c)],
    quickReplies: [`Fees for ${c.shortTitle}`, `Syllabus of ${c.shortTitle}`, `Enroll in ${c.shortTitle}`, "Talk to support"],
    course: c.title,
  });
}

function fees(c) {
  const subject = c ? `The fee for ${c.title}` : "Course fees";
  return reply(`${subject} isn't listed on our website, and I don't want to guess a number. Our team shares the current fee, payment options and batch dates directly. Tap "Request fee details" and leave your details, or contact support.`, {
    quickReplies: OFFER,
    course: c?.title ?? null,
  });
}

function eligibility(c) {
  if (c) {
    const d = detailsFor(c);
    const lines = [d.eligibility ?? `Level: ${c.level}.`, ...(d.prerequisites ?? []).slice(0, 3).map((p) => `• ${p}`)];
    return reply(lines.join("\n"), { links: [viewLink(c)], quickReplies: [`Fees for ${c.shortTitle}`, `Enroll in ${c.shortTitle}`, "Talk to support"], course: c.title });
  }
  const lines = courses.map((c) => `• ${c.shortTitle}: ${c.level}`).join("\n");
  return reply(`Eligibility depends on the course. Levels:\n${lines}\nTell me a course name for its detailed eligibility.`, {
    quickReplies: courses.slice(0, 6).map((c) => `Eligibility for ${c.shortTitle}`),
  });
}

function duration(c) {
  if (c) return reply(`${c.title} runs for ${c.duration} (${c.mode}).`, { links: [viewLink(c)], course: c.title, quickReplies: [`Fees for ${c.shortTitle}`, `Enroll in ${c.shortTitle}`, "Talk to support"] });
  const lines = courses.map((x) => `• ${x.title}: ${x.duration}`).join("\n");
  return reply(`Course durations:\n${lines}`, { links: [{ label: "Browse all courses", to: ROUTES.courses }] });
}

function mode(c) {
  const m = c?.mode ?? "Online / Offline";
  return reply(`${c ? `${c.title} is` : "Our courses are"} offered ${m}. The mode available for a particular batch is confirmed by our team when you enquire.`, { course: c?.title ?? null, quickReplies: OFFER });
}

function curriculum(c) {
  const modules = (c && detailsFor(c).curriculum) || [];
  if (!c || modules.length === 0) {
    return reply("Which course would you like the syllabus for?", { quickReplies: courses.slice(0, 6).map((x) => `Syllabus of ${x.shortTitle}`) });
  }
  const shown = modules.slice(0, 8).map((m) => `• ${m.title}`).join("\n");
  return reply(`${c.title} syllabus:\n${shown}${modules.length > 8 ? `\n…and ${modules.length - 8} more` : ""}`, { links: [viewLink(c)], course: c.title, quickReplies: [`Fees for ${c.shortTitle}`, `Enroll in ${c.shortTitle}`] });
}

function internship() {
  const benefits = internshipBenefits.map((b) => b.title).join(", ");
  const journey = internshipJourney.map((j) => j.title).join(" → ");
  return reply(
    `${internshipIntro.description}\nWhat you get: ${benefits}.\nThe journey: ${journey}.\nThe duration, eligibility, selection process and any stipend aren't published online yet. Our team shares those details, so leave your details and they'll contact you.`,
    { links: [{ label: "Internship details", to: ROUTES.internships }], quickReplies: ["Internship enquiry", "Talk to support", "Courses"], prefill: "Internship Program" }
  );
}

function enroll(c) {
  const steps = [
    `How to enrol${c ? ` in ${c.title}` : ""}:`,
    "1. Pick a course on the Courses page.",
    "2. Open the course page and choose Enrol.",
    "3. Submit your name, email and phone number.",
    "4. Our team contacts you with the next steps, including fees and batch dates.",
    "You can also leave your details here and we'll reach out.",
  ].join("\n");
  return reply(steps, {
    links: c ? [enrollLink(c), viewLink(c)] : [{ label: "Browse courses", to: ROUTES.courses }],
    quickReplies: OFFER,
    course: c?.title ?? null,
  });
}

function support() {
  const tel = CONTACT.phone.replace(/[^+\d]/g, "");
  return reply(`You can reach our support team:\nEmail: ${CONTACT.email}\nPhone: ${CONTACT.phone}\nLocation: ${CONTACT.location}\nOr leave your details here and we'll contact you.`, {
    links: [
      { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
      { label: CONTACT.phone, href: `tel:${tel}` },
      { label: "Contact section", to: ROUTES.contact },
    ],
    quickReplies: ["Leave my details", "Courses", "Fees"],
  });
}

const fallback = () => reply("Sorry, I don't have an answer for that yet. I can help with courses, fees, eligibility, internships and how to enrol. For anything else, you can contact our support team or leave your details and we'll get back to you.", {
  quickReplies: ["Talk to support", "Leave my details", "Courses", "Internships"],
});

/** answer(text, ctx) -> { text, links, quickReplies, action, prefill, course }. ctx.course is the last course discussed. */
export function answer(input, ctx = {}) {
  const raw = String(input ?? "").slice(0, 300);
  const t = norm(raw);
  const mentioned = findCourse(raw);
  const known = mentioned ?? courses.find((c) => c.title === ctx.course) ?? null;

  if (hasStem(t, KEYS.private.stems) || hasWord(t, KEYS.private.words)) {
    return reply("I can't share personal or confidential information, including student records or account details. I can help with courses, internships, fees and enrolment, or you can contact our support team.", { quickReplies: ["Talk to support", "Courses", "Fees"] });
  }
  if (hasStem(t, KEYS.enquiry)) {
    const interest = mentioned?.title ?? (hasStem(t, KEYS.internship) ? "Internship Program" : ctx.course ?? null);
    return reply("Happy to help! Please fill in your details below and our team will follow up.", { action: "enquiry", prefill: interest, course: interest });
  }
  if (hasStem(t, KEYS.support) || hasWord(t, KEYS.supportWords)) return support();
  if (hasWord(t, KEYS.thanks)) return reply("You're welcome! Anything else I can help with?");
  if (hasWord(t, KEYS.internship)) return internship();
  if (hasWord(t, KEYS.fees)) return fees(known);
  if (hasStem(t, KEYS.eligibility)) return eligibility(known);
  if (hasStem(t, KEYS.curriculum)) return curriculum(known);
  if (hasStem(t, KEYS.duration)) return duration(known);
  if (hasWord(t, KEYS.mode)) return mode(known);
  if (hasWord(t, KEYS.unlisted)) {
    return reply(`${NOT_PUBLISHED} Leave your details or contact support and they'll get back to you.`, { quickReplies: OFFER, course: known?.title ?? null });
  }
  if (hasStem(t, KEYS.enroll)) return enroll(known);
  if (mentioned) return courseOverview(mentioned);

  const tech = TECH_INDEX.find((x) => t.includes(x.key));
  if (tech) {
    return reply(`Courses that cover ${tech.tech}:\n${tech.courses.map((c) => `• ${c.title}`).join("\n")}`, {
      links: tech.courses.map(viewLink),
      quickReplies: tech.courses.map((c) => c.shortTitle),
    });
  }
  if (hasWord(t, KEYS.courses)) return courseList();
  if (hasWord(t, KEYS.greeting)) return reply(WELCOME.text);
  return fallback();
}