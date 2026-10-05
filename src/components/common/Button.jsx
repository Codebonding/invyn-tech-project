import Icon from "./Icon";

export default function Button({ children, href, variant = "primary", arrow = false, className = "", ...rest }) {
  const cls = `inv-btn inv-btn--${variant} ${className}`.trim();
  const content = (
    <>
      {children}
      {arrow && <Icon name="arrow" size={18} className="inv-btn__arrow" />}
    </>
  );
  return href ? (
    <a href={href} className={cls} {...rest}>{content}</a>
  ) : (
    <button type="button" className={cls} {...rest}>{content}</button>
  );
}