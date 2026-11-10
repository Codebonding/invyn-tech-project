import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { useGetAdminFeeReportQuery, useGetAdminFeesQuery, useGetAdminPaymentsQuery, useRecordManualPaymentMutation, useRefundPaymentMutation } from "../services/feesApi";
import { FEE_STATUSES, GROUPS, PAYMENT_STATUSES, cleanParams, dateRangeError, formatMinor } from "../utils/feeFormat";
import { ROUTES } from "../utils/constant";
import { openPrivateFile } from "../utils/materialFile";
import { serverMessage } from "../utils/profileValidation";
import { formatDate } from "../utils/studentFormat";
import StatCard from "../components/student/StatCard";
import Pagination from "../components/student/courses/Pagination";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import PaymentsTable from "../components/fees/PaymentsTable";
import { ManualPaymentDialog, RefundDialog } from "../components/fees/MoneyDialogs";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";
import "../styles/fees.css";

const PAGE_SIZE = 10;
const DEFAULTS = { courseId: "", status: "", from: "", to: "" };
const TABS = [["records", "Fee records"], ["transactions", "Transactions"], ["reports", "Reports"]];

export default function AdminFeesPage() {
  usePageSeo({ title: "Fee management | INVYN TECH", description: "Fees, payments and reports.", path: ROUTES.staffFees }, []);
  const navigate = useNavigate();
  const [tab, setTab] = useState("records");
  const [filters, setFilters] = useState(DEFAULTS);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [groupBy, setGroupBy] = useState("course");
  const [recording, setRecording] = useState(null);
  const [refunding, setRefunding] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { toasts, push } = useToasts();

  useEffect(() => { const t = setTimeout(() => { setSearch(searchText.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [searchText]);

  const rangeError = dateRangeError(filters.from, filters.to);
  const base = cleanParams({ ...filters, search });
  const paged = { ...base, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE };
  const skip = Boolean(rangeError);
  const fees = useGetAdminFeesQuery(paged, { skip: skip || tab !== "records" });
  const stats = useGetAdminFeesQuery({ ...base, limit: 1 }, { skip });
  const payments = useGetAdminPaymentsQuery(paged, { skip: skip || tab !== "transactions" });
  const report = useGetAdminFeeReportQuery({ ...base, groupBy, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }, { skip: skip || tab !== "reports" });
  const [recordManual] = useRecordManualPaymentMutation();
  const [refundPayment] = useRefundPaymentMutation();

  const s = stats.data?.stats;
  const courses = stats.data?.courses || [];
  const change = (p) => { setFilters((f) => ({ ...f, ...p })); setPage(1); };
  const clear = () => { setFilters(DEFAULTS); setSearchText(""); setSearch(""); setPage(1); };
  const active = Boolean(search || filters.courseId || filters.status || filters.from || filters.to);
  const current = tab === "records" ? fees : tab === "transactions" ? payments : report;
  const total = current.data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const submitManual = async (body) => { await recordManual(body).unwrap(); push("Payment recorded."); setRecording(null); };
  const submitRefund = async ({ id, ...body }) => { await refundPayment({ id, ...body }).unwrap(); push("Refund recorded."); setRefunding(null); };
  const receipt = async (p) => {
    setBusyId(p.id);
    try { await openPrivateFile(`/admin/payments/${p.id}/receipt`, { download: true, fileName: `receipt-${p.receiptNumber}.pdf` }); }
    catch { push("The receipt could not be downloaded.", "error"); }
    finally { setBusyId(null); }
  };
  const exportCsv = async () => {
    setExporting(true);
    try { await openPrivateFile("/admin/fees/reports/export", { download: true, fileName: `fee-report-${groupBy}.csv`, params: { ...base, groupBy } }); }
    catch { push("The report could not be exported.", "error"); }
    finally { setExporting(false); }
  };

  const state = (q, emptyTitle) => (q.isLoading ? <div role="status" aria-label="Loading fee data" className="sd-stack">{[0, 1, 2].map((i) => <CardSkeleton key={i} lines={2} />)}</div>
    : q.isError ? <ErrorState message={serverMessage(q.error, "We could not load this.")} onRetry={q.refetch} />
    : q.data.total === 0 ? (active ? <EmptyState title="Nothing matches your filters" action={<button type="button" className="sd-btn sd-btn--primary" onClick={clear}>Clear filters</button>}>Try a different filter.</EmptyState> : <EmptyState title={emptyTitle}>Records appear here as students are enrolled and pay.</EmptyState>) : null);

  return (
    <div className="inv-page">
      <Container>
        <div className="sp mc fe">
          <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.account}>← Back to account</Link></nav>
          <header className="mc-header">
            <div><h1>Fee Management</h1><p className="sd-muted">Fees, payments, receipts and reports across all courses.</p></div>
            <Link className="sd-btn sd-btn--primary" to={ROUTES.staffFeeStructures}>Fee structures</Link>
          </header>

          <section className="sd-stats" aria-label="Financial summary">
            <StatCard label="Total fees payable" value={s ? formatMinor(s.totalPayableMinor) : "–"} hint="Excludes cancelled" />
            <StatCard label="Total collected" value={s ? formatMinor(s.collectedMinor) : "–"} hint="Verified, net of refunds" />
            <StatCard label="Outstanding balance" value={s ? formatMinor(s.outstandingMinor) : "–"} hint="Still to collect" />
            <StatCard label="Overdue" value={s ? formatMinor(s.overdueMinor) : "–"} hint="Past the due date" />
            <StatCard label="Successful transactions" value={s?.successfulTransactions ?? "–"} hint="Verified payments" />
            <StatCard label="Pending transactions" value={s?.pendingTransactions ?? "–"} hint="Not counted as paid" />
            <StatCard label="Failed transactions" value={s?.failedTransactions ?? "–"} hint="Did not complete" />
            <StatCard label="Refunds" value={s?.refundTransactions ?? "–"} hint="Completed refunds" />
          </section>

          <div className="sd-filters" role="tablist" aria-label="Fee views">
            {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={`sd-chip ${tab === id ? "is-active" : ""}`} onClick={() => { setTab(id); setPage(1); }}>{label}</button>)}
          </div>

          <div className="at-filters" role="search" aria-label="Fee filters">
            <div className="sp-field at-filters__wide"><label htmlFor="ff-search">Search students</label><input id="ff-search" type="search" className="sp-input" placeholder="Name or email" maxLength={100} value={searchText} onChange={(e) => setSearchText(e.target.value)} /></div>
            <div className="sp-field"><label htmlFor="ff-course">Course</label>
              <select id="ff-course" className="sp-input" value={filters.courseId} onChange={(e) => change({ courseId: e.target.value })}><option value="">All courses</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
            <div className="sp-field"><label htmlFor="ff-status">{tab === "transactions" ? "Transaction status" : "Payment status"}</label>
              <select id="ff-status" className="sp-input" value={filters.status} onChange={(e) => change({ status: e.target.value })}><option value="">All statuses</option>{(tab === "transactions" ? PAYMENT_STATUSES : FEE_STATUSES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
            <div className="sp-field"><label htmlFor="ff-from">From</label><input id="ff-from" type="date" className="sp-input" value={filters.from} onChange={(e) => change({ from: e.target.value })} /></div>
            <div className="sp-field"><label htmlFor="ff-to">To</label><input id="ff-to" type="date" className="sp-input" value={filters.to} onChange={(e) => change({ to: e.target.value })} /></div>
            {active && <button type="button" className="sd-btn sd-btn--sm lm-clear" onClick={clear}>Clear filters</button>}
          </div>
          {rangeError && <p className="sp-error" role="alert">{rangeError}</p>}

          {tab === "records" && (state(fees, "No fee records yet") || (
            <section aria-label="Fee records" aria-busy={fees.isFetching}>
              <div className="lm-table-wrap"><table className="lm-table">
                <caption className="visually-hidden">Fee records</caption>
                <thead><tr><th scope="col">Student</th><th scope="col">Course</th><th scope="col">Total</th><th scope="col">Paid</th><th scope="col">Pending</th><th scope="col">Due</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
                <tbody>{fees.data.items.map((f) => (
                  <tr key={f.id}>
                    <td data-label="Student"><strong>{f.student.name}</strong><span className="sd-muted"> {f.student.studentId}</span></td>
                    <td data-label="Course">{f.courseTitle}</td><td data-label="Total">{formatMinor(f.totalPayableMinor, f.currency)}</td>
                    <td data-label="Paid">{formatMinor(f.paidMinor, f.currency)}</td><td data-label="Pending">{formatMinor(f.outstandingMinor, f.currency)}</td>
                    <td data-label="Due">{f.dueDate ? formatDate(f.dueDate) : "—"}</td><td data-label="Status"><FeeStatusBadge status={f.status} /></td>
                    <td data-label="Actions"><div className="lm-actions">
                      <button type="button" className="sd-btn sd-btn--sm" onClick={() => navigate(ROUTES.staffFeeDetail(f.id))} aria-label={`Details for ${f.student.name}, ${f.courseTitle}`}>Details</button>
                      {f.outstandingMinor > 0 && f.status !== "cancelled" && <button type="button" className="sd-btn sd-btn--sm sd-btn--primary" onClick={() => setRecording(f)} aria-label={`Record payment for ${f.student.name}`}>Record payment</button>}
                    </div></td>
                  </tr>))}</tbody>
              </table></div>
              <Pagination page={page} pageCount={pageCount} onPage={setPage} />
            </section>))}

          {tab === "transactions" && (state(payments, "No transactions yet") || (
            <section aria-label="Transactions" aria-busy={payments.isFetching}>
              <PaymentsTable items={payments.data.items} admin busyId={busyId} onReceipt={receipt} onRefund={setRefunding} onView={(p) => navigate(ROUTES.staffFeeDetail(p.studentFeeId))} />
              <Pagination page={page} pageCount={pageCount} onPage={setPage} />
            </section>))}

          {tab === "reports" && (
            <section className="sd-card sp-section" aria-label="Reports">
              <div className="at-report-controls">
                <div className="sp-field"><label htmlFor="fr-group">Report type</label>
                  <select id="fr-group" className="sp-input" value={groupBy} onChange={(e) => { setGroupBy(e.target.value); setPage(1); }}>{GROUPS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
                <button type="button" className="sd-btn" disabled={exporting || skip} onClick={exportCsv}>{exporting ? "Exporting…" : "Export CSV"}</button>
              </div>
              {state(report, "No data for this report") || (
                <>
                  <div className="lm-table-wrap"><table className="lm-table">
                    <caption className="visually-hidden">Fee report</caption>
                    <thead>{groupBy === "date"
                      ? <tr><th scope="col">Date</th><th scope="col">Collected</th><th scope="col">Refunded</th><th scope="col">Net</th><th scope="col">Transactions</th></tr>
                      : <tr><th scope="col">{GROUPS.find(([id]) => id === groupBy)[1].replace("By ", "")}</th><th scope="col">Records</th><th scope="col">Payable</th><th scope="col">Collected</th><th scope="col">Outstanding</th><th scope="col">Overdue</th></tr>}</thead>
                    <tbody>{report.data.items.map((r) => groupBy === "date"
                      ? <tr key={r.key}><td data-label="Date">{r.label}</td><td data-label="Collected">{formatMinor(r.collectedMinor)}</td><td data-label="Refunded">{formatMinor(r.refundedMinor)}</td><td data-label="Net">{formatMinor(r.netMinor)}</td><td data-label="Transactions">{r.transactions}</td></tr>
                      : <tr key={r.key}><td data-label="Name"><strong>{r.label}</strong></td><td data-label="Records">{r.records}</td><td data-label="Payable">{formatMinor(r.payableMinor)}</td><td data-label="Collected">{formatMinor(r.collectedMinor)}</td><td data-label="Outstanding">{formatMinor(r.outstandingMinor)}</td><td data-label="Overdue">{formatMinor(r.overdueMinor)}</td></tr>)}</tbody>
                  </table></div>
                  <Pagination page={page} pageCount={pageCount} onPage={setPage} />
                </>)}
            </section>)}
        </div>
      </Container>
      {recording && <ManualPaymentDialog fee={recording} onSubmit={submitManual} onCancel={() => setRecording(null)} />}
      {refunding && <RefundDialog payment={refunding} onSubmit={submitRefund} onCancel={() => setRefunding(null)} />}
      <Toasts toasts={toasts} />
    </div>
  );
}