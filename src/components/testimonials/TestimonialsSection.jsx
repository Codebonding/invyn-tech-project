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
import { testimonials } from "../../data/testimonials";
import { ROUTES } from "../../utils/constant";
import { homeContent } from "../../utils/content";
const c = homeContent.testimonials;
const TestimonialSpace3D = lazy(() => import("../animation/3d/TestimonialSpace3D"));

const offsetOf = (i, active, n) => {
  let d = i - active;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
};

const pad = (n) => String(n).padStart(2, "0");
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Avatar({ t }) {
  return t.avatar ? (
    <img className="inv-quote__avatar" src={t.avatar} alt="" width="52" height="52" loading="lazy" decoding="async" />
  ) : (
    <span className="inv-quote__avatar inv-quote__avatar--initials" aria-hidden="true">{initials(t.name)}</span>
  );
}

function Quote({ t }) {
  const rating = Math.max(0, Math.min(5, Math.round(t.rating || 0)));
  return (
    <figure className="inv-quote">
      <svg className="inv-quote__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M13 6C7.5 8 4 12.6 4 19v7h9v-9H8.5c.4-3.3 2.3-5.6 5.5-6.9L13 6zm15 0c-5.5 2-9 6.6-9 13v7h9v-9h-4.5c.4-3.3 2.3-5.6 5.5-6.9L28 6z" fill="currentColor" />
      </svg>
      {rating > 0 && (
        <p className="inv-quote__stars" role="img" aria-label={`Rated ${rating} out of 5`}>
          <span aria-hidden="true">{"★".repeat(rating)}<i>{"★".repeat(5 - rating)}</i></span>
        </p>
      )}
      <blockquote className="inv-quote__text"><p>{t.quote}</p></blockquote>
      <figcaption className="inv-quote__who">
        <Avatar t={t} />
        <span className="inv-quote__meta">
          <strong>{t.name}</strong>
          <span>{[t.role, t.organization].filter(Boolean).join(" · ")}</span>
        </span>
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

  const swipe = useRef(null);
  const onPointerDown = (e) => { if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || n < 2) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) go(dx < 0 ? 1 : -1);
  };

  return (
    <section ref={sectionRef} id="testimonials" className="inv-section inv-home3d inv-tsection" aria-labelledby="testi-title">
      {c.image && <img className="inv-tsection__img" src={c.image} alt={c.imageAlt} loading="lazy" decoding="async" />}
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
            eyebrow={c.eyebrow}
            title={<>{c.title[0]}<GradientText>{c.title[1]}</GradientText>{c.title[2]}</>}
            description={c.description}
          />
        </ScrollReveal>

        {n === 0 ? (
          <div className="inv-tempty">
            <div className="inv-tghosts" aria-hidden="true"><span /><span /><span /></div>
            <p className="inv-tempty__text">{c.emptyText}</p>
            <Link className="inv-flink inv-flink--inline" to={ROUTES.contact}>{c.emptyCta}</Link>
          </div>
        ) : list ? (
          <ul className="inv-tlist">
            {testimonials.map((t) => <li key={t.id}><Quote t={t} /></li>)}
          </ul>
        ) : (
          <div role="group" aria-roledescription="carousel" aria-label="Testimonials" onKeyDown={onKeyDown}>
            <div className="inv-tstage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { swipe.current = null; }}>
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
                <span className="inv-tcount" aria-hidden="true">{pad(index + 1)} <i>/</i> {pad(n)}</span>
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