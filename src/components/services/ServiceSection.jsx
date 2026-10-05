import Container from "../common/Container";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../animation/ScrollReveal";
import ServiceCard from "./ServiceCard";
import { services, servicesIntro } from "../../data/services";
import { staggerDelay } from "../../utils/animation";

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
        <div className="row g-4 mt-2">
          {services.map((s, i) => (
            <div className="col-12 col-md-6 col-lg-4" key={s.id}>
              <ScrollReveal delay={staggerDelay(i)} className="h-100">
                <ServiceCard {...s} />
              </ScrollReveal>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}