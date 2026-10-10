import python from "../assets/images/course-images/python.png";
import logo from "../assets/images/invyn-logo.png";
import react from "../assets/images/course-images/react.png";
import js from "../assets/images/course-images/js.png";
import cloud from "../assets/images/course-images/cloud.png";
import AI from "../assets/images/course-images/Ai.png";
import Docker from "../assets/images/course-images/docker.png";
import Java from "../assets/images/course-images/java.png";
import MySql from "../assets/images/course-images/mysql.png";
import git from "../assets/images/course-images/git.png";
import node from "../assets/images/course-images/node.png";
import MongoDB from "../assets/images/course-images/MongoDB.png";


export const technologiesIntro = {
  eyebrow: "TECHNOLOGY STACK",
  description:
    "From modern web frameworks to AI and cloud tools, INVYN TECH works with practical, industry-relevant technologies for both technology solutions and technology training.",
};

export const technologies = [
  { id: "react", name: "React", image:react, category: "Frontend", description: "Component-based interfaces for fast, maintainable web applications." },
  { id: "javascript", name: "JavaScript", image:js, category: "Frontend", description: "The language of the web, for interactive and full-stack development." },
  { id: "python", name: "Python", image:python, category: "Backend & AI", description: "A versatile language for automation, APIs, data work and AI." },
  { id: "nodejs", name: "Node.js", image:node, category: "Backend", description: "A JavaScript runtime for scalable APIs and services." },
  { id: "mysql", name: "MySQL", image:MySql, category: "Database", description: "A reliable relational database for structured business data." },
  { id: "mongodb", name: "MongoDB", image:MongoDB, category: "Database", description: "A flexible document database for fast-moving applications." },
  { id: "java", name: "Java", image:Java, category: "Backend", description: "A robust, object-oriented platform for enterprise applications." },
  { id: "ai", name: "AI", image:AI, category: "AI & Data", description: "Machine learning and generative AI for intelligent applications." },
  { id: "cloud", name: "Cloud", image:cloud, category: "Cloud & DevOps", description: "Scalable hosting, storage and deployment infrastructure." },
  { id: "git", name: "Git", image:git, category: "Tools", description: "Version control and collaboration for every project." },
  { id: "docker", name: "Docker", image:Docker, category: "Cloud & DevOps", description: "Containers for consistent builds and reliable deployments." },
];