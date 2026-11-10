import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { useCreatePaymentOrderMutation, useGetStudentFeeSummaryQuery, useGetStudentFeesQuery, useGetStudentPaymentsQuery, useVerifyPaymentMutation } from "../services/feesApi";
import { PAYMENT_STATUSES, cleanParams, dateRangeError, formatMinor, newIdempotencyKey } from "../utils/feeFormat";
import { ROUTES } from "../utils/constant";
import { openPrivateFile } from "../utils/materialFile";
import { getCheckoutAdapter } from "../utils/paymentCheckout";
import { serverMessage } from "../utils/profileValidation";
import { formatDate } from "../utils/studentFormat";
import StatCard from "../components/student/StatCard";
import Pagination from "../components/student/courses/Pagination";
import FeeBreakdown from "../components/fees/FeeBreakdown";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import PaymentsTable from "../components/fees/PaymentsTable";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";
import "../styles/fees.css";

const PAGE_SIZE = 10;
const DEFAULTS = { courseId: "", status: "", from: "", to: "" };

export default function StudentFeesPage() {
  usePageSeo({ title: "My fees | INVYN TECH", description: "Your fees and payments.", path: ROUTES.studentFees }, []);
  const [filters, setFilters] = useState(DEFAULTS);
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const { toasts, push } = useToasts();

  const rangeError = dateRangeError(filters.from, filters.to);
  const summary = useGetStudentFeeSummaryQuery();
  const fees = useGetStudentFeesQuery({});
  const history = useGetStudentPaymentsQuery({ ...cleanParams(filters), limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }, { skip: Boolean(rangeError) });
  const [createOrder] = useCreatePaymentOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const change = (p) => { setFilters((f) => ({ ...f, ...p })); setPage(1); };
  const clear = () => { setFilters(DEFAULTS); setPage(1); };
  const active = Boolean(filters.courseId || filters.status || filters.from || filters.to);
  const online = summary.data?.onlinePayments;
  const data = history.data;
  const pageCount = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const receipt = async (p) => {
    setBusyId(p.id);
    try { await openPrivateFile(`/student/payments/${p.id}/receipt`, { download: true, fileName: `receipt-${p.receiptNumber}.pdf` }); }
    catch { push("The receipt could not be downloaded.", "error"); }
    finally { setBusyId(null); }
  };

  /** Pay now: the SERVER creates the order and decides the amount; the provider's checkout runs in an adapter; success is verified on the server. */
  const payNow = async (fee) => {
    if (payingId) return;
    setPayingId(fee.id);
    try {
      const res = await createOrder({ enrollmentId: fee.enrollmentId, idempotencyKey: newIdempotencyKey() }).unwrap();
      const { payment, checkout } = res.data;
      const adapter = getCheckoutAdapter(checkout.provider);
      if (!adapter) { push("Online checkout is not available for this provider yet. Please contact the office.", "error"); return; }
      adapter({
        checkout,
        onSuccess: async ({ gatewayPaymentId, signature }) => {
          try { await verifyPayment({ paymentId: payment.id, gatewayPaymentId, signature }).unwrap(); push("Payment confirmed."); }
          catch (e) { push(serverMessage(e), "error"); }
        },
        onDismiss: () => push("Payment was not completed."),
      });
    } catch (e) {
      push(serverMessage(e), "error");
    } finally {
      setPayingId(null);
    }
  };

  const s = summary.data;
  return (
    <div className="inv-page">
      <Container>
        <div className="sp mc fe">
          <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.studentDashboard}>← Back to dashboard</Link></nav>
          <header className="mc-header"><div><h1>My Fees</h1><p className="sd-muted">Your course fees, payments and receipts.</p></div></header>

          {summary.isLoading ? (
            <div role="status" aria-label="Loading fee summary" className="sd-stats">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} lines={1} />)}</div>
          ) : summary.isError ? (
            <ErrorState message={serverMessage(summary.error, "We could not load your fees.")} onRetry={summary.refetch} />
          ) : (
            <section className="sd-stats" aria-label="Fee summary">
              <StatCard label="Total payable" value={formatMinor(s.totalPayableMinor, s.currency)} hint={`${s.feeCount} course${s.feeCount === 1 ? "" : "s"}`} />
              <StatCard label="Amount paid" value={formatMinor(s.paidMinor, s.currency)} hint="Verified payments" />
              <StatCard label="Pending balance" value={formatMinor(s.outstandingMinor, s.currency)} hint={s.nextDueDate ? `Next due ${formatDate(s.nextDueDate)}` : "No due date set"} />
              <div className="sd-card sd-stat"><p className="sd-stat__label">Payment status</p><p className="fe-status">{s.status ? <FeeStatusBadge status={s.status} /> : "No fees"}</p>{s.overdueMinor > 0 && <p className="sp-error">{formatMinor(s.overdueMinor, s.currency)} overdue</p>}</div>
            </section>
          )}

          <h2 className="at-h2">Course fees</h2>
          {fees.isLoading ? <CardSkeleton lines={4} /> : fees.isError ? (
            <ErrorState message={serverMessage(fees.error, "We could not load your course fees.")} onRetry={fees.refetch} />
          ) : fees.data.items.length === 0 ? (
            <EmptyState title="No fees to pay">Courses with a fee will appear here once you enrol.</EmptyState>
          ) : (
            <div className="sd-courses">
              {fees.data.items.map((f) => (
                <FeeBreakdown key={f.id} fee={f} action={online?.enabled && f.outstandingMinor > 0 && f.status !== "cancelled" ? (
                  <button type="button" className="sd-btn sd-btn--primary" disabled={payingId === f.id} onClick={() => payNow(f)}>{payingId === f.id ? "Starting…" : `Pay now · ${formatMinor(f.outstandingMinor, f.currency)}`}</button>
                ) : null} />
              ))}
            </div>
          )}
          {s && !online?.enabled && s.outstandingMinor > 0 && <p className="sd-muted">Online payment is not available yet. Please pay at the office; your payment appears here once it has been recorded.</p>}

          <h2 className="at-h2">Payment history</h2>
          <div className="at-filters" role="search" aria-label="Payment filters">
            <div className="sp-field"><label htmlFor="sf-course">Course</label>
              <select id="sf-course" className="sp-input" value={filters.courseId} onChange={(e) => change({ courseId: e.target.value })}>
                <option value="">All courses</option>{(fees.data?.items || []).map((f) => <option key={f.courseId} value={f.courseId}>{f.courseTitle}</option>)}
              </select></div>
            <div className="sp-field"><label htmlFor="sf-status">Payment status</label>
              <select id="sf-status" className="sp-input" value={filters.status} onChange={(e) => change({ status: e.target.value })}>
                <option value="">All statuses</option>{PAYMENT_STATUSES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select></div>
            <div className="sp-field"><label htmlFor="sf-from">From</label><input id="sf-from" type="date" className="sp-input" value={filters.from} onChange={(e) => change({ from: e.target.value })} /></div>
            <div className="sp-field"><label htmlFor="sf-to">To</label><input id="sf-to" type="date" className="sp-input" value={filters.to} onChange={(e) => change({ to: e.target.value })} /></div>
            {active && <button type="button" className="sd-btn sd-btn--sm lm-clear" onClick={clear}>Clear filters</button>}
          </div>
          {rangeError && <p className="sp-error" role="alert">{rangeError}</p>}

          <section aria-label="Payment history" aria-busy={history.isFetching} className={history.isFetching && data ? "mc-dim" : ""}>
            {history.isLoading ? <div role="status" aria-label="Loading payments"><CardSkeleton lines={3} /></div> : history.isError ? (
              <ErrorState message={serverMessage(history.error, "We could not load your payments.")} onRetry={history.refetch} />
            ) : !data || data.total === 0 ? (
              <EmptyState title={active ? "No payments match your filters" : "No payments yet"} action={active ? <button type="button" className="sd-btn sd-btn--primary" onClick={clear}>Clear filters</button> : undefined}>{active ? "Try a different filter." : "Your payments will appear here."}</EmptyState>
            ) : (
              <><PaymentsTable items={data.items} busyId={busyId} onReceipt={receipt} /><Pagination page={page} pageCount={pageCount} onPage={setPage} /></>
            )}
          </section>
        </div>
      </Container>
      <Toasts toasts={toasts} />
    </div>
  );
}