import image1 from "../assets/images/course-images/ai-ml.jpg";
import image2 from "../assets/images/course-images/python.jpg";
export const coursesIntro = {
  eyebrow: "LEARN WITH INVYN TECH",
  description:
    "Our practical technology courses are designed to help students and aspiring developers move from learning concepts to building real-world projects.",
};

export const courses = [
 { id: "ai-ml", title: "AI & Machine Learning", shortTitle: "AI & ML", category: "AI", duration: "6 Months", mode: "Online / Offline", level: "Beginner to Advanced", description: "Build practical AI and machine learning skills, from data handling to model building and deployment.", technologies: ["Python", "Machine Learning", "Deep Learning"], image: image1, href: "/courses/ai-machine-learning" },
  { id: "full-stack", title: "Full Stack Development", shortTitle: "Full Stack", category: "Web", duration: "6 Months", mode: "Online / Offline", level: "Beginner to Advanced", description: "Create complete web applications with frontend, backend, databases, APIs and deployment.", technologies: ["React", "Node.js", "SQL"], image: null, href: "/courses/full-stack-development" },
  { id: "data-science", title: "Data Science", shortTitle: "Data Science", category: "Data", duration: "5 Months", mode: "Online / Offline", level: "Beginner to Intermediate", description: "Analyse data, build visualisations and turn raw information into practical business insight.", technologies: ["Python", "Pandas", "Statistics"], image: null, href: "/courses/data-science" },
  { id: "cloud", title: "Cloud Computing", shortTitle: "Cloud", category: "Cloud", duration: "4 Months", mode: "Online / Offline", level: "Intermediate", description: "Learn cloud infrastructure, containers and deployment workflows used by modern teams.", technologies: ["AWS", "Docker", "CI/CD"], image: null, href: "/courses/cloud-computing" },
  { id: "cybersecurity", title: "Cybersecurity", shortTitle: "Security", category: "Security", duration: "5 Months", mode: "Online / Offline", level: "Beginner to Intermediate", description: "Understand threats, secure systems and networks, and learn defensive security practices.", technologies: ["Networking", "Ethical Hacking", "Security Tools"], image: null, href: "/courses/cybersecurity" },
  { id: "python", title: "Python Programming", shortTitle: "Python", category: "Programming", duration: "4 Months", mode: "Online / Offline", level: "Beginner to Intermediate", description: "Build strong programming fundamentals and practical applications using Python.", technologies: ["Python", "OOP", "Automation"], image: image2, href: "/courses/python-programming" },
  { id: "java", title: "Java Development", shortTitle: "Java", category: "Programming", duration: "4 Months", mode: "Online / Offline", level: "Beginner to Intermediate", description: "Learn core and advanced Java to build reliable, scalable applications.", technologies: ["Java", "OOP", "Spring"], image: null, href: "/courses/java-development" },
  { id: "software", title: "Software Development", shortTitle: "Software", category: "Software", duration: "6 Months", mode: "Online / Offline", level: "Beginner to Advanced", description: "Learn the full software lifecycle: design, development, testing, version control and teamwork.", technologies: ["Git", "Testing", "System Design"], image: null, href: "/courses/software-development" }
];
