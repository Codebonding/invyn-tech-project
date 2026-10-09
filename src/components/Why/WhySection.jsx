import { lazy, useRef, useState } from "react";
import Container from "../common/Container";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../animation/ScrollReveal";
import SceneHost from "../animation/3d/SceneHost";
import { StaticCore } from "../animation/3d/fallbacks";
import { LAYER_NAMES, whyCards, whyIntro } from "../../data/why";
import { staggerDelay } from "../../utils/animation";
const WhyCore3D = lazy(() => import("../animation/3d/WhyCore3D"));

function WhyCard({ card, index, activeLayer, setLayer, side }) {
  const on = activeLayer === card.layer;
  return (
    <ScrollReveal delay={staggerDelay(index)} direction={side === "l" ? "right" : "left"}>
      <article
        className={`inv-whycard inv-whycard--${side} ${on ? "is-active" : ""}`}
        onMouseEnter={() => setLayer(card.layer)}
        onMouseLeave={() => setLayer(-1)}
        onClick={() => setLayer(activeLayer === card.layer ? -1 : card.layer)}
      >
        <p className="inv-whycard__layer">{LAYER_NAMES[card.layer]}</p>
        <h3 className="inv-whycard__title">{card.title}</h3>
        <p className="inv-whycard__desc">{card.description}</p>
        <span className="inv-whycard__node" aria-hidden="true" />
      </article>
    </ScrollReveal>
  );
}

export default function WhySection() {
  const sectionRef = useRef(null);
  const [layer, setLayer] = useState(-1);
  const left = whyCards.slice(0, 3);
  const right = whyCards.slice(3);

  return (
    <section ref={sectionRef} id="why" className="inv-section inv-home3d" aria-labelledby="why-title">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="why-title"
            eyebrow={whyIntro.eyebrow}
            title={<>Where Learning Meets <GradientText>Real Technology</GradientText></>}
            description={whyIntro.description}
          />
        </ScrollReveal>

        <div className="inv-why">
          <div className="inv-why__col">
            {left.map((c, i) => <WhyCard key={c.id} card={c} index={i} activeLayer={layer} setLayer={setLayer} side="l" />)}
          </div>
          <div className="inv-stage3d inv-stage3d--why">
            <SceneHost
              scene={WhyCore3D}
              sceneProps={{ activeLayer: layer }}
              fallback={<StaticCore active={layer} />}
              eventSourceRef={sectionRef}
              label="Digital core"
            />
          </div>
          <div className="inv-why__col">
            {right.map((c, i) => <WhyCard key={c.id} card={c} index={i + 3} activeLayer={layer} setLayer={setLayer} side="r" />)}
          </div>
        </div>
      </Container>
    </section>
  );
}