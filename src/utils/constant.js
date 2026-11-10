export const BRAND = {
  name: "INVYN TECH",
  colors: {
    primary: "#031F94",
    secondary: "#0333B7",
    accent: "#0B9AF0",
    navy: "#122B44",
    gray: "#56575C",
    white: "#FFFFFF",
  },
  gradient: "linear-gradient(90deg, #031F94, #0333B7, #0B9AF0)",
};

export const ROUTES = {
  home: "/",
  about: "/?section=about",
  services: "/services",
  servicesSection: "/?section=services",
  courses: "/courses",
  coursesSection: "/?section=courses",
  internships: "/?section=internship",
  technology: "/?section=technology",
  why: "/?section=why",
  testimonials: "/?section=testimonials",
  contact: "/?section=cta",
  careers: "/careers",
   login: "/login",
  register: "/register",
  account: "/account",
  studentDashboard: "/student",
    studentProfile: "/student/profile",
    studentCourses: "/student/courses",
    staffAttendance: "/staff/attendance",
  staffAttendanceMark: "/staff/attendance/mark",
  studentAttendance: "/student/attendance",
  staffMaterials: "/staff/materials",
  changePassword: "/change-password",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  setupAccount: "/setup-account",
  adminEmployees: "/admin/employees",
  adminEnquiries: "/admin/enquiries",
  adminDashboard: "/admin",
  studentFees: "/student/fees",
   studentNotifications: "/student/notifications",
  staffAnnouncements: "/staff/announcements",
  staffFees: "/staff/fees",
  staffFeeStructures: "/staff/fees/structures",
  staffFeeDetail: (id) => `/staff/fees/${id}`,
};

export const getCourseRoute = (slug) => `/courses/${slug}`;
export const getStudentCourseRoute = (courseId) => `/student/courses/${courseId}`;
export const getServiceRoute = (slug) => `/services/${slug}`;