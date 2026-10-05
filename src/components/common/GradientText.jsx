export default function GradientText({ children, as: Tag = "span", className = "" }) {
  return <Tag className={`inv-gradient-text ${className}`.trim()}>{children}</Tag>;
}