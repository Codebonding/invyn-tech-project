import Button from "../common/Button";
import GlassCard from "../common/GlassCard";
import Icon from "../common/Icon";
import { pad2 } from "../../utils/helpers";
import { ROUTES } from "../../utils/constant";

export default function ServiceCard({ id, title, description, summary, icon, href = ROUTES.services }) {
  return (
    <GlassCard as="article" className="inv-card inv-service-card" data-tilt>
      <div className="inv-card__top">
        <span className="inv-card__icon"><Icon name={icon} /></span>
        <span className="inv-card__num">{pad2(id)}</span>
      </div>
      <h3 className="inv-card__title">{title}</h3>
      <p className="inv-card__text">{description || summary}</p>
      <Button href={href} variant="primary" className="inv-btn--sm inv-card__cta" arrow aria-label={`Explore ${title}`}>
        Explore
      </Button>
    </GlassCard>
  );
}