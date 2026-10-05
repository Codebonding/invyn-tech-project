export default function GlassCard({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag className={`inv-glass-card ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}