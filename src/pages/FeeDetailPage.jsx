import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { useAdjustFeeMutation, useGetAdminFeeQuery, useGetAdminPaymentsQuery, useRecordManualPaymentMutation, useRefundPaymentMutation } from "../services/feesApi";
import { ROUTES } from "../utils/constant";
import { openPrivateFile } from "../utils/materialFile";
import { serverMessage } from "../utils/profileValidation";
import { formatDate, formatTime } from "../utils/studentFormat";
import FeeBreakdown from "../components/fees/FeeBreakdown";
import PaymentsTable from "../components/fees/PaymentsTable";
import { AdjustFeeDialog, ManualPaymentDialog, RefundDialog } from "../components/fees/MoneyDialogs";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";
import "../styles/fees.css";

export default function FeeDetailPage() {
  const { id } = useParams();
  usePageSeo({ title: "Fee details | INVYN TECH", description: "Fee and payment details.", path: ROUTES.staffFeeDetail(id) }, [id]);
  const fee = useGetAdminFeeQuery(id);
  const payments = useGetAdminPaymentsQuery({ studentId: fee.data?.student?.id, courseId: fee.data?.courseId, limit: 100 }, { skip: !fee.data });
  const [recordManual] = useRecordManualPaymentMutation();
  const [refundPayment] = useRefundPaymentMutation();
  const [adjustFee] = useAdjustFeeMutation();
  const [dialog, setDialog] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { toasts, push } = useToasts();
  const f = fee.data;

  const close = () => setDialog(null);
  const receipt = async (p) => {
    setBusyId(p.id);
    try { await openPrivateFile(`/admin/payments/${p.id}/receipt`, { download: true, fileName: `receipt-${p.receiptNumber}.pdf` }); }
    catch { push("The receipt could not be downloaded.", "error"); }
    finally { setBusyId(null); }
  };

  return (
    <div className="inv-page"><Container><div className="sp mc fe">
      <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.staffFees}>← Back to fee management</Link></nav>
      {fee.isLoading ? <div role="status" aria-label="Loading fee details"><CardSkeleton lines={5} /></div>
        : fee.isError ? <ErrorState message={serverMessage(fee.error, "We could not load this fee.")} onRetry={fee.refetch} />
        : (
          <div className="sd-stack">
            <header className="sd-card"><h1>{f.student.name}</h1><p className="sd-muted">{f.student.studentId} · {f.student.email} · {f.courseTitle}</p></header>
            <FeeBreakdown fee={f} action={f.status !== "cancelled" && (
              <div className="lm-actions">
                {f.outstandingMinor > 0 && <button type="button" className="sd-btn sd-btn--primary" onClick={() => setDialog("manual")}>Record payment</button>}
                <button type="button" className="sd-btn" onClick={() => setDialog("adjust")}>Adjust fee</button>
              </div>)} />
            <section className="sd-card sp-section" aria-label="Transactions">
              <div className="sp-section__head"><h2>Transactions</h2></div>
              {payments.isLoading ? <CardSkeleton lines={2} /> : payments.isError ? <ErrorState message={serverMessage(payments.error, "We could not load the transactions.")} onRetry={payments.refetch} />
                : payments.data.items.length === 0 ? <EmptyState title="No transactions yet">Recorded payments appear here.</EmptyState>
                : <PaymentsTable items={payments.data.items} admin busyId={busyId} onReceipt={receipt} onRefund={(p) => setDialog({ refund: p })} />}
            </section>
            <section className="sd-card sp-section" aria-label="Audit history">
              <div className="sp-section__head"><h2>Audit history</h2></div>
              {f.audit.length === 0 ? <EmptyState title="No audit entries">Changes to this fee are logged here.</EmptyState> : (
                <ol className="sd-timeline">{f.audit.map((a) => (
                  <li key={a.id}><span className="sd-dot" aria-hidden="true" /><div>
                    <p className="sd-timeline__title">{a.action.replace(/[._]/g, " ")}</p>
                    <p className="sd-muted">{a.actor ? a.actor.name : "System"} · {formatDate(a.createdAt)} {formatTime(a.createdAt)}{a.details?.reason ? ` · ${a.details.reason}` : ""}</p>
                  </div></li>))}</ol>)}
            </section>
          </div>)}
    </div></Container>
      {dialog === "manual" && <ManualPaymentDialog fee={f} onSubmit={async (b) => { await recordManual(b).unwrap(); push("Payment recorded."); close(); }} onCancel={close} />}
      {dialog === "adjust" && <AdjustFeeDialog fee={f} onSubmit={async ({ id: feeId, ...b }) => { await adjustFee({ id: feeId, ...b }).unwrap(); push("Fee updated."); close(); }} onCancel={close} />}
      {dialog?.refund && <RefundDialog payment={dialog.refund} onSubmit={async ({ id: pid, ...b }) => { await refundPayment({ id: pid, ...b }).unwrap(); push("Refund recorded."); close(); }} onCancel={close} />}
      <Toasts toasts={toasts} />
    </div>
  );
}