import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Navbar";
import AnimatedBackground from "./components/animation/AnimatedBackground";
import Hero from "./components/Hero/Hero";
import HomeSections from "./components/HomeSections";
import Footer from "./components/Footer/Footer";
import CoursePage from "./pages/CoursePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseEnrollPage from "./pages/CourseEnrollPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ServiceEnquiryPage from "./pages/ServiceEnquiryPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollBar3D from "./components/animation/ScrollBar3D";
import useTilt3D from "./hooks/useTilt3D";
import { useSectionScroll } from "./utils/scroll";
import "./styles/effects-3d.css";

export default function App() {
  useSectionScroll();
  useTilt3D();
  return (
    <>
      <AnimatedBackground />
      <Header />
      <Routes>
        <Route path="/" element={<><Hero /><HomeSections /></>} />
        <Route path="/courses" element={<CoursePage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/courses/:slug/enroll" element={<CourseEnrollPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/services/:slug/enquiry" element={<ServiceEnquiryPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <ScrollBar3D />
    </>
  );
}