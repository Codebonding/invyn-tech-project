import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Icon from "../components/common/Icon";
import { Section, List, Pills, Steps } from "../components/common/DetailBlocks";
import ServiceGrid from "../components/services-p/ServiceGrid";
import NotFoundPage from "./NotFoundPage";
import usePageSeo from "../hooks/usePageSeo";
import { setJsonLd } from "../utils/seo";
import { ROUTES, getServiceRoute } from "../utils/constant";
import { enquiryHref, getRelatedServices, getServiceBySlug, serviceJsonLd } from "../utils/services-page";
import "../styles/course-pages.css";
import "../styles/service-pages.css";

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  usePageSeo(
    service
      ? { title: `${service.title} | INVYN TECH Services`, description: service.summary, path: service.href }
      : { title: "Service not found | INVYN TECH", description: "This service could not be found.", path: getServiceRoute(slug) },
    [slug]
  );

  useEffect(() => {
    if (!service) return undefined;
    setJsonLd(serviceJsonLd(service, window.location.origin));
    return () => setJsonLd(null);
  }, [service]);

  if (!service) {
    return <NotFoundPage title="Service not found" message="We could not find the service you were looking for. It may have been moved or the link may be incorrect." backTo={ROUTES.services} backLabel="Browse all services" altTo={ROUTES.contact} altLabel="Contact INVYN TECH" />;
  }

  const related = getRelatedServices(service);
  const enquiry = enquiryHref(service.slug);

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Services", to: ROUTES.services }, { label: service.title }]} />

        <header className="inv-cd__hero">
          <p className="inv-eyebrow">{service.category.toUpperCase()}</p>
          <h1 className="inv-section-title">{service.title}</h1>
          <p className="inv-section-desc">{service.summary}</p>
          <div className="inv-cd__cta">
            <Link className="inv-btn inv-btn--primary" to={enquiry}>Send an Enquiry <Icon name="arrow" size={18} className="inv-btn__arrow" /></Link>
            <Link className="inv-btn inv-btn--outline" to={ROUTES.contact}>Talk to INVYN TECH</Link>
          </div>
        </header>

        <div className="row g-4 g-xl-5">
          <div className="col-12 col-lg-8">
            <Section id="sv-overview" title="Overview"><p>{service.overview}</p></Section>
            <Section id="sv-capabilities" title="Key capabilities"><List items={service.capabilities} /></Section>
            <Section id="sv-tech" title="Technologies we work with"><Pills items={service.technologies} label="Technologies" /></Section>
            <Section id="sv-benefits" title="Benefits"><List items={service.benefits} /></Section>
            <Section id="sv-process" title="Our development process"><Steps items={service.process} /></Section>
          </div>

          <aside className="col-12 col-lg-4" aria-label="Service summary and enquiry">
            <div className="inv-cd__aside">
              <h2 className="inv-cd__h2">Service details</h2>
              <dl className="inv-cd__facts">
                <div><dt>Category</dt><dd>{service.category}</dd></div>
                <div><dt>Core technologies</dt><dd>{service.technologies.slice(0, 3).join(", ")}</dd></div>
                <div><dt>Process</dt><dd>{service.process.length} stages</dd></div>
              </dl>
              <Link className="inv-btn inv-btn--primary inv-cd__block" to={enquiry}>Send an Enquiry</Link>
              <Link className="inv-cd__link" to={ROUTES.contact}>Have a question? Contact us</Link>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="inv-cd__related" aria-labelledby="sv-related">
            <h2 id="sv-related" className="inv-cd__h2">Related services</h2>
            <ServiceGrid items={related} />
          </section>
        )}
      </Container>
    </div>
  );
}