import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import useAuth from "../hooks/useAuth";
import {
  useDeleteAttendanceMutation, useGetAttendanceFiltersQuery, useGetAttendanceReportQuery, useListAttendanceQuery, useUpdateAttendanceMutation,
} from "../services/attendanceApi";
import { GROUP_OPTIONS, STATUS_OPTIONS, cleanParams, dateRangeError, formatPercent } from "../utils/attendanceFormat";
import { ROUTES } from "../utils/constant";
import { openPrivateFile } from "../utils/materialFile";
import { serverMessage } from "../utils/profileValidation";
import AttendanceStats from "../components/attendance/AttendanceStats";
import EditAttendanceDialog from "../components/attendance/EditAttendanceDialog";
import RecordsTable from "../components/attendance/RecordsTable";
import Pagination from "../components/student/courses/Pagination";
import ConfirmDialog from "../components/student/profile/ConfirmDialog";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";
import "../styles/attendance.css";

const PAGE_SIZE = 10;
const DEFAULTS = { courseId: "", employeeId: "", status: "", from: "", to: "", sort: "date_desc" };

export default function StaffAttendancePage() {
  usePageSeo({ title: "Attendance | INVYN TECH", description: "Attendance records and reports.", path: ROUTES.staffAttendance }, []);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [filters, setFilters] = useState(DEFAULTS);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [groupBy, setGroupBy] = useState("course");
  const [reportOn, setReportOn] = useState(false);
  const [reportPage, setReportPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { toasts, push } = useToasts();

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchText.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const rangeError = dateRangeError(filters.from, filters.to);
  const base = cleanParams({ ...filters, search });
  const list = useListAttendanceQuery({ ...base, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }, { skip: Boolean(rangeError) });
  const options = useGetAttendanceFiltersQuery();
  const reportParams = cleanParams({ groupBy, courseId: filters.courseId, employeeId: filters.employeeId, status: filters.status, from: filters.from, to: filters.to, search, limit: PAGE_SIZE, offset: (reportPage - 1) * PAGE_SIZE });
  const report = useGetAttendanceReportQuery(reportParams, { skip: !reportOn || Boolean(rangeError) });
  const [updateAttendance] = useUpdateAttendanceMutation();
  const [deleteAttendance] = useDeleteAttendanceMutation();

  const data = list.data;
  const change = (partial) => { setFilters((f) => ({ ...f, ...partial })); setPage(1); setReportPage(1); };
  const clear = () => { setFilters(DEFAULTS); setSearchText(""); setSearch(""); setPage(1); setReportPage(1); };
  const active = Boolean(search || filters.courseId || filters.employeeId || filters.status || filters.from || filters.to);
  const pageCount = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const save = async (changes) => {
    await updateAttendance({ id: editing.id, ...changes }).unwrap();
    push("Attendance corrected.");
    setEditing(null);
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try { await deleteAttendance(deleting.id).unwrap(); push("Attendance record deleted."); }
    catch (e) { push(serverMessage(e), "error"); }
    finally { setDeleteBusy(false); setDeleting(null); }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await openPrivateFile("/attendance/reports/export", { download: true, fileName: `attendance-report-${groupBy}.csv`, params: { ...reportParams, limit: undefined, offset: undefined } });
    } catch { push("The report could not be exported.", "error"); }
    finally { setExporting(false); }
  };

  const reportPages = report.data ? Math.max(1, Math.ceil(report.data.total / PAGE_SIZE)) : 1;

  return (
    <div className="inv-page">
      <Container>
        <div className="sp mc at">
          <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.account}>← Back to account</Link></nav>
          <header className="mc-header">
            <div>
              <h1>Attendance</h1>
              <p className="sd-muted">{isAdmin ? "Attendance across all courses." : "Attendance for the courses assigned to you."}</p>
            </div>
            <Link className="sd-btn sd-btn--primary" to={ROUTES.staffAttendanceMark}>Mark attendance</Link>
          </header>

          <AttendanceStats stats={data?.stats} />

          <div className="at-filters" role="search" aria-label="Attendance filters">
            <div className="sp-field at-filters__wide">
              <label htmlFor="af-search">Search students</label>
              <input id="af-search" type="search" className="sp-input" placeholder="Name or email" maxLength={100} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>
            <div className="sp-field">
              <label htmlFor="af-course">Course</label>
              <select id="af-course" className="sp-input" value={filters.courseId} onChange={(e) => change({ courseId: e.target.value })}>
                <option value="">All courses</option>
                {(options.data?.courses || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            {isAdmin && (
              <div className="sp-field">
                <label htmlFor="af-employee">Employee</label>
                <select id="af-employee" className="sp-input" value={filters.employeeId} onChange={(e) => change({ employeeId: e.target.value })}>
                  <option value="">All employees</option>
                  {(options.data?.employees || []).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}
            <div className="sp-field">
              <label htmlFor="af-status">Status</label>
              <select id="af-status" className="sp-input" value={filters.status} onChange={(e) => change({ status: e.target.value })}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
            <div className="sp-field">
              <label htmlFor="af-from">From</label>
              <input id="af-from" type="date" className="sp-input" value={filters.from} aria-invalid={rangeError ? "true" : undefined} onChange={(e) => change({ from: e.target.value })} />
            </div>
            <div className="sp-field">
              <label htmlFor="af-to">To</label>
              <input id="af-to" type="date" className="sp-input" value={filters.to} aria-invalid={rangeError ? "true" : undefined} onChange={(e) => change({ to: e.target.value })} />
            </div>
            {active && <button type="button" className="sd-btn sd-btn--sm lm-clear" onClick={clear}>Clear filters</button>}
          </div>
          {rangeError && <p className="sp-error" role="alert">{rangeError}</p>}

          <section aria-label="Attendance records" aria-busy={list.isFetching} className={list.isFetching && data ? "mc-dim" : ""}>
            {list.isLoading ? (
              <div role="status" aria-label="Loading attendance" className="sd-stack">{[0, 1, 2].map((i) => <CardSkeleton key={i} lines={2} />)}</div>
            ) : list.isError ? (
              <ErrorState message={serverMessage(list.error, "We could not load attendance.")} onRetry={list.refetch} />
            ) : !data || data.total === 0 ? (
              active ? (
                <EmptyState title="No records match your filters" action={<button type="button" className="sd-btn sd-btn--primary" onClick={clear}>Clear filters</button>}>Try a different course, status or date range.</EmptyState>
              ) : (
                <EmptyState title="No attendance recorded yet">Mark attendance for a session to see it here.</EmptyState>
              )
            ) : (
              <>
                <RecordsTable items={data.items} isAdmin={isAdmin} onEdit={setEditing} onDelete={setDeleting} />
                <Pagination page={page} pageCount={pageCount} onPage={setPage} />
              </>
            )}
          </section>

          <section className="sd-card sp-section" aria-label="Reports">
            <div className="sp-section__head"><h2>Reports</h2></div>
            <div className="at-report-controls">
              <div className="sp-field">
                <label htmlFor="ar-group">Report type</label>
                <select id="ar-group" className="sp-input" value={groupBy} onChange={(e) => { setGroupBy(e.target.value); setReportPage(1); }}>
                  {GROUP_OPTIONS.filter(([id]) => isAdmin || id !== "employee").map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </div>
              <button type="button" className="sd-btn sd-btn--primary" disabled={Boolean(rangeError)} onClick={() => { setReportOn(true); setReportPage(1); }}>Generate report</button>
              <button type="button" className="sd-btn" disabled={!reportOn || exporting || Boolean(rangeError)} onClick={exportCsv}>{exporting ? "Exporting…" : "Export CSV"}</button>
            </div>
            <p className="sd-muted">Reports use the filters above.</p>

            {reportOn && (report.isLoading ? <CardSkeleton lines={3} /> : report.isError ? (
              <ErrorState message={serverMessage(report.error, "We could not build the report.")} onRetry={report.refetch} />
            ) : report.data.items.length === 0 ? (
              <EmptyState title="No data for this report">Nothing matches the current filters.</EmptyState>
            ) : (
              <>
                <div className="lm-table-wrap">
                  <table className="lm-table">
                    <caption className="visually-hidden">Attendance report</caption>
                    <thead>
                      <tr><th scope="col">{GROUP_OPTIONS.find(([id]) => id === groupBy)[1].replace("-wise", "")}</th><th scope="col">Present</th><th scope="col">Absent</th><th scope="col">Leave</th><th scope="col">Records</th><th scope="col">Attendance</th></tr>
                    </thead>
                    <tbody>
                      {report.data.items.map((r) => (
                        <tr key={r.key}>
                          <td data-label="Name"><strong>{r.label}</strong>{r.detail && <span className="sd-muted"> {r.detail}</span>}</td>
                          <td data-label="Present">{r.present}</td><td data-label="Absent">{r.absent}</td><td data-label="Leave">{r.leave}</td>
                          <td data-label="Records">{r.total}</td><td data-label="Attendance">{formatPercent(r.percentage)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr><th scope="row">Total</th><td>{report.data.totals.present}</td><td>{report.data.totals.absent}</td><td>{report.data.totals.leave}</td><td>{report.data.totals.total}</td><td>{formatPercent(report.data.totals.percentage)}</td></tr>
                    </tfoot>
                  </table>
                </div>
                <Pagination page={reportPage} pageCount={reportPages} onPage={setReportPage} />
              </>
            ))}
          </section>
        </div>
      </Container>

      {editing && <EditAttendanceDialog record={editing} onSave={save} onCancel={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(deleting)} title="Delete this attendance record?" message={deleting ? `${deleting.student?.name}'s attendance on ${deleting.attendanceDate} will be permanently removed.` : ""} busy={deleteBusy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
      <Toasts toasts={toasts} />
    </div>
  );
}