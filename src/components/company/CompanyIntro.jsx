import Container from "../common/Container";
import GlassCard from "../common/GlassCard";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../animation/ScrollReveal";
import CompanyValueCard from "./CompanyValueCard";
import { companyIntro, companyValues } from "../../data/company";
import { staggerDelay } from "../../utils/animation";

export default function CompanyIntro() {
  const { eyebrow, paragraphs, highlight, flow, chips } = companyIntro;
  return (
    <section className="inv-section" id="about" aria-labelledby="about-title">
      <Container>
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-7">
            <ScrollReveal>
              <SectionHeading
                id="about-title"
                alignment="start"
                eyebrow={eyebrow}
                title={
                  <>
                    Build. Learn. <GradientText>Innovate. Grow</GradientText> with INVYN TECH
                  </>
                }
              />
              <div className="inv-prose">
                {paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
              </div>
              <p className="inv-highlight-lines">
                {highlight.map((line) => <span key={line}>{line}</span>)}
              </p>
            </ScrollReveal>
          </div>

          <div className="col-12 col-lg-5">
            <ScrollReveal delay={160} direction="left">
              <GlassCard className="inv-visual-panel" aria-label="Build, innovate, grow">
                <p className="inv-visual-panel__brand">INVYN TECH</p>
                <ol className="inv-flow">
                  {flow.map((step, i) => (
                    <li key={step}>
                      <span className="inv-flow__step">{step}</span>
                      {i < flow.length - 1 && <span className="inv-flow__arrow" aria-hidden="true">↓</span>}
                    </li>
                  ))}
                </ol>
                {chips.map((chip, i) => (
                  <span key={chip} className={`inv-chip inv-chip--${i + 1}`} aria-hidden="true">{chip}</span>
                ))}
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>

        <div className="row g-4 mt-4">
          {companyValues.map((v, i) => (
            <div className="col-12 col-sm-6 col-lg-3" key={v.id}>
              <ScrollReveal delay={staggerDelay(i)} className="h-100">
                <CompanyValueCard {...v} />
              </ScrollReveal>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}