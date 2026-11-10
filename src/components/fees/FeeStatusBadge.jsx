import { statusLabel } from "../../utils/feeFormat";

const TONE = { paid: "ok", success: "ok", partially_paid: "info", pending: "info", unpaid: "info", overdue: "danger", failed: "danger", cancelled: "warn", refunded: "warn", partially_refunded: "warn" };

/** Used for both the overall FEE status and a single TRANSACTION's status. Text is always shown, never colour alone. */
export default function FeeStatusBadge({ status }) {
  return <span className={`sd-badge fe-badge fe-badge--${TONE[status] || "info"}`}>{statusLabel(status)}</span>;
}