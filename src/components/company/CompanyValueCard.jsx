import GlassCard from "../common/GlassCard";
import Icon from "../common/Icon";
import { pad2 } from "../../utils/helpers";

export default function CompanyValueCard({ id, title, description, icon }) {
  return (
    <GlassCard as="article" className="inv-card inv-value-card">
      <div className="inv-card__top">
        <span className="inv-card__icon"><Icon name={icon} /></span>
        <span className="inv-card__num">{pad2(id)}</span>
      </div>
      <h3 className="inv-card__title">{title}</h3>
      <p className="inv-card__text">{description}</p>
    </GlassCard>
  );
}