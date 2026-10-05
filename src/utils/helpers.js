export const cx = (...parts) => parts.filter(Boolean).join(" ");
export const pad2 = (n) => String(n).padStart(2, "0");