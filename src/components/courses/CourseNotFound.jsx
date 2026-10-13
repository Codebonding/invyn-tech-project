import { Link } from "react-router-dom";
import Container from "../common/Container";
import { ROUTES } from "../../utils/constant";
import usePageSeo from "../../hooks/usePageSeo";

export default function CourseNotFound() {
  usePageSeo({ title: "Course not found | INVYN TECH", description: "This course could not be found. Browse all INVYN TECH technology courses.", path: window.location.pathname });
  return (
    <div className="inv-page">
      <Container>
        <div className="inv-notfound" role="alert">
          <p className="inv-eyebrow">404</p>
          <h1 className="inv-section-title">Course not found</h1>
          <p className="inv-section-desc">We could not find the course you were looking for. It may have been moved or the link may be incorrect.</p>
          <Link className="inv-btn inv-btn--primary" to={ROUTES.courses}>Browse all courses</Link>
        </div>
      </Container>
    </div>
  );
}