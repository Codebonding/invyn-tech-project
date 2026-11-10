import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { useGetStudentAttendanceQuery, useGetStudentAttendanceSummaryQuery } from "../../src/services/attendanceApi";
import { STATUS_OPTIONS, cleanParams, dateRangeError, formatPercent } from "../utils/attendanceFormat";
import { ROUTES } from "../utils/constant";
import { serverMessage } from "../utils/profileValidation";
import { formatDate, formatTime } from "../utils/studentFormat";
import StatCard from "../components/student/StatCard";
import AttendanceStatusBadge from "../components/attendance/AttendanceStatusBadge";
import CourseAttendanceCard from "../components/attendance/CourseAttendanceCard";
import Pagination from "../components/student/courses/Pagination";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";
import "../styles/attendance.css";

const PAGE_SIZE = 10;
const DEFAULTS = { courseId: "", status: "", from: "", to: "" };

export default function StudentAttendancePage() {
  usePageSeo({ title: "My attendance | INVYN TECH", description: "Your attendance history.", path: ROUTES.studentAttendance }, []);

  const [filters, setFilters] = useState(DEFAULTS);
  const [page, setPage] = useState(1);
  const rangeError = dateRangeError(filters.from, filters.to);

  const summary = useGetStudentAttendanceSummaryQuery();
  const history = useGetStudentAttendanceQuery({ ...cleanParams(filters), limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }, { skip: Boolean(rangeError) });

  const change = (partial) => { setFilters((f) => ({ ...f, ...partial })); setPage(1); };
  const clear = () => { setFilters(DEFAULTS); setPage(1); };
  const active = Boolean(filters.courseId || filters.status || filters.from || filters.to);
  const overall = summary.data?.overall;
  const data = history.data;
  const pageCount = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="inv-page">
      <Container>
        <div className="sp mc at">
          <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.studentDashboard}>← Back to dashboard</Link></nav>
          <header className="mc-header">
            <div><h1>My Attendance</h1><p className="sd-muted">Your attendance across all your courses.</p></div>
          </header>

          {summary.isLoading ? (
            <div role="status" aria-label="Loading attendance summary" className="sd-stats">{[0, 1, 2, 3, 4].map((i) => <CardSkeleton key={i} lines={1} />)}</div>
          ) : summary.isError ? (
            <ErrorState message={serverMessage(summary.error, "We could not load your attendance.")} onRetry={summary.refetch} />
          ) : (
            <>
              <section className="sd-stats" aria-label="Overall attendance">
                <StatCard label="Overall attendance" value={overall.percentage} progress={overall.percentage} />
                <StatCard label="Total sessions" value={overall.totalSessions} hint={`${overall.unmarked} not marked yet`} />
                <StatCard label="Present" value={overall.present} hint="Sessions attended" />
                <StatCard label="Absent" value={overall.absent} hint="Sessions missed" />
                <StatCard label="Leave" value={overall.leave} hint="Excused (not counted)" />
              </section>
              <p className="sd-muted at-policy">Attendance % = present ÷ (present + absent). Leave is excused and sessions not yet marked are not counted against you.</p>

              <h2 className="at-h2">By course</h2>
              {summary.data.courses.length === 0 ? (
                <EmptyState title="You are not enrolled in any course yet">Your attendance will appear once you join a course.</EmptyState>
              ) : (
                <div className="sd-courses">{summary.data.courses.map((c) => <CourseAttendanceCard key={c.courseId} course={c} />)}</div>
              )}
            </>
          )}

          <h2 className="at-h2">Attendance history</h2>
          <div className="at-filters" role="search" aria-label="History filters">
            <div className="sp-field">
              <label htmlFor="sa-course">Course</label>
              <select id="sa-course" className="sp-input" value={filters.courseId} onChange={(e) => change({ courseId: e.target.value })}>
                <option value="">All courses</option>
                {(summary.data?.courses || []).map((c) => <option key={c.courseId} value={c.courseId}>{c.title}</option>)}
              </select>
            </div>
            <div className="sp-field">
              <label htmlFor="sa-status">Status</label>
              <select id="sa-status" className="sp-input" value={filters.status} onChange={(e) => change({ status: e.target.value })}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
            <div className="sp-field">
              <label htmlFor="sa-from">From</label>
              <input id="sa-from" type="date" className="sp-input" value={filters.from} aria-invalid={rangeError ? "true" : undefined} onChange={(e) => change({ from: e.target.value })} />
            </div>
            <div className="sp-field">
              <label htmlFor="sa-to">To</label>
              <input id="sa-to" type="date" className="sp-input" value={filters.to} aria-invalid={rangeError ? "true" : undefined} onChange={(e) => change({ to: e.target.value })} />
            </div>
            {active && <button type="button" className="sd-btn sd-btn--sm lm-clear" onClick={clear}>Clear filters</button>}
          </div>
          {rangeError && <p className="sp-error" role="alert">{rangeError}</p>}

          <section aria-label="Attendance history" aria-busy={history.isFetching} className={history.isFetching && data ? "mc-dim" : ""}>
            {history.isLoading ? (
              <div role="status" aria-label="Loading history"><CardSkeleton lines={3} /></div>
            ) : history.isError ? (
              <ErrorState message={serverMessage(history.error, "We could not load your history.")} onRetry={history.refetch} />
            ) : !data || data.total === 0 ? (
              <EmptyState title={active ? "No records match your filters" : "No attendance recorded yet"} action={active ? <button type="button" className="sd-btn sd-btn--primary" onClick={clear}>Clear filters</button> : undefined}>
                {active ? "Try a different course, status or date range." : "Your attendance will appear here after your sessions."}
              </EmptyState>
            ) : (
              <>
                <p className="sd-muted" aria-live="polite">{data.total} record{data.total === 1 ? "" : "s"} · {data.filtered.present} present · {data.filtered.absent} absent · {data.filtered.leave} leave{data.total > 0 ? ` · ${formatPercent(data.filtered.present + data.filtered.absent ? Math.round((data.filtered.present / (data.filtered.present + data.filtered.absent)) * 1000) / 10 : 0)}` : ""}</p>
                <div className="lm-table-wrap">
                  <table className="lm-table">
                    <caption className="visually-hidden">Attendance history</caption>
                    <thead><tr><th scope="col">Date</th><th scope="col">Course</th><th scope="col">Session</th><th scope="col">Time</th><th scope="col">Status</th><th scope="col">Remarks</th></tr></thead>
                    <tbody>
                      {data.items.map((r) => (
                        <tr key={r.id}>
                          <td data-label="Date">{formatDate(r.attendanceDate)}</td>
                          <td data-label="Course">{r.courseTitle}</td>
                          <td data-label="Session">{r.session.title}</td>
                          <td data-label="Time">{formatTime(r.session.startsAt)} – {formatTime(r.session.endsAt)}</td>
                          <td data-label="Status"><AttendanceStatusBadge status={r.status} /></td>
                          <td data-label="Remarks">{r.remarks || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageCount={pageCount} onPage={setPage} />
              </>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}