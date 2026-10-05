import GlassCard from "../common/GlassCard";
import Icon from "../common/Icon";
import { pad2 } from "../../utils/helpers";
import { ROUTES } from "../../utils/constant";

export default function ServiceCard({ id, title, description, icon, href = ROUTES.services }) {
  return (
    <GlassCard as="article" className="inv-card inv-service-card">
      <div className="inv-card__top">
        <span className="inv-card__icon"><Icon name={icon} /></span>
        <span className="inv-card__num">{pad2(id)}</span>
      </div>
      <h3 className="inv-card__title">{title}</h3>
      <p className="inv-card__text">{description}</p>
      <a href={href} className="inv-card__link" aria-label={`Explore ${title}`}>
        Explore <span className="inv-card__link-arrow" aria-hidden="true">→</span>
      </a>
    </GlassCard>
  );
}