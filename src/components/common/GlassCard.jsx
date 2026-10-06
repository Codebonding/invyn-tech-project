import {forwardRef} from "react";

const GlassCard = forwardRef(function GlassCard({ as: Tag = "div", className = "", children, ...rest }, ref) {
  return (
    <Tag ref={ref} className={`inv-glass-card ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
});
export default GlassCard;