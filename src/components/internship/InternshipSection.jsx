import Container from "../common/Container";
import GlassCard from "../common/GlassCard";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import Button from "../common/Button";
import ScrollReveal from "../animation/ScrollReveal";
import InternshipCard from "./InternshipCard";
import InternshipJourney from "./InternshipJourney";
import { internshipBenefits, internshipIntro, internshipJourney } from "../../data/internship";
import { staggerDelay } from "../../utils/animation";
import { ROUTES } from "../../utils/constant";

export default function InternshipSection() {
  const { cta } = internshipIntro;
  return (
    <section className="inv-section" id="internship" aria-labelledby="internship-title">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="internship-title"
            eyebrow={internshipIntro.eyebrow}
            title={<>Turn Your Knowledge Into <GradientText>Real-World Experience</GradientText></>}
            description={internshipIntro.description}
          />
        </ScrollReveal>

        <div className="row g-4 mt-2">
          {internshipBenefits.map((b, i) => (
            <div className="col-12 col-sm-6 col-lg-3" key={b.id}>
              <ScrollReveal delay={staggerDelay(i)} className="h-100">
                <InternshipCard {...b} />
              </ScrollReveal>
            </div>
          ))}
        </div>

        <InternshipJourney steps={internshipJourney} />

        <ScrollReveal>
          <GlassCard className="inv-cta">
            <h3 className="inv-cta__title">{cta.title}</h3>
            <p className="inv-cta__text">{cta.description}</p>
            <div className="inv-cta__actions">
              <Button href={ROUTES.internships} variant="primary" arrow>Explore Internships</Button>
              <Button href={ROUTES.contact} variant="outline">Contact INVYN TECH</Button>
            </div>
          </GlassCard>
        </ScrollReveal>
      </Container>
    </section>
  );
}