import Container from "../components/common/Container";
import GradientText from "../components/common/GradientText";
import Breadcrumbs from "../components/common/Breadcrumbs";
import ServiceGrid from "../components/services-p/ServiceGrid";
import ServiceCta from "../components/services-p/ServiceCta";
import usePageSeo from "../hooks/usePageSeo";
import { ROUTES } from "../utils/constant";
import { allServices } from "../utils/services-page";
import { servicesPageIntro } from "../data/serviceDetails";


export default function ServicesPage() {
  usePageSeo({
    title: "IT Services | INVYN TECH",
    description: "Explore INVYN TECH services: web development, mobile apps, AI solutions, cloud, custom software, IT consulting and corporate training.",
    path: ROUTES.services,
  });
  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: "Services" }]} />
        <header className="inv-pagehead">
          <p className="inv-eyebrow">{servicesPageIntro.eyebrow}</p>
          <h1 className="inv-section-title">Technology Services Built for <GradientText>Business Growth</GradientText></h1>
          <p className="inv-section-desc">{servicesPageIntro.description}</p>
        </header>

        <ServiceGrid items={allServices} />

        <ServiceCta
          title="Not sure which service fits?"
          text="Tell us what you are trying to achieve and INVYN TECH will point you to the right starting point."
          primary={{ label: "Talk to INVYN TECH", to: ROUTES.contact }}
          secondary={{ label: "Explore courses", to: ROUTES.courses }}
        />
      </Container>
    </div>
  );
}