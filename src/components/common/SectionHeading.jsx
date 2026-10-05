export default function SectionHeading({
  eyebrow,
  title,
  description,
  alignment = "center",
  className = "",
  id,
  as: Tag = "h2",
}) {
  return (
    <header className={`inv-section-heading inv-align-${alignment} ${className}`.trim()}>
      {eyebrow && <p className="inv-eyebrow">{eyebrow}</p>}
      <Tag id={id} className="inv-section-title">{title}</Tag>
      {description && <p className="inv-section-desc">{description}</p>}
    </header>
  );
}