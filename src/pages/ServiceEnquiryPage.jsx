import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import ServiceEnquiryForm from "../components/services-p/ServiceEnquiryForm";
import NotFoundPage from "./NotFoundPage";
import { useParams } from "react-router-dom";
import usePageSeo from "../hooks/usePageSeo";
import { ROUTES, getServiceRoute } from "../utils/constant";
import { enquiryHref, getServiceBySlug } from "../utils/services-page";
import "../styles/course-pages.css";
import "../styles/service-pages.css";

export default function ServiceEnquiryPage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  usePageSeo(
    service
      ? { title: `Enquire about ${service.title} | INVYN TECH`, description: `Enquiry preview for ${service.title} at INVYN TECH.`, path: enquiryHref(service.slug) }
      : { title: "Service not found | INVYN TECH", description: "This service could not be found.", path: `${getServiceRoute(slug)}/enquiry` },
    [slug]
  );

  if (!service) {
    return <NotFoundPage title="Service not found" message="We could not find the service you were looking for." backTo={ROUTES.services} backLabel="Browse all services" altTo={ROUTES.contact} altLabel="Contact INVYN TECH" />;
  }

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Services", to: ROUTES.services }, { label: service.title, to: service.href }, { label: "Enquiry" }]} />
        <div className="inv-enroll">
          <header>
            <p className="inv-eyebrow">SERVICE ENQUIRY</p>
            <h1 className="inv-section-title">Enquire about {service.title}</h1>
          </header>
          <p className="inv-demo" role="note">
            <strong>Demo only.</strong> This form is a preview. Your details are not sent anywhere or saved.
          </p>
          <ServiceEnquiryForm key={service.slug} service={service} />
        </div>
      </Container>
    </div>
  );
}