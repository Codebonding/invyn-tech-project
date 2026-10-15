const mod = (title, ...topics) => ({ title, topics });

export const courseDetails = {
  "ai-machine-learning": {
    eligibility:
      "Suitable for students, graduates, working professionals, and beginners interested in AI. Basic mathematics is helpful.",
    prerequisites: [
      "No prior programming experience is required for the beginner track.",
      "Basic algebra, percentages, and interpreting charts are helpful.",
      "A laptop or desktop with internet access is recommended.",
    ],

    curriculum: [
      mod(
        "Module 1: Python and Programming Foundations",
        "Python installation and development environment setup",
        "Variables, data types, operators, and type conversion",
        "Conditional statements, loops, and functions",
        "Lists, tuples, sets, dictionaries, and string operations",
        "File handling, exceptions, modules, and packages",
        "NumPy arrays, vectorised operations, and numerical computing",
        "Pandas Series, DataFrames, filtering, grouping, and data cleaning",
        "Exploratory data analysis and Matplotlib visualisations"
      ),
      mod(
        "Module 2: Mathematics and Statistics for AI",
        "Linear algebra fundamentals: vectors, matrices, and operations",
        "Mean, median, variance, standard deviation, and distributions",
        "Probability, conditional probability, and Bayes' theorem",
        "Correlation, covariance, and statistical relationships",
        "Sampling, data distributions, and outlier analysis",
        "Gradient descent intuition and optimisation fundamentals",
        "Applying mathematical concepts to practical datasets"
      ),
      mod(
        "Module 3: Data Preparation and Feature Engineering",
        "Collecting and importing structured datasets",
        "Handling missing values, duplicates, and inconsistent records",
        "Categorical encoding and numerical feature scaling",
        "Feature selection and feature engineering techniques",
        "Training, validation, and test dataset splitting",
        "Preventing data leakage and evaluating data quality",
        "Building reusable data preprocessing pipelines"
      ),
      mod(
        "Module 4: Machine Learning Algorithms",
        "Supervised and unsupervised learning fundamentals",
        "Linear regression and multiple regression",
        "Logistic regression and classification workflows",
        "Decision trees, random forests, and ensemble learning",
        "K-nearest neighbours and support vector machines",
        "K-means clustering and dimensionality reduction basics",
        "Scikit-learn model training and reusable pipelines",
        "Hyperparameter tuning and cross-validation"
      ),
      mod(
        "Module 5: Model Evaluation and Improvement",
        "Classification and regression evaluation metrics",
        "Accuracy, precision, recall, F1-score, and confusion matrices",
        "MAE, MSE, RMSE, and R-squared",
        "Bias, variance, overfitting, and underfitting",
        "Baseline models and systematic model comparison",
        "Class imbalance and model generalisation",
        "Experiment tracking and documenting model performance"
      ),
      mod(
        "Module 6: Deep Learning and Neural Networks",
        "Neurons, layers, activation functions, and network architecture",
        "Forward propagation and backpropagation concepts",
        "Loss functions, optimisers, and training loops",
        "Introduction to TensorFlow/Keras or PyTorch",
        "Convolutional neural networks for image tasks",
        "Sequence models and introductory attention mechanisms",
        "GPU acceleration and model training considerations"
      ),
      mod(
        "Module 7: Generative AI and NLP Fundamentals",
        "Natural language processing and text preprocessing",
        "Tokenisation, embeddings, and semantic similarity",
        "Transformer architecture and attention fundamentals",
        "Large language model capabilities and limitations",
        "Prompt engineering and structured model outputs",
        "Introduction to retrieval-augmented generation (RAG)",
        "Responsible AI, privacy, bias, and output evaluation"
      ),
      mod(
        "Module 8: Model Deployment and Capstone",
        "Saving, loading, and versioning trained models",
        "Building prediction APIs using FastAPI or Flask",
        "Input validation, error handling, and response formatting",
        "Connecting a model to a simple frontend",
        "Basic deployment, logging, and model monitoring concepts",
        "Git and GitHub for project version control",
        "Capstone development, testing, documentation, and presentation"
      ),
    ],

    outcomes: [
      "Write Python programs for data processing, analysis, and automation.",
      "Clean, transform, explore, and visualise real-world datasets.",
      "Apply probability and statistical concepts to machine learning problems.",
      "Train regression, classification, clustering, and ensemble models.",
      "Select appropriate evaluation metrics and compare model performance.",
      "Understand neural networks and implement introductory deep learning workflows.",
      "Explain core concepts behind NLP, generative AI, LLMs, and RAG.",
      "Build a prediction API and integrate a trained model into an application.",
      "Create a documented end-to-end AI project suitable for a portfolio.",
    ],

    projects: [
      "House price or sales prediction using regression.",
      "Customer churn or loan-risk classification using structured data.",
      "Image classification or text sentiment analysis.",
      "Capstone: an AI-powered prediction application with an API and frontend.",
    ],

    faqs: [
      {
        q: "Do I need programming experience before joining?",
        a: "No. The beginner track starts with Python fundamentals before moving into data analysis and machine learning.",
      },
      {
        q: "Will I build practical AI projects?",
        a: "The curriculum includes guided exercises and project work, progressing from data analysis to model training and deployment.",
      },
      {
        q: "Will this course cover Generative AI?",
        a: "The proposed curriculum introduces LLMs, prompt engineering, embeddings, and RAG alongside core AI and machine learning concepts.",
      },
    ],
  },

  "full-stack-development": {
    eligibility:
      "Suitable for students, graduates, aspiring developers, and career switchers interested in web application development.",
    prerequisites: [
      "No prior coding experience is required for the beginner track.",
      "Basic computer skills and logical thinking are helpful.",
      "A laptop or desktop with internet access is recommended.",
    ],

    curriculum: [
      mod(
        "Module 1: Web Development Foundations",
        "How websites, browsers, servers, and HTTP work",
        "HTML document structure, semantic elements, and forms",
        "CSS selectors, box model, positioning, and layouts",
        "Flexbox, CSS Grid, responsive design, and media queries",
        "Typography, colours, accessibility, and reusable styles",
        "JavaScript variables, operators, conditions, and loops",
        "Functions, arrays, objects, and DOM manipulation",
        "Events, validation, and browser developer tools"
      ),
      mod(
        "Module 2: Modern JavaScript and Git",
        "Scope, closures, and modern JavaScript syntax",
        "Destructuring, spread syntax, and array methods",
        "Modules, imports, and exports",
        "Promises, async/await, and error handling",
        "Fetch API and JSON data processing",
        "Git repositories, commits, branches, and merges",
        "GitHub collaboration, pull requests, and conflict resolution"
      ),
      mod(
        "Module 3: Frontend Development with React",
        "React project setup with Vite",
        "Components, JSX, props, and reusable UI",
        "State management with useState",
        "Side effects and data fetching with useEffect",
        "Forms, controlled inputs, and form validation",
        "Conditional rendering and list rendering with unique keys",
        "React Router, layouts, navigation, and route parameters",
        "Context API and shared application state",
        "Reusable hooks, component organisation, and error states"
      ),
      mod(
        "Module 4: Responsive UI and API Integration",
        "Bootstrap grid, containers, utilities, and responsive components",
        "Designing accessible and mobile-friendly interfaces",
        "Integrating frontend components with REST APIs",
        "Loading states, empty states, and API error handling",
        "Search, filtering, sorting, and pagination",
        "Image optimisation and frontend performance basics",
        "SEO fundamentals and semantic page structure"
      ),
      mod(
        "Module 5: Backend Development with Node.js",
        "Node.js runtime, npm, packages, and project configuration",
        "Modules, environment variables, and configuration management",
        "Express application structure and middleware",
        "REST API design and HTTP methods",
        "Routes, controllers, services, and request validation",
        "Centralised error handling and HTTP status codes",
        "Authentication fundamentals and password hashing",
        "Authorisation, roles, and protected routes",
        "CORS, rate limiting, and common API security practices"
      ),
      mod(
        "Module 6: Database Design and Integration",
        "Relational database concepts and data modelling",
        "SQL tables, data types, constraints, and relationships",
        "SELECT, INSERT, UPDATE, DELETE, and filtering",
        "Joins, aggregate functions, grouping, and subqueries",
        "Primary keys, foreign keys, and normalisation basics",
        "Connecting Node.js APIs to MySQL or PostgreSQL",
        "MongoDB documents, collections, and CRUD operations",
        "Schema validation, indexing, and database error handling"
      ),
      mod(
        "Module 7: Testing, Security, and Quality",
        "Unit testing and integration testing fundamentals",
        "Testing REST APIs with Postman",
        "Frontend and backend debugging techniques",
        "Input validation and safe error responses",
        "Secure handling of credentials and environment secrets",
        "Common web vulnerabilities and defensive practices",
        "Code organisation, naming, documentation, and maintainability"
      ),
      mod(
        "Module 8: Deployment and Full-Stack Capstone",
        "Production builds and environment configuration",
        "Frontend and backend hosting concepts",
        "Database deployment and connection configuration",
        "Git-based deployment workflows",
        "Domain, HTTPS, and deployment configuration basics",
        "Logs, monitoring, and troubleshooting deployment issues",
        "End-to-end testing and final project documentation",
        "Portfolio presentation and project walkthrough"
      ),
    ],

    outcomes: [
      "Build accessible, responsive web pages using HTML, CSS, JavaScript, and Bootstrap.",
      "Develop reusable React components and manage application state.",
      "Implement navigation, forms, validation, and API integration in React.",
      "Design REST APIs using Node.js and Express.",
      "Implement authentication and role-based access fundamentals.",
      "Design relational databases and write SQL queries involving joins and aggregation.",
      "Integrate frontend, backend, and database layers into one application.",
      "Test, debug, document, and deploy a full-stack project.",
      "Use Git and GitHub to maintain a professional development workflow.",
      "Present a complete web application as part of a development portfolio.",
    ],

    projects: [
      "Responsive personal portfolio with project pages.",
      "Task management application with authentication and database storage.",
      "REST API with validation, error handling, and documentation.",
      "Capstone: full-stack application with React, Node.js, and a database.",
    ],

    faqs: [
      {
        q: "Which technologies are covered?",
        a: "The proposed core stack includes HTML, CSS, JavaScript, React, Node.js, Express, SQL, Git, and deployment fundamentals.",
      },
      {
        q: "Can beginners join this course?",
        a: "Yes. The beginner pathway starts with web fundamentals before progressing to frontend and backend development.",
      },
      {
        q: "Will I learn backend development?",
        a: "Yes. The curriculum covers REST APIs, server-side logic, authentication fundamentals, database integration, and deployment.",
      },
    ],
  },

  "data-science": {
    eligibility:
      "Suitable for students, graduates, analysts, and beginners interested in data analysis and evidence-based decision-making.",
    prerequisites: [
      "No previous data science experience is required.",
      "Basic mathematics and spreadsheet familiarity are helpful.",
      "Basic programming experience is useful but can be learned during the course.",
    ],

    curriculum: [
      mod(
        "Module 1: Python for Data Science",
        "Python syntax, variables, collections, and functions",
        "Working with files and structured datasets",
        "NumPy arrays and numerical operations",
        "Pandas Series and DataFrames",
        "Reading CSV, Excel, and JSON data",
        "Filtering, grouping, merging, and reshaping datasets",
        "Handling missing values, duplicates, and inconsistent data"
      ),
      mod(
        "Module 2: Statistics and Probability",
        "Data types, samples, and populations",
        "Mean, median, mode, variance, and standard deviation",
        "Probability distributions and sampling",
        "Conditional probability and Bayes' theorem",
        "Correlation and covariance",
        "Confidence intervals and hypothesis testing",
        "Statistical significance and interpretation",
        "Choosing suitable statistical methods for business questions"
      ),
      mod(
        "Module 3: Exploratory Data Analysis",
        "Understanding dataset structure and data quality",
        "Univariate, bivariate, and multivariate analysis",
        "Outlier detection and distribution analysis",
        "Feature relationships and correlation analysis",
        "Matplotlib and Seaborn visualisation fundamentals",
        "Selecting appropriate charts for different data types",
        "Documenting observations and analytical assumptions"
      ),
      mod(
        "Module 4: SQL and Data Acquisition",
        "Relational databases and table relationships",
        "SELECT, WHERE, ORDER BY, and filtering",
        "Aggregations, GROUP BY, and HAVING",
        "Inner, left, and other common joins",
        "Subqueries and common table expressions",
        "Data extraction from databases",
        "Working with public datasets and API-based data sources",
        "Data integrity and reproducible data preparation"
      ),
      mod(
        "Module 5: Data Visualisation and Business Reporting",
        "Principles of effective data visualisation",
        "Bar charts, line charts, histograms, and scatter plots",
        "KPI selection and business metrics",
        "Dashboard layout and visual hierarchy",
        "Interactive reporting concepts",
        "Introduction to Power BI or an equivalent dashboard tool",
        "Building reports for different stakeholder needs",
        "Communicating insights through data storytelling"
      ),
      mod(
        "Module 6: Machine Learning for Data Science",
        "Machine learning problem formulation",
        "Training, validation, and test datasets",
        "Linear and logistic regression",
        "Decision trees and random forests",
        "Classification and regression metrics",
        "Clustering with K-means",
        "Feature scaling, encoding, and selection",
        "Cross-validation, overfitting, and model comparison"
      ),
      mod(
        "Module 7: Practical Analysis and Reproducibility",
        "Creating reusable analysis notebooks",
        "Organising datasets, scripts, and project files",
        "Reproducible preprocessing and analysis workflows",
        "Data quality checks and validation",
        "Interpreting model results and analytical limitations",
        "Version control with Git",
        "Writing technical reports and presenting findings"
      ),
      mod(
        "Module 8: Data Science Capstone",
        "Defining a business question and success criteria",
        "Finding and evaluating a suitable dataset",
        "Data cleaning, exploratory analysis, and feature engineering",
        "Statistical analysis and visualisation",
        "Building a dashboard or predictive model",
        "Preparing an insight report and recommendations",
        "Project documentation and presentation"
      ),
    ],

    outcomes: [
      "Load, clean, transform, and analyse structured datasets using Python.",
      "Use Pandas and NumPy for efficient data manipulation.",
      "Apply descriptive statistics and introductory inferential statistics.",
      "Write SQL queries using filtering, joins, aggregation, and subqueries.",
      "Perform exploratory data analysis and identify meaningful patterns.",
      "Create clear visualisations, dashboards, and analytical reports.",
      "Build and evaluate introductory regression, classification, and clustering models.",
      "Translate business questions into measurable analytical tasks.",
      "Communicate data-driven findings, assumptions, and limitations.",
      "Complete a documented data science project from raw data to actionable insights.",
    ],

    projects: [
      "Exploratory analysis of sales, customer, or public health data.",
      "Interactive business KPI dashboard.",
      "Customer segmentation using clustering.",
      "Capstone: predictive analysis and recommendations for a business problem.",
    ],

    faqs: [
      {
        q: "Do I need advanced mathematics?",
        a: "Advanced mathematics is not required to begin. The course introduces relevant statistical concepts progressively and applies them to practical datasets.",
      },
      {
        q: "Will I learn SQL as well as Python?",
        a: "Yes. The proposed curriculum covers Python-based analysis, SQL querying, data visualisation, and introductory machine learning.",
      },
    ],
  },

  "cloud-computing": {
    eligibility:
      "Suitable for students, graduates, developers, and IT professionals interested in cloud infrastructure and application deployment.",
    prerequisites: [
      "Basic computer and IT knowledge is recommended.",
      "Command-line familiarity is helpful but not mandatory.",
      "Basic understanding of websites and networking is useful.",
    ],

    curriculum: [
      mod(
        "Module 1: Cloud Computing Fundamentals",
        "Cloud computing concepts and architecture",
        "Public, private, hybrid, and multi-cloud models",
        "IaaS, PaaS, and SaaS service models",
        "Compute, storage, networking, and managed services",
        "Regions, availability zones, and high availability",
        "Scalability, elasticity, and fault tolerance",
        "Shared responsibility and cloud security basics",
        "Cloud pricing, budgets, and cost optimisation concepts"
      ),
      mod(
        "Module 2: Linux and Networking Essentials",
        "Linux filesystem and directory navigation",
        "Users, groups, permissions, and processes",
        "File management and shell commands",
        "Basic shell scripting and task automation",
        "IP addresses, DNS, ports, and protocols",
        "HTTP, HTTPS, TCP, and network routing basics",
        "SSH access and secure remote administration",
        "Troubleshooting connectivity and service issues"
      ),
      mod(
        "Module 3: Cloud Compute and Storage",
        "Virtual machines and compute instances",
        "Images, instance types, and resource sizing",
        "Object, block, and file storage concepts",
        "Storage permissions and lifecycle policies",
        "Virtual networking and subnet fundamentals",
        "Security groups, firewalls, and access rules",
        "Load balancing and autoscaling concepts",
        "Backup, recovery, and storage durability"
      ),
      mod(
        "Module 4: Cloud Identity and Security",
        "Identity and access management fundamentals",
        "Users, groups, roles, and permissions",
        "Principle of least privilege",
        "Secrets and credential management",
        "Network segmentation and secure configurations",
        "Encryption at rest and in transit",
        "Logging, auditing, and security monitoring",
        "Cloud resource misconfiguration awareness"
      ),
      mod(
        "Module 5: Docker and Containerisation",
        "Containers, images, and container runtimes",
        "Writing and understanding Dockerfiles",
        "Building, tagging, and running Docker images",
        "Ports, volumes, and environment variables",
        "Docker networks and service communication",
        "Multi-container development with Docker Compose",
        "Image registries and image versioning",
        "Container security and resource management"
      ),
      mod(
        "Module 6: CI/CD and Infrastructure Automation",
        "Git workflows and branching strategies",
        "Continuous integration and continuous delivery concepts",
        "Build, test, and deployment pipeline stages",
        "Automated deployment using a CI/CD platform",
        "Infrastructure as Code fundamentals",
        "Introduction to Terraform concepts",
        "Configuration management and repeatable environments",
        "Pipeline secrets and deployment permissions"
      ),
      mod(
        "Module 7: Deployment, Monitoring, and Reliability",
        "Deploying a web application to a cloud environment",
        "Domain and HTTPS configuration concepts",
        "Application and infrastructure monitoring",
        "Centralised logs and troubleshooting",
        "Health checks and service availability",
        "Backup and disaster recovery fundamentals",
        "Scaling, performance, and resource utilisation",
        "Cost monitoring and operational best practices"
      ),
      mod(
        "Module 8: Cloud Deployment Capstone",
        "Planning a secure and scalable deployment",
        "Provisioning compute, networking, and storage",
        "Containerising an application with Docker",
        "Automating build and deployment workflows",
        "Configuring access, secrets, and environment variables",
        "Setting up logging, health checks, and monitoring",
        "Testing deployment reliability and recovery",
        "Documentation and deployment walkthrough"
      ),
    ],

    outcomes: [
      "Explain cloud service models, deployment models, and core infrastructure.",
      "Use Linux command-line tools for common administration tasks.",
      "Understand virtual machines, networking, storage, and identity management.",
      "Package applications using Docker and manage container configurations.",
      "Create basic automated build and deployment pipelines.",
      "Understand Infrastructure as Code and repeatable provisioning workflows.",
      "Deploy an application and troubleshoot common environment issues.",
      "Apply security, monitoring, backup, and cost-awareness fundamentals.",
      "Document a cloud deployment and explain its architecture.",
    ],

    projects: [
      "Deploy a static website with domain and HTTPS configuration.",
      "Containerise a Node.js or Python application using Docker.",
      "Create a CI/CD pipeline for a sample application.",
      "Capstone: containerised cloud application with deployment automation and monitoring.",
    ],

    faqs: [
      {
        q: "Do I need cloud experience before joining?",
        a: "No. The course begins with cloud fundamentals and progresses to Linux, containers, deployment, and automation.",
      },
      {
        q: "Will I learn AWS or Azure?",
        a: "The core concepts apply across cloud platforms. The specific provider and hands-on services should be confirmed with INVYN TECH before enrolment.",
      },
    ],
  },

  cybersecurity: {
    eligibility:
      "Suitable for students, graduates, and IT beginners interested in security, networking, and defensive technology.",
    prerequisites: [
      "Basic computer skills are required.",
      "Networking knowledge is helpful but can be introduced during training.",
      "A willingness to follow responsible security and lab safety practices is essential.",
    ],

    curriculum: [
      mod(
        "Module 1: Cybersecurity Fundamentals",
        "Cybersecurity principles and common terminology",
        "Confidentiality, integrity, and availability",
        "Threats, vulnerabilities, exploits, and risk",
        "Malware, phishing, social engineering, and account compromise",
        "Security controls and risk reduction",
        "Authentication, authorisation, and least privilege",
        "Security awareness and incident reporting",
        "Legal, ethical, and responsible testing boundaries"
      ),
      mod(
        "Module 2: Networking for Security",
        "OSI and TCP/IP models",
        "IP addressing, subnets, and routing concepts",
        "DNS, DHCP, HTTP, HTTPS, and common ports",
        "Switches, routers, firewalls, and network segmentation",
        "Packet structure and traffic inspection concepts",
        "Using approved tools to examine lab traffic",
        "Understanding network logs and connection failures",
        "Documenting basic network findings"
      ),
      mod(
        "Module 3: Linux, Windows, and Security Tools",
        "Linux command line and filesystem permissions",
        "Users, groups, services, and process management",
        "Windows security concepts and system administration basics",
        "System logs and event investigation",
        "Introduction to network discovery in an authorised lab",
        "Vulnerability scanner fundamentals",
        "Tool configuration, output interpretation, and limitations",
        "Evidence collection and reproducible lab notes"
      ),
      mod(
        "Module 4: Vulnerability Assessment and Ethical Testing",
        "Scope definition and written authorisation",
        "Reconnaissance using approved lab targets",
        "Asset discovery and service identification",
        "Vulnerability scanning and false-positive analysis",
        "Risk severity and prioritisation",
        "Safe validation of findings in a controlled environment",
        "Remediation recommendations and retesting",
        "Responsible disclosure and evidence handling"
      ),
      mod(
        "Module 5: Web Application Security",
        "HTTP requests, responses, sessions, and cookies",
        "Authentication and access-control weaknesses",
        "Input validation and output encoding",
        "SQL injection concepts and defensive parameterisation",
        "Cross-site scripting and contextual output encoding",
        "Cross-site request forgery and protective controls",
        "Security headers, HTTPS, and secure configuration",
        "Testing deliberately vulnerable applications in a lab"
      ),
      mod(
        "Module 6: Defensive Security and Monitoring",
        "Security operations and incident response fundamentals",
        "Log collection, analysis, and event correlation",
        "Indicators of compromise and suspicious activity",
        "Endpoint protection and system hardening concepts",
        "Firewall rules and network defence",
        "Alert triage and incident severity",
        "Containment, investigation, recovery, and lessons learned",
        "Introduction to SIEM and security monitoring workflows"
      ),
      mod(
        "Module 7: Risk, Governance, and Security Practices",
        "Security policies and asset management",
        "Risk assessment and risk treatment",
        "Data protection and access-control reviews",
        "Backup, recovery, and business continuity concepts",
        "Patch management and vulnerability remediation",
        "Security documentation and audit evidence",
        "Privacy and responsible handling of information",
        "Security awareness and continuous improvement"
      ),
      mod(
        "Module 8: Controlled Security Assessment Capstone",
        "Define scope and rules of engagement for a lab assessment",
        "Map assets and document the authorised environment",
        "Perform controlled discovery and vulnerability checks",
        "Validate selected findings safely",
        "Rank findings by impact and likelihood",
        "Recommend and document remediation steps",
        "Prepare a professional assessment report",
        "Present findings and retesting recommendations"
      ),
    ],

    outcomes: [
      "Explain core cybersecurity concepts, threats, vulnerabilities, and risk.",
      "Understand networking protocols and common security controls.",
      "Use basic Linux and security tools within authorised lab environments.",
      "Conduct scoped vulnerability assessments in controlled environments.",
      "Recognise common web application weaknesses and appropriate mitigations.",
      "Interpret basic system and network logs to investigate suspicious activity.",
      "Recommend secure configurations, patching, and access-control improvements.",
      "Document findings with evidence, severity, and remediation guidance.",
      "Follow ethical, legal, and responsible security testing practices.",
    ],

    projects: [
      "Network inventory and security review in an authorised lab.",
      "Vulnerability assessment of a deliberately vulnerable test application.",
      "Security log investigation and incident report.",
      "Capstone: controlled security assessment with prioritised remediation recommendations.",
    ],

    faqs: [
      {
        q: "Is the training legal and ethical?",
        a: "All practical testing must be limited to systems you own or have explicit permission to assess, using controlled lab environments and defined testing scopes.",
      },
      {
        q: "Do I need previous cybersecurity experience?",
        a: "No. The proposed curriculum starts with security and networking fundamentals before introducing assessment and defensive workflows.",
      },
    ],
  },

  "python-programming": {
    eligibility:
      "Designed for beginners, students, graduates, and professionals who want to learn programming and automation with Python.",
    prerequisites: [
      "No previous programming experience is required.",
      "Basic computer skills and logical thinking are helpful.",
      "A laptop or desktop with Python installed or internet access is recommended.",
    ],

    curriculum: [
      mod(
        "Module 1: Python Setup and Fundamentals",
        "Installing Python and configuring an IDE",
        "Running scripts and using the interactive interpreter",
        "Variables, naming conventions, and data types",
        "Numbers, strings, booleans, and type conversion",
        "Arithmetic, comparison, and logical operators",
        "Input, output, and formatted strings",
        "Conditional statements and nested conditions",
        "For loops, while loops, and iteration patterns"
      ),
      mod(
        "Module 2: Data Structures and Problem Solving",
        "Lists, indexing, slicing, and list methods",
        "Tuples, sets, and dictionaries",
        "String manipulation and common string methods",
        "List and dictionary comprehensions",
        "Nested collections and structured data",
        "Functions, parameters, return values, and scope",
        "Lambda functions and introductory functional patterns",
        "Algorithmic thinking and debugging exercises"
      ),
      mod(
        "Module 3: Functions, Modules, and OOP",
        "Reusable functions and argument handling",
        "Default, keyword, and variable-length arguments",
        "Modules, imports, and package organisation",
        "Classes, objects, attributes, and methods",
        "Constructors and instance state",
        "Inheritance, polymorphism, and encapsulation",
        "Composition and object-oriented design basics",
        "Creating a maintainable multi-file application"
      ),
      mod(
        "Module 4: Files, Errors, and Data Formats",
        "Reading and writing text files",
        "File paths and context managers",
        "Exception handling with try, except, and finally",
        "Creating useful error messages",
        "Working with CSV and JSON files",
        "Parsing and validating structured data",
        "Logging and debugging common program errors",
        "Writing reliable scripts for everyday tasks"
      ),
      mod(
        "Module 5: Libraries and Data Processing",
        "Installing and managing packages with pip",
        "Virtual environments and dependency management",
        "Working with dates, times, and file operations",
        "Regular expressions for text matching",
        "HTTP requests and JSON responses",
        "Introduction to NumPy and Pandas",
        "Filtering and transforming tabular data",
        "Generating reports from structured information"
      ),
      mod(
        "Module 6: APIs, Databases, and Automation",
        "HTTP methods, status codes, and API endpoints",
        "Calling REST APIs and processing responses",
        "API keys and secure configuration practices",
        "Connecting Python to a relational database",
        "Basic SQL operations from Python",
        "Automating file organisation and repetitive tasks",
        "Scheduling and running scripts responsibly",
        "Retry logic, logging, and error recovery"
      ),
      mod(
        "Module 7: Testing and Professional Workflow",
        "Writing unit tests with unittest or pytest",
        "Assertions and test case design",
        "Debugging with breakpoints and stack traces",
        "Code formatting, naming, and readability",
        "Git repositories, commits, and branches",
        "README files and project documentation",
        "Requirements files and reproducible environments",
        "Basic performance and maintainability practices"
      ),
      mod(
        "Module 8: Python Application Capstone",
        "Identifying a practical problem to automate",
        "Planning program inputs, outputs, and behaviour",
        "Organising functions, modules, and data storage",
        "Integrating files, APIs, or a database",
        "Adding validation, error handling, and logging",
        "Testing normal and unexpected inputs",
        "Documenting setup and usage instructions",
        "Demonstrating the completed application"
      ),
    ],

    outcomes: [
      "Write Python programs using variables, conditions, loops, and functions.",
      "Work confidently with lists, dictionaries, sets, tuples, and strings.",
      "Use object-oriented programming to organise reusable code.",
      "Read, write, and process text, CSV, and JSON files.",
      "Handle exceptions and debug common programming errors.",
      "Install packages and manage isolated Python environments.",
      "Consume REST APIs and perform basic database operations.",
      "Automate repetitive tasks and process structured data.",
      "Write basic tests and maintain projects using Git.",
      "Develop and document a practical Python application from start to finish.",
    ],

    projects: [
      "Command-line expense tracker with file storage.",
      "API-based weather or information retrieval application.",
      "File organisation and reporting automation script.",
      "Capstone: Python application combining data processing, validation, and persistent storage.",
    ],

    faqs: [
      {
        q: "Can I learn Python without coding experience?",
        a: "Yes. The proposed course begins with basic syntax and gradually introduces data structures, functions, object-oriented programming, and practical projects.",
      },
      {
        q: "Is Python useful for AI?",
        a: "Python is widely used in data analysis, machine learning, automation, and AI development. This course builds programming foundations that can support further AI learning.",
      },
    ],
  },

  "java-development": {
    eligibility:
      "Suitable for beginners, students, graduates, and aspiring backend or enterprise application developers.",
    prerequisites: [
      "Basic computer skills are required.",
      "No prior Java experience is necessary for the beginner track.",
      "Logical thinking and basic mathematics are helpful.",
    ],

    curriculum: [
      mod(
        "Module 1: Java Foundations",
        "JDK, JRE, JVM, and Java program execution",
        "IDE setup, compilation, and running Java applications",
        "Variables, primitive types, and type conversion",
        "Operators, expressions, and console input/output",
        "Conditional statements and loops",
        "Methods, parameters, and return values",
        "Arrays, strings, and common string operations",
        "Debugging and foundational coding exercises"
      ),
      mod(
        "Module 2: Object-Oriented Programming",
        "Classes, objects, fields, and methods",
        "Constructors and constructor overloading",
        "Encapsulation and access modifiers",
        "Inheritance and method overriding",
        "Polymorphism and dynamic method dispatch",
        "Abstract classes and interfaces",
        "Composition and object relationships",
        "Designing reusable object-oriented applications"
      ),
      mod(
        "Module 3: Collections, Generics, and Exceptions",
        "Java Collections Framework overview",
        "Lists, sets, maps, and queues",
        "Iterators and collection traversal",
        "Generics and type safety",
        "Exception types and exception propagation",
        "try, catch, finally, and try-with-resources",
        "Custom exceptions and validation",
        "Choosing suitable data structures"
      ),
      mod(
        "Module 4: Modern Java and File Handling",
        "Packages, imports, and access control",
        "Reading and writing files",
        "Streams and buffered input/output",
        "Lambda expressions and functional interfaces",
        "Stream API, filtering, mapping, and collecting",
        "Optional and null-handling concepts",
        "Date and time API fundamentals",
        "Writing clear and maintainable Java code"
      ),
      mod(
        "Module 5: SQL and JDBC",
        "Relational database concepts and schema design",
        "SQL queries, filtering, and joins",
        "Primary keys, foreign keys, and constraints",
        "JDBC architecture and database connections",
        "Prepared statements and parameterised queries",
        "CRUD operations from Java applications",
        "Transactions and resource management",
        "Database error handling and secure query practices"
      ),
      mod(
        "Module 6: Testing and Application Design",
        "Unit testing fundamentals",
        "Introduction to JUnit",
        "Assertions, test cases, and test organisation",
        "Debugging and exception analysis",
        "Separation of concerns and layered architecture",
        "Repository, service, and controller responsibilities",
        "Clean code and basic design principles",
        "Git and collaborative development workflows"
      ),
      mod(
        "Module 7: Spring and REST API Development",
        "Spring Framework and Spring Boot introduction",
        "Project setup and dependency management",
        "Dependency injection and inversion of control",
        "Controllers, services, and repository layers",
        "REST endpoints and HTTP status codes",
        "Request validation and exception handling",
        "Database integration using Spring Data JPA",
        "Basic authentication and authorisation concepts",
        "Testing and documenting REST APIs"
      ),
      mod(
        "Module 8: Java Application Capstone",
        "Defining application requirements and data models",
        "Designing classes and service responsibilities",
        "Implementing business logic and validation",
        "Connecting the application to a relational database",
        "Building REST endpoints with Spring Boot",
        "Writing tests and resolving application errors",
        "Documenting endpoints and configuration",
        "Preparing a final project demonstration"
      ),
    ],

    outcomes: [
      "Write Java programs using control flow, methods, arrays, and strings.",
      "Apply object-oriented programming principles to application design.",
      "Use collections, generics, exceptions, and file-handling APIs.",
      "Write SQL queries and connect Java applications to databases using JDBC.",
      "Apply basic unit testing and debugging techniques.",
      "Organise code into maintainable layers and reusable components.",
      "Build introductory REST APIs with Spring Boot.",
      "Integrate Java applications with relational databases.",
      "Use Git to track and manage application development.",
      "Deliver a documented Java application or backend service.",
    ],

    projects: [
      "Console-based student or inventory management system.",
      "Java application with database connectivity and CRUD operations.",
      "REST API using Spring Boot and a relational database.",
      "Capstone: database-backed management application with validation and tests.",
    ],

    faqs: [
      {
        q: "Can beginners learn Java?",
        a: "Yes. The beginner pathway introduces Java syntax and programming concepts before progressing to object-oriented programming and application development.",
      },
      {
        q: "Does the curriculum include Spring Boot?",
        a: "The proposed advanced modules introduce Spring Boot, REST APIs, database integration, and application testing.",
      },
    ],
  },

  "software-development": {
    eligibility:
      "Suitable for students, graduates, and early-career developers interested in professional software engineering practices.",
    prerequisites: [
      "Basic computer skills are required.",
      "Familiarity with at least one programming language is helpful.",
      "Beginners can start with foundational programming exercises.",
    ],

    curriculum: [
      mod(
        "Module 1: Software Engineering Foundations",
        "Software development lifecycle and common methodologies",
        "Requirements gathering and stakeholder communication",
        "Functional and non-functional requirements",
        "User stories, acceptance criteria, and use cases",
        "Planning, estimation, and task breakdown",
        "Agile, Scrum, and iterative development",
        "Technical documentation and requirement traceability",
        "Defining project scope and success criteria"
      ),
      mod(
        "Module 2: Programming Principles and Problem Solving",
        "Programming fundamentals and code organisation",
        "Variables, control flow, functions, and data structures",
        "Algorithms and introductory complexity analysis",
        "Decomposition and step-by-step problem solving",
        "Object-oriented programming principles",
        "Abstraction, encapsulation, and modularity",
        "Readable naming, small functions, and clean code",
        "Refactoring and reducing code duplication"
      ),
      mod(
        "Module 3: Data Structures and Algorithms",
        "Arrays, linked lists, stacks, and queues",
        "Hash maps, sets, and lookup operations",
        "Searching and sorting fundamentals",
        "Recursion and iterative solutions",
        "Trees and graph concepts",
        "Time and space complexity basics",
        "Selecting data structures for a problem",
        "Practical coding exercises and solution analysis"
      ),
      mod(
        "Module 4: Version Control and Team Collaboration",
        "Git configuration and repository management",
        "Commits, branches, merges, and rebasing concepts",
        "Resolving merge conflicts",
        "GitHub pull requests and code reviews",
        "Branching strategies and commit conventions",
        "Issue tracking and task management",
        "Collaborative workflows and technical communication",
        "Maintaining clear project history and documentation"
      ),
      mod(
        "Module 5: Software Design and Architecture",
        "Separation of concerns and modular design",
        "Common architectural layers and component boundaries",
        "SOLID principles and their practical purpose",
        "Introduction to common design patterns",
        "Dependency management and interface-based design",
        "API contracts and component integration",
        "Error handling and application configuration",
        "Maintainability, extensibility, and trade-offs"
      ),
      mod(
        "Module 6: Testing and Quality Assurance",
        "Testing levels: unit, integration, and end-to-end",
        "Test cases, expected results, and edge cases",
        "Unit testing frameworks and assertions",
        "Mocks, stubs, and dependency isolation",
        "Debugging with logs and development tools",
        "Regression testing and defect tracking",
        "Code review and static analysis fundamentals",
        "Quality criteria and acceptance testing"
      ),
      mod(
        "Module 7: APIs, Databases, and Delivery",
        "HTTP and REST API fundamentals",
        "Request validation and consistent error responses",
        "Database schema design and SQL operations",
        "Authentication and access-control fundamentals",
        "Environment configuration and secret management",
        "Build and deployment workflow concepts",
        "CI/CD fundamentals and automated checks",
        "Logging, monitoring, and production troubleshooting"
      ),
      mod(
        "Module 8: Team Software Project",
        "Converting requirements into an implementation plan",
        "Creating issues, milestones, and development tasks",
        "Designing the application structure and data model",
        "Implementing features in small, reviewable increments",
        "Collaborating with Git branches and pull requests",
        "Writing automated tests and fixing defects",
        "Preparing documentation and deployment instructions",
        "Conducting a final review and project demonstration"
      ),
    ],

    outcomes: [
      "Understand the software development lifecycle and requirements process.",
      "Break complex requirements into manageable development tasks.",
      "Apply programming fundamentals, data structures, and algorithms.",
      "Write readable, modular, maintainable, and testable code.",
      "Use Git and GitHub for collaboration, reviews, and version control.",
      "Apply software design principles and understand common architectural patterns.",
      "Write unit and integration tests and debug application defects.",
      "Understand API integration, database design, and deployment workflows.",
      "Participate in structured team development and code review processes.",
      "Deliver a documented software project using a professional development workflow.",
    ],

    projects: [
      "Version-controlled application with documented requirements.",
      "Existing-codebase improvement with automated tests.",
      "REST API with validation, database integration, and error handling.",
      "Capstone: team-developed application with code reviews, testing, and deployment documentation.",
    ],

    faqs: [
      {
        q: "Is this course only about coding?",
        a: "No. The proposed curriculum also covers requirements, software design, testing, version control, collaboration, and delivery practices.",
      },
      {
        q: "Will I work on a team project?",
        a: "The curriculum includes a capstone designed around task planning, version control, testing, documentation, and a final project demonstration.",
      },
    ],
  },
};