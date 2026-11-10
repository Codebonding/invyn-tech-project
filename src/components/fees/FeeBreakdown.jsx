import { formatMinor } from "../../utils/feeFormat";
import ProgressBar from "../student/ProgressBar";
import FeeStatusBadge from "./FeeStatusBadge";
import { formatDate } from "../../utils/studentFormat";

/** One course's fee: the figures are exactly what the server calculated. Nothing is computed here. */
export default function FeeBreakdown({ fee, action }) {
  const c = fee.currency;
  const rows = [
    ["Course fee", fee.courseFeeMinor], ["Discount", -fee.discountMinor], ["Additional charges", fee.additionalMinor],
    ["Total payable", fee.totalPayableMinor], ["Amount paid", fee.paidMinor], ["Outstanding", fee.outstandingMinor],
  ];
  const pct = fee.totalPayableMinor > 0 ? Math.min(100, Math.round((fee.paidMinor / fee.totalPayableMinor) * 100)) : 100;
  return (
    <article className="sd-card fe-fee" aria-label={`${fee.courseTitle} fee`}>
      <div className="sp-section__head"><h3>{fee.courseTitle}</h3><FeeStatusBadge status={fee.status} /></div>
      <dl className="fe-rows">
        {rows.map(([label, value]) => (
          <div key={label} className={label === "Outstanding" ? "is-strong" : ""}><dt>{label}</dt><dd>{value < 0 ? `− ${formatMinor(-value, c)}` : formatMinor(value, c)}</dd></div>
        ))}
        <div><dt>Due date</dt><dd>{fee.dueDate ? formatDate(fee.dueDate) : "Not set"}</dd></div>
      </dl>
      <ProgressBar value={pct} label={`${fee.courseTitle} paid`} />
      {action}
    </article>
  );
}