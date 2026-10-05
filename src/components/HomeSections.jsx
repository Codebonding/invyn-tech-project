import { useEffect } from "react";
import CompanyIntro from "./company/CompanyIntro";
import ServicesSection from "../components/services/ServiceSection";
import CoursesSection from "./courses/CoursesSection";
import InternshipSection from "./internship/InternshipSection";
import { applySeo, homeSeo } from "../utils/seo";

export default function HomeSections() {
  useEffect(() => { applySeo(homeSeo); }, []);
  return (
    <>
      <CompanyIntro />
      <ServicesSection />
      <CoursesSection />
      <InternshipSection />
    </>
  );
}