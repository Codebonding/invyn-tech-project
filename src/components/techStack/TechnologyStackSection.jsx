import { lazy, useMemo, useRef, useState } from "react";
import Container from "../common/Container";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../animation/ScrollReveal";
import SceneHost from "../animation/3d/SceneHost";
import { StaticConstellation } from "../animation/3d/fallbacks";
import { technologies } from "../../data/technologies";
import { homeContent } from "../../utils/content";
import { staggerDelay } from "../../utils/animation";

const c = homeContent.technology;
const TechnologyConstellation = lazy(() => import("../animation/3d/TechnologyConstellation"));

export default function TechnologyStackSection() {
  const sectionRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(technologies.map((t) => t.category))], []);
  const focus = category === "All" ? null : category;

  return (
    <section ref={sectionRef} id="technology" className="inv-section inv-home3d" aria-labelledby="tech-title">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="tech-title"
            eyebrow={c.eyebrow}
            title={<>{c.title[0]}<GradientText>{c.title[1]}</GradientText>{c.title[2]}</>}
            description={c.description}
          />
        </ScrollReveal>

        <div className="inv-filter" role="group" aria-label={c.filterLabel}>
          {categories.map((cat) => (
            <button key={cat} type="button" className="inv-filter__btn" aria-pressed={cat === category} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="inv-stage3d inv-stage3d--tech">
          {c.image && <img className="inv-stage3d__bg" src={c.image} alt={c.imageAlt} loading="lazy" decoding="async" />}
          <SceneHost
            scene={TechnologyConstellation}
            sceneProps={{ techs: technologies, activeId, category: focus, onHover: setActiveId }}
            fallback={<StaticConstellation techs={technologies} activeId={activeId} />}
            eventSourceRef={sectionRef}
            label="Technology constellation"
          />
        </div>

        <ul className="inv-techgrid">
          {technologies.map((t, i) => {
            const dim = focus && t.category !== focus;
            return (
              <li key={t.id}>
                <ScrollReveal delay={staggerDelay(i % 6)} className="h-100">
                  <article
                    className={`inv-techcard ${activeId === t.id ? "is-active" : ""} ${dim ? "is-dim" : ""}`}
                    onMouseEnter={() => setActiveId(t.id)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <span className="inv-techcard__glyph" aria-hidden="true">
                      {t.image ? <img src={t.image} alt="" width="26" height="26" loading="lazy" decoding="async" /> : t.glyph}
                    </span>
                    <div>
                      <h3 className="inv-techcard__name">{t.name}</h3>
                      <p className="inv-techcard__cat">{t.category}</p>
                      <p className="inv-techcard__desc">{t.description}</p>
                    </div>
                  </article>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}