import { lazy, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../common/Container";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import Icon from "../common/Icon";
import ScrollReveal from "../animation/ScrollReveal";
import SceneHost from "../animation/3d/SceneHost";
import useMediaQuery from "../../hooks/useMediaQuery";
import { mq } from "../../utils/responsive";
import { testimonials, testimonialsIntro } from "../../data/testimonials";
import { ROUTES } from "../../utils/constant";


const TestimonialSpace3D = lazy(() => import("../animation/3d/TestimonialSpace3D"));

const offsetOf = (i, active, n) => {
  let d = i - active;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
};

function Quote({ t }) {
  return (
    <figure className="inv-quote">
      <blockquote className="inv-quote__text"><p>{t.quote}</p></blockquote>
      <figcaption className="inv-quote__who">
        <strong>{t.name}</strong>
        <span>{[t.role, t.organization].filter(Boolean).join(" · ")}</span>
      </figcaption>
    </figure>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const list = useMediaQuery(mq.belowTablet);
  const [index, setIndex] = useState(0);
  const n = testimonials.length;
  const go = (d) => setIndex((i) => (i + d + n) % n);
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  return (
    <section ref={sectionRef} id="testimonials" className="inv-section inv-home3d inv-tsection" aria-labelledby="testi-title">
      <div className="inv-tsection__bg" aria-hidden="true">
        <SceneHost
          scene={TestimonialSpace3D}
          sceneProps={{ index, count: Math.max(n, 1) }}
          fallback={null}
          mobile="static"
          eventSourceRef={sectionRef}
          label="Spatial depth backdrop"
        />
      </div>
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="testi-title"
            eyebrow={testimonialsIntro.eyebrow}
            title={<>What Our <GradientText>Community Says</GradientText></>}
            description={testimonialsIntro.description}
          />
        </ScrollReveal>

        {n === 0 ? (
          <div className="inv-tempty">
            <div className="inv-tghosts" aria-hidden="true"><span /><span /><span /></div>
            <p className="inv-tempty__text">Learner and client stories will appear here soon.</p>
            <Link className="inv-flink inv-flink--inline" to={ROUTES.contact}>Start your own story with INVYN TECH</Link>
          </div>
        ) : list ? (
          <ul className="inv-tlist">
            {testimonials.map((t) => <li key={t.id}><Quote t={t} /></li>)}
          </ul>
        ) : (
          <div role="group" aria-roledescription="carousel" aria-label="Testimonials" onKeyDown={onKeyDown}>
            <div className="inv-tstage">
              {testimonials.map((t, i) => {
                const o = offsetOf(i, index, n);
                if (Math.abs(o) > 2) return null;
                return (
                  <div
                    key={t.id}
                    className={`inv-tslot ${o === 0 ? "is-active" : ""}`}
                    style={{ "--o": o, "--a": Math.abs(o) }}
                    aria-hidden={o !== 0 ? "true" : undefined}
                    onClick={o !== 0 ? () => setIndex(i) : undefined}
                  >
                    <Quote t={t} />
                  </div>
                );
              })}
            </div>
            <p className="visually-hidden" aria-live="polite">Testimonial {index + 1} of {n}</p>
            {n > 1 && (
              <div className="inv-courses-controls">
                <button type="button" className="inv-ctrl" onClick={() => go(-1)} aria-label="Previous testimonial"><Icon name="arrow" size={20} className="inv-ctrl__flip" /></button>
                <ol className="inv-dots">
                  {testimonials.map((t, i) => (
                    <li key={t.id}>
                      <button type="button" className="inv-dot" aria-label={`Show testimonial from ${t.name}`} aria-current={i === index ? "true" : undefined} onClick={() => setIndex(i)} />
                    </li>
                  ))}
                </ol>
                <button type="button" className="inv-ctrl" onClick={() => go(1)} aria-label="Next testimonial"><Icon name="arrow" size={20} /></button>
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}