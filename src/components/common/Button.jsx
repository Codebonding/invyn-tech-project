import { Link } from "react-router-dom";
import Icon from "./Icon";
const isInternal = (href) => typeof href === "string" && href.startsWith("/") && !href.startsWith("//");

export default function Button({ children, href, variant = "primary", arrow = false, className = "", ...rest }) {
  const cls = `inv-btn inv-btn--${variant} ${className}`.trim();
  const content = (
    <>
      {children}
      {arrow && <Icon name="arrow" size={18} className="inv-btn__arrow" />}
    </>
  );
  if (href && isInternal(href)) return <Link to={href} className={cls} {...rest}>{content}</Link>; // SPA navigation, no page reload
  return href ? (
    <a href={href} className={cls} {...rest}>{content}</a>
  ) : (
    <button type="button" className={cls} {...rest}>{content}</button>
  );
}