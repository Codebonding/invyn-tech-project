import { Link } from "react-router-dom";
import Icon from "../common/Icon";

/** Enquiry call-to-action band. `primary` and `secondary` are { label, to }. */
export default function ServiceCta({ id = "svc-cta", title, text, primary, secondary }) {
  return (
    <section className="inv-svc-cta" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <p>{text}</p>
      <div className="inv-svc-cta__actions">
        <Link className="inv-btn inv-btn--primary" to={primary.to}>
          {primary.label} <Icon name="arrow" size={18} className="inv-btn__arrow" />
        </Link>
        {secondary && <Link className="inv-btn inv-btn--outline" to={secondary.to}>{secondary.label}</Link>}
      </div>
    </section>
  );
}