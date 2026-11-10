import { formatMinor, methodLabel } from "../../utils/feeFormat";
import { formatDate, formatTime } from "../../utils/studentFormat";
import FeeStatusBadge from "./FeeStatusBadge";

/**
 * Transaction history. `admin` adds the student column and admin actions.
 * Receipts are offered only when the server says one exists (verified, successful transactions).
 */
export default function PaymentsTable({ items, admin = false, busyId, onReceipt, onRefund, onView }) {
  return (
    <div className="lm-table-wrap">
      <table className="lm-table">
        <caption className="visually-hidden">Payment history</caption>
        <thead>
          <tr>
            <th scope="col">Transaction ID</th>{admin && <th scope="col">Student</th>}<th scope="col">Course</th><th scope="col">Amount</th>
            <th scope="col">Method</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col">Receipt</th>{admin && <th scope="col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const isRefund = p.kind === "refund";
            const refundable = p.amountMinor - p.refundedMinor;
            return (
              <tr key={p.id}>
                <td data-label="Transaction ID"><code>{p.transactionId}</code>{isRefund && <span className="sd-tag">Refund</span>}</td>
                {admin && <td data-label="Student"><strong>{p.student?.name}</strong><span className="sd-muted"> {p.student?.studentId}</span></td>}
                <td data-label="Course">{p.courseTitle}</td>
                <td data-label="Amount">{isRefund ? "− " : ""}{formatMinor(p.amountMinor, p.currency)}</td>
                <td data-label="Method">{methodLabel(p.method)}</td>
                <td data-label="Date">{p.paymentDate ? <>{formatDate(p.paymentDate)} <span className="sd-muted">{formatTime(p.paymentDate)}</span></> : <span className="sd-muted">Not completed</span>}</td>
                <td data-label="Status"><FeeStatusBadge status={p.displayStatus} /></td>
                <td data-label="Receipt">
                  {p.hasReceipt ? (
                    <button type="button" className="sd-btn sd-btn--sm" disabled={busyId === p.id} onClick={() => onReceipt(p)} aria-label={`Download receipt ${p.receiptNumber}`}>
                      {busyId === p.id ? "Preparing…" : "Download"}
                    </button>
                  ) : <span className="sd-muted">Not available</span>}
                </td>
                {admin && (
                  <td data-label="Actions">
                    <div className="lm-actions">
                      {onView && <button type="button" className="sd-btn sd-btn--sm" onClick={() => onView(p)} aria-label={`View ${p.transactionId}`}>Details</button>}
                      {onRefund && !isRefund && p.status === "success" && refundable > 0 && (
                        <button type="button" className="sd-btn sd-btn--sm lm-danger" onClick={() => onRefund(p)} aria-label={`Refund ${p.transactionId}`}>Refund</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}