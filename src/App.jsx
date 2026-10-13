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
import NotFoundPage from "./pages/NotFoundPage";
import { useSectionScroll } from "./utils/scroll";

export default function App() {
  useSectionScroll();
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}