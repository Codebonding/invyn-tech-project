import { lazy, Suspense, useMemo, useRef, useState } from "react";
import Container from "../common/Container";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import Button from "../common/Button";
import Icon from "../common/Icon";
import ScrollReveal from "../animation/ScrollReveal";
import Marquee from "../animation/Marquee";
import CourseCard from "./CourseCard";
import CourseMiniCard from "./CourseMiniCard";
import CharacterBoundary from "./CharacterBoundary";
import useCourseInteraction from "../../hooks/useCourseInteraction";
import useReducedMotion from "../../hooks/useReducedMotion";
import useMediaQuery from "../../hooks/useMediaQuery";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import { courses, coursesIntro } from "../../data/courses";
import { animationConfig, courseTimeline } from "../../utils/animation";
import { mq } from "../../utils/responsive";
import { ROUTES } from "../../utils/constant";

const CourseCharacter3D = lazy(() => import("./CourseCharacter3D"));

/** Signed shortest distance of card i from the active index, wrapped around the list. */
const offsetOf = (i, active, n) => {
  let d = i - active;
  const h = n / 2;
  if (d > h) d -= n;
  if (d < -h) d += n;
  return d;
};

export default function CoursesSection() {
  const reduced = useReducedMotion();
  const belowTablet = useMediaQuery(mq.belowTablet);
  const belowLaptop = useMediaQuery(mq.belowLaptop);
  const tiltIntensity = reduced || belowTablet ? 0 : belowLaptop ? 0.5 : 1;

  // stage ref doubles as the visibility gate: the 3D canvas only renders while on screen
  const [stageRef, stageVisible] = useIntersectionObserver({ once: false, threshold: 0.05 });
  const getCardRect = () =>
    stageRef.current?.querySelector(".inv-slot.is-active .inv-course3d")?.getBoundingClientRect() ?? null;

  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(courses.map((c) => c.category))], []);
  const list = useMemo(
    () => (category === "All" ? courses : courses.filter((c) => c.category === category)),
    [category]
  );
  const n = list.length;

  const { index, outgoing, phase, next, prev, goTo, reset } = useCourseInteraction({ count: n, reduced });
  const current = list[index] || list[0];

  const slots = list
    .map((course, i) => {
      const o = offsetOf(i, index, n);
      // cards that wrap around the list jump silently instead of sweeping across the stage
      const jump = outgoing !== null && Math.abs(offsetOf(i, outgoing, n) - o) > n / 2 + 0.5;
      return { course, i, o, jump };
    })
    .filter((s) => Math.abs(s.o) <= 3);

  const onFilter = (cat) => { setCategory(cat); reset(); };
  const pick = (i, o) => goTo(i, o > 0 ? 1 : -1);
  const select = (id) => {
    const i = list.findIndex((c) => c.id === id);
    if (i >= 0) pick(i, offsetOf(i, index, n));
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  // swipe (touch / pen only, so mouse tilt and clicks stay untouched)
  const swipe = useRef(null);
  const onPointerDown = (e) => { if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
  };

  const onSurfaceClick = (e) => {
    if (e.target.closest("a, button")) return;
    next();
  };

  return (
    <section className="inv-section" id="courses" aria-labelledby="courses-title">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="courses-title"
            eyebrow={coursesIntro.eyebrow}
            title={<>Learn. <GradientText>Build.</GradientText> Master.</>}
            description={coursesIntro.description}
          />
        </ScrollReveal>

        <div className="inv-filter" role="group" aria-label="Filter courses by category">
          {categories.map((cat) => (
            <button key={cat} type="button" className="inv-filter__btn" aria-pressed={cat === category} onClick={() => onFilter(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div role="group" aria-roledescription="carousel" aria-label="Featured courses" onKeyDown={onKeyDown}>
          <div
            ref={stageRef}
            className="inv-stage"
            data-phase={phase}
            style={{ "--inv-card-move": `${courseTimeline.cardMove}ms` }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { swipe.current = null; }}
          >
            <div className="inv-stage__cards">
              {slots.map(({ course, i, o, jump }) => (
                <div
                  key={course.id}
                  className={`inv-slot ${o === 0 ? "is-active" : ""} ${jump ? "is-jump" : ""}`}
                  style={{ "--o": o, "--a": Math.abs(o), "--fd": `${-(i * 1.4)}s` }}
                  aria-hidden={o !== 0 ? "true" : undefined}
                  onClick={o !== 0 ? () => pick(i, o) : undefined}
                >
                  <div className="inv-float">
                    <CourseCard
                      course={course}
                      interactive={o === 0}
                      tiltIntensity={o === 0 ? tiltIntensity : 0}
                      onSurfaceClick={o === 0 ? onSurfaceClick : undefined}
                    />
                  </div>
                  <span className="inv-slot__shadow" aria-hidden="true" />
                </div>
              ))}
            </div>

            {!reduced && (
              <div className="inv-char-zone">
                <CharacterBoundary>
                  <Suspense fallback={null}>
                    <CourseCharacter3D phase={phase} getCardRect={getCardRect} active={stageVisible} />
                  </Suspense>
                </CharacterBoundary>
              </div>
            )}
          </div>

          <p className="visually-hidden" aria-live="polite">
            {current.title}, course {index + 1} of {n}
          </p>

          <div className="inv-courses-controls">
            <button type="button" className="inv-ctrl" onClick={prev} aria-label="Previous course">
              <Icon name="arrow" size={20} className="inv-ctrl__flip" />
            </button>
            <ol className="inv-dots">
              {list.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="inv-dot"
                    aria-label={`Show ${c.title}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => select(c.id)}
                  />
                </li>
              ))}
            </ol>
            <button type="button" className="inv-ctrl" onClick={next} aria-label="Next course">
              <Icon name="arrow" size={20} />
            </button>
          </div>
        </div>
      </Container>

      <div className="inv-courses-strip">
        <Marquee
          items={list}
          speed={animationConfig.marquee.course}
          gap={16}
          label="All courses"
          paused={phase !== "idle"}
          renderItem={(c, _i, hidden) => (
            <CourseMiniCard course={c} active={c.id === current.id} hidden={hidden} onSelect={select} />
          )}
        />
      </div>

      <Container>
        <div className="inv-courses-cta">
          <Button href={ROUTES.courses} variant="primary" arrow>View All Courses</Button>
          <Button href={ROUTES.contact} variant="outline">Talk to INVYN TECH</Button>
        </div>
      </Container>
    </section>
  );
}