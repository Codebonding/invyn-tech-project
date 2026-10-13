import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { ROUTES } from "../utils/constant";

export default function NotFoundPage() {
  usePageSeo({
    title: "Page not found | INVYN TECH",
    description: "This page could not be found. Return to the INVYN TECH home page or browse our courses.",
    path: window.location.pathname,
  });
  return (
    <div className="inv-page">
      <Container>
        <div className="inv-notfound" role="alert">
          <p className="inv-eyebrow">404</p>
          <h1 className="inv-section-title">Page not found</h1>
          <p className="inv-section-desc">This page does not exist yet, or the link may be incorrect.</p>
          <Link className="inv-btn inv-btn--primary" to={ROUTES.home}>Back to home</Link>{" "}
          <Link className="inv-btn inv-btn--outline" to={ROUTES.courses}>Browse courses</Link>
        </div>
      </Container>
    </div>
  );
}