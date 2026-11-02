import { internshipIntro, internshipBenefits, internshipJourney } from "../../data/internship";
import { CONTACT } from "../../data/footer";
import { enrollHref } from "../../utils/courses";
import { ROUTES } from "../../utils/constant";

/**
 * Rule-based answers built ONLY from the site's own public data and the published courses. Nothing is sent to a
 * server to answer a question, and the bot has no access to user records. Anything the site does not publish (fees,
 * internship duration or stipend, placements, batch dates...) is never guessed: the bot says so and points to the
 * Contact section. The bot never collects details or enrols anyone; joining happens on the course's own enrollment page.
 */

export const QUICK_MAIN = ["Courses", "Fees", "Internships", "Eligibility", "Talk to support"];
export const WELCOME = {
  text: "Hi there! I'm the INVYN TECH help desk (a virtual assistant). Ask me about courses, internships or how to join, and I'll point you the right way.",
  quickReplies: QUICK_MAIN,
};

const norm = (s) => ` ${String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
const hasStem = (t, stems) => stems.some((s) => t.includes(s));
const hasWord = (t, words) => words.some((w) => t.includes(` ${w} `));
const slugOf = (c) => c.href.split("/").pop();

// Keyed by the course slug (the end of its URL), so they work for courses that admins add in the database.
const ALIASES = {
  "ai-machine-learning": ["ai", "ml", "artificial intelligence", "machine learning", "deep learning"],
  "full-stack-development": ["full stack", "fullstack", "mern", "react", "node", "node js", "nodejs", "javascript", "js", "web development", "web dev"],
  "data-science": ["data science", "data analysis", "data analytics", "data analyst", "pandas", "statistics"],
  "cloud-computing": ["cloud", "aws", "docker", "devops", "ci cd"],
  cybersecurity: ["cyber", "cyber security", "security", "ethical hacking", "hacking"],
  "python-programming": ["python"],
  "java-development": ["java", "spring"],
  "software-development": ["software", "software engineering", "git", "system design"],
};

function createEngine(courses) {
  const COURSE_INDEX = courses.map((course) => ({
    course,
    names: [course.title, course.shortTitle, ...(ALIASES[slugOf(course)] ?? [])].map((n) => norm(n)),
  }));
  const findCourse = (text) => {
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
    // "call me back", "leave my details" and the like: answered with the contact options, never with a form.
    contact: ["enquir", "inquir", "call back", "callback", "call me", "contact me", "get in touch", "leave my details", "share my details", "request details", "request fee", "request a call", "counsel", "demo class", "support", "talk to", "speak to", "helpline", "phone number", "contact", "email", "reach you", "call you", "address", "location", "office"],
    contactWords: ["human", "agent", "representative"],
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

  const reply = (text, extra = {}) => ({ text, links: [], quickReplies: QUICK_MAIN, course: null, ...extra });
  const viewLink = (c) => ({ label: `View ${c.shortTitle}`, to: c.href });
  const contactLink = { label: "Contact us", to: ROUTES.contact };
  const detailsFor = (c) => ({
    eligibility: c.eligibility || undefined,
    prerequisites: c.prerequisites ?? [],
    curriculum: (c.moduleTitles ?? []).map((title) => ({ title })),
  });
  const hasFee = (c) => typeof c?.fee === "number";
  const money = (c) => `₹${Number(c.fee).toLocaleString("en-IN")}`; // only ever a value an admin entered

  const NOT_PUBLISHED = "That isn't published on our website, and I don't want to guess. Our team can share the exact details.";
  const ASK_TEAM = ["Talk to support", "Courses"];
  const followUps = (c) => [`Fees for ${c.shortTitle}`, `Eligibility for ${c.shortTitle}`, `Syllabus of ${c.shortTitle}`, "Talk to support"];

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
      hasFee(c) ? `Fee: ${money(c)}` : null,
      eligibility ? `Eligibility: ${eligibility}` : null,
    ].filter(Boolean);
    return reply(lines.join("\n"), { links: [viewLink(c)], quickReplies: followUps(c), course: c.title });
  }

  function fees(c) {
    if (hasFee(c)) {
      return reply(`The fee for ${c.title} is ${money(c)}. Payment options and the next batch dates are shared by our team, so please get in touch.`, { links: [contactLink], quickReplies: ASK_TEAM, course: c.title });
    }
    const priced = courses.filter(hasFee);
    const published = !c && priced.length ? `\nFees we have published:\n${priced.map((x) => `• ${x.title}: ${money(x)}`).join("\n")}` : "";
    const subject = c ? `The fee for ${c.title} isn't` : "Course fees aren't";
    return reply(`${subject} listed on our website, and I don't want to guess a number. Our team shares the current fee, payment options and batch dates directly, so please contact support.${published}`, {
      links: [contactLink],
      quickReplies: ASK_TEAM,
      course: c?.title ?? null,
    });
  }

  function eligibility(c) {
    if (c) {
      const d = detailsFor(c);
      const lines = [d.eligibility ?? `Level: ${c.level}.`, ...(d.prerequisites ?? []).slice(0, 3).map((p) => `• ${p}`)];
      return reply(lines.join("\n"), { links: [viewLink(c)], quickReplies: [`Fees for ${c.shortTitle}`, `Syllabus of ${c.shortTitle}`, "Talk to support"], course: c.title });
    }
    const lines = courses.map((x) => `• ${x.shortTitle}: ${x.level}`).join("\n");
    return reply(`Eligibility depends on the course. Levels:\n${lines}\nTell me a course name for its detailed eligibility.`, {
      quickReplies: courses.slice(0, 6).map((x) => `Eligibility for ${x.shortTitle}`),
    });
  }

  function duration(c) {
    if (c) return reply(`${c.title} runs for ${c.duration} (${c.mode}).`, { links: [viewLink(c)], course: c.title, quickReplies: [`Fees for ${c.shortTitle}`, `Eligibility for ${c.shortTitle}`, "Talk to support"] });
    const lines = courses.map((x) => `• ${x.title}: ${x.duration}`).join("\n");
    return reply(`Course durations:\n${lines}`, { links: [{ label: "Browse all courses", to: ROUTES.courses }] });
  }

  function mode(c) {
    const m = c?.mode ?? "Online / Offline";
    return reply(`${c ? `${c.title} is` : "Our courses are"} offered ${m}. The mode available for a particular batch is confirmed by our team when you get in touch.`, { links: [contactLink], course: c?.title ?? null, quickReplies: ASK_TEAM });
  }

  function curriculum(c) {
    const modules = (c && detailsFor(c).curriculum) || [];
    if (!c) {
      return reply("Which course would you like the syllabus for?", { quickReplies: courses.slice(0, 6).map((x) => `Syllabus of ${x.shortTitle}`) });
    }
    if (modules.length === 0) {
      return reply(`The detailed syllabus for ${c.title} isn't published yet. Our team can share it, so please contact support.`, { links: [viewLink(c), contactLink], quickReplies: ASK_TEAM, course: c.title });
    }
    const shown = modules.slice(0, 8).map((m) => `• ${m.title}`).join("\n");
    return reply(`${c.title} syllabus:\n${shown}${modules.length > 8 ? `\n…and ${modules.length - 8} more` : ""}`, { links: [viewLink(c)], course: c.title, quickReplies: [`Fees for ${c.shortTitle}`, `Eligibility for ${c.shortTitle}`] });
  }

  function internship() {
    const benefits = internshipBenefits.map((b) => b.title).join(", ");
    const journey = internshipJourney.map((j) => j.title).join(" → ");
    return reply(
      `${internshipIntro.description}\nWhat you get: ${benefits}.\nThe journey: ${journey}.\nThe duration, eligibility, selection process and any stipend aren't published online yet. Our team shares those details, so please get in touch.`,
      { links: [{ label: "Internship details", to: ROUTES.internships }, contactLink], quickReplies: ["Talk to support", "Courses", "Fees"] }
    );
  }

  /** Joining happens on the course's own enrollment page. The bot only points there; it never enrols anyone itself. */
  function enrollRedirect(c) {
    if (!c) {
      return reply("Interested in joining? Choose a course first, then continue through its dedicated enrollment page.", {
        links: [{ label: "Browse courses", to: ROUTES.courses }],
        quickReplies: ["Courses", "Fees", "Eligibility", "Talk to support"],
      });
    }
    return reply("Interested in joining this course? You can continue through our dedicated enrollment page.", {
      links: [{ label: "Go to the enrollment page", to: enrollHref(slugOf(c)) }, viewLink(c)],
      quickReplies: [`Fees for ${c.shortTitle}`, `Eligibility for ${c.shortTitle}`, "Talk to support"],
      course: c.title,
    });
  }

  function support() {
    const tel = CONTACT.phone.replace(/[^+\d]/g, "");
    return reply(`You can reach our support team:\nEmail: ${CONTACT.email}\nPhone: ${CONTACT.phone}\nLocation: ${CONTACT.location}\nYou can also use the contact section on our website.`, {
      links: [
        { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
        { label: CONTACT.phone, href: `tel:${tel}` },
        { label: "Contact section", to: ROUTES.contact },
      ],
      quickReplies: ["Courses", "Fees", "Internships"],
    });
  }

  const fallback = () => reply("Sorry, I don't have an answer for that yet. I can help with courses, fees, eligibility and internships. For anything else, please contact our support team.", {
    quickReplies: ["Talk to support", "Courses", "Internships"],
  });

  function answer(input, ctx = {}) {
    const raw = String(input ?? "").slice(0, 300);
    const t = norm(raw);
    const mentioned = findCourse(raw);
    const known = mentioned ?? courses.find((c) => c.title === ctx.course) ?? null;

    if (hasStem(t, KEYS.private.stems) || hasWord(t, KEYS.private.words)) {
      return reply("I can't share personal or confidential information, including student records or account details. I can help with courses, internships and fees, or you can contact our support team.", { quickReplies: ["Talk to support", "Courses", "Fees"] });
    }
    if (hasStem(t, KEYS.contact) || hasWord(t, KEYS.contactWords)) return support();
    if (hasWord(t, KEYS.thanks)) return reply("You're welcome! Anything else I can help with?");
    if (hasWord(t, KEYS.internship)) return internship();
    if (hasWord(t, KEYS.fees)) return fees(known);
    if (hasStem(t, KEYS.eligibility)) return eligibility(known);
    if (hasStem(t, KEYS.curriculum)) return curriculum(known);
    if (hasStem(t, KEYS.duration)) return duration(known);
    if (hasWord(t, KEYS.mode)) return mode(known);
    if (hasWord(t, KEYS.unlisted)) {
      return reply(`${NOT_PUBLISHED} Please contact support and they'll get back to you.`, { links: [contactLink], quickReplies: ASK_TEAM, course: known?.title ?? null });
    }
    if (hasStem(t, KEYS.enroll)) return enrollRedirect(known);
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
  return { answer, findCourse };
}

const engines = new WeakMap();
const engineFor = (list) => {
  if (!engines.has(list)) engines.set(list, createEngine(list));
  return engines.get(list);
};

export const findCourse = (text, list = []) => engineFor(list).findCourse(text);
export const answer = (input, ctx = {}, list = []) => engineFor(list).answer(input, ctx);