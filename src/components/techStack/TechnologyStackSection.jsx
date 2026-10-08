import { lazy, useRef, useState } from "react";
import Container from "../common/Container";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../animation/ScrollReveal";
import SceneHost from "../animation/3d/SceneHost";
import { StaticConstellation } from "../animation/3d/fallbacks";
import { technologies, technologiesIntro } from "../../data/technologies";
import { staggerDelay } from "../../utils/animation";

const TechnologyConstellation = lazy(() => import("../animation/3d/TechnologyConstellation"));

export default function TechnologyStackSection() {
  const sectionRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  return (
    <section ref={sectionRef} id="technology" className="inv-section inv-home3d" aria-labelledby="tech-title">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="tech-title"
            eyebrow={technologiesIntro.eyebrow}
            title={<>Technologies We <GradientText>Build With</GradientText></>}
            description={technologiesIntro.description}
          />
        </ScrollReveal>

        <div className="inv-stage3d inv-stage3d--tech">
          <SceneHost
            scene={TechnologyConstellation}
            sceneProps={{ techs: technologies, activeId, onHover: setActiveId }}
            fallback={<StaticConstellation techs={technologies} activeId={activeId} />}
            eventSourceRef={sectionRef}
            label="Technology constellation"
          />
        </div>

        <ul className="inv-techgrid">
          {technologies.map((t, i) => (
            <li key={t.id}>
              <ScrollReveal delay={staggerDelay(i % 6)} className="h-100">
                <article
                  className={`inv-techcard ${activeId === t.id ? "is-active" : ""}`}
                  onMouseEnter={() => setActiveId(t.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <span className="inv-techcard__glyph" aria-hidden="true">{t.glyph}</span>
                  <div>
                    <h3 className="inv-techcard__name">{t.name}</h3>
                    <p className="inv-techcard__cat">{t.category}</p>
                    <p className="inv-techcard__desc">{t.description}</p>
                  </div>
                </article>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}