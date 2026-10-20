import Container from "../common/Container";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../animation/ScrollReveal";
import ServiceGrid from "./ServiceGrid";
import { services, servicesIntro } from "../../data/services";

export default function ServicesSection() {
  return (
    <section className="inv-section" id="services" aria-labelledby="services-title">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="services-title"
            eyebrow={servicesIntro.eyebrow}
            title={<>IT Services Built for the <GradientText>Digital Future</GradientText></>}
            description={servicesIntro.description}
          />
        </ScrollReveal>
        <ServiceGrid items={services} />
      </Container>
    </section>
  );
}