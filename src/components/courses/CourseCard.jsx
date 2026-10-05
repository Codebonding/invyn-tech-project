import GlassCard from "../common/GlassCard";
import Icon from "../common/Icon";
import { ROUTES } from "../../utils/constant";

export default function CourseCard({ category, icon, title, description, technologies, href = ROUTES.courses, hidden = false }) {
  return (
    <GlassCard as="article" className="inv-card inv-course-card">
      <div className="inv-card__top">
        <span className="inv-card__icon"><Icon name={icon} /></span>
        <span className="inv-card__category">{category}</span>
      </div>
      <h3 className="inv-card__title">{title}</h3>
      <p className="inv-card__text">{description}</p>
      <ul className="inv-pills" aria-label="Technologies">
        {technologies.map((t) => <li className="inv-pill" key={t}>{t}</li>)}
      </ul>
      <a href={href} className="inv-card__link" tabIndex={hidden ? -1 : undefined}>
        Explore Course <span className="inv-card__link-arrow" aria-hidden="true">→</span>
      </a>
    </GlassCard>
  );
}