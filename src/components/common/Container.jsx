export default function Container({ children, className = "", fluid = false, as: Tag = "div" }) {
  return <Tag className={`${fluid ? "container-fluid" : "container"} ${className}`.trim()}>{children}</Tag>;
}