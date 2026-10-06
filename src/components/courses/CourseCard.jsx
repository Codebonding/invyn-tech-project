import GlassCard from "../common/GlassCard";
import Icon from "../common/Icon";
import Button from "../common/Button";
import CourseArt from "./CourseArt";
import useCardTilt from "../../hooks/useCardTilt";

export default function CourseCard({ course, tiltIntensity = 1, interactive = true, onSurfaceClick }) {
  const { title, description, duration, mode, level, category, technologies, image, href } = course;
  const { ref, onPointerMove, onPointerLeave } = useCardTilt({
    enabled: tiltIntensity > 0,
    intensity: tiltIntensity,
  });
  const focusProps = interactive ? {} : { tabIndex: -1 };

  return (
    <GlassCard
      as="article"
      ref={ref}
      className="inv-course3d"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={onSurfaceClick}
    >
      <div className="inv-course3d__media">
        <div className="inv-course3d__media-inner">
          {image ? (
            <img src={image} alt={`${title} course illustration`} loading="lazy" decoding="async" />
          ) : (
            <CourseArt category={category} />
          )}
        </div>
        <span className="inv-course3d__badge">{category}</span>
      </div>

      <div className="inv-course3d__body">
        <h3 className="inv-course3d__title">{title}</h3>
        <p className="inv-course3d__text">{description}</p>

        <ul className="inv-course3d__meta" aria-label="Course details">
          <li><Icon name="clock" size={16} /> {duration}</li>
          <li><Icon name="monitor" size={16} /> {mode}</li>
          <li><Icon name="bars" size={16} /> {level}</li>
        </ul>

        <ul className="inv-pills" aria-label="Technologies">
          {technologies.map((t) => <li className="inv-pill" key={t}>{t}</li>)}
        </ul>

        <Button href={href} variant="primary" className="inv-btn--sm" arrow aria-label={`Explore ${title}`} {...focusProps}>
          Explore Course
        </Button>
      </div>
    </GlassCard>
  );
}