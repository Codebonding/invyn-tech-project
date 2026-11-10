import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import {
  useGetAttendanceFiltersQuery, useGetCourseSessionsQuery, useGetSessionRosterQuery, useListAttendanceQuery, useSaveAttendanceMutation,
} from "../services/attendanceApi";
import { ROUTES } from "../utils/constant";
import { serverMessage } from "../utils/profileValidation";
import { formatDate, formatTime } from "../utils/studentFormat";
import RosterTable from "../components/attendance/RosterTable";
import RecordsTable from "../components/attendance/RecordsTable";
import ConfirmDialog from "../components/student/profile/ConfirmDialog";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";
import "../styles/learning-materials.css";
import "../styles/attendance.css";

export default function MarkAttendancePage() {
  usePageSeo({ title: "Mark attendance | INVYN TECH", description: "Record student attendance.", path: ROUTES.staffAttendanceMark }, []);

  const [courseId, setCourseId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [values, setValues] = useState({});
  const [confirmCount, setConfirmCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [problems, setProblems] = useState([]);
  const { toasts, push } = useToasts();

  const filters = useGetAttendanceFiltersQuery();
  const sessions = useGetCourseSessionsQuery(courseId, { skip: !courseId });
  const roster = useGetSessionRosterQuery(sessionId, { skip: !sessionId });
  const history = useListAttendanceQuery({ courseId, limit: 10 }, { skip: !courseId });
  const [saveAttendance] = useSaveAttendanceMutation();

  const data = roster.data;
  // The server's view of each student: the baseline for "changed" and for Reset.
  const initial = useMemo(
    () => Object.fromEntries((data?.students || []).map((s) => [s.id, { status: s.attendance?.status || "", remarks: s.attendance?.remarks || "" }])),
    [data]
  );
  useEffect(() => { setValues(initial); setProblems([]); }, [initial]);

  const students = data?.students || [];
  const editable = (s) => data.canMark && (!s.attendance || data.canCorrect);
  const lockedIds = useMemo(() => new Set(students.filter((s) => data && !editable(s)).map((s) => s.id)), [students, data]); // eslint-disable-line react-hooks/exhaustive-deps
  const changed = students.filter((s) => {
    const v = values[s.id];
    const base = initial[s.id];
    return data && editable(s) && v?.status && (v.status !== base.status || v.remarks !== base.remarks);
  });

  const change = (id, patch) => setValues((v) => ({ ...v, [id]: { ...v[id], ...patch } }));
  const markAll = (status) => setValues((v) => ({ ...v, ...Object.fromEntries(students.filter(editable).map((s) => [s.id, { ...v[s.id], status }])) }));
  const reset = () => setValues(initial);

  const pickCourse = (id) => { setCourseId(id); setSessionId(""); setValues({}); };

  const doSave = async () => {
    setConfirmCount(0);
    setSaving(true);
    setProblems([]);
    try {
      const records = changed.map((s) => ({ studentId: s.id, status: values[s.id].status, remarks: values[s.id].remarks.trim() }));
      const res = await saveAttendance({ sessionId: Number(sessionId), records }).unwrap();
      push(`Attendance saved: ${res.data.created} new, ${res.data.updated} updated.`);
    } catch (e) {
      setProblems((e?.data?.errors || []).map((x) => x.message));
      push(serverMessage(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const submit = () => {
    if (saving) return;
    if (changed.length === 0) { push("There is nothing new to save.", "error"); return; }
    if (changed.some((s) => values[s.id].remarks.length > 255)) { push("Remarks must be 255 characters or fewer.", "error"); return; }
    const existing = changed.filter((s) => s.attendance).length;
    if (existing > 0) setConfirmCount(existing); else doSave();
  };

  const counts = students.reduce((acc, s) => { const st = values[s.id]?.status; if (st) acc[st] += 1; return acc; }, { present: 0, absent: 0, leave: 0 });

  return (
    <div className="inv-page">
      <Container>
        <div className="sp mc at">
          <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.staffAttendance}>← Attendance records</Link></nav>
          <header className="mc-header">
            <div><h1>Mark Attendance</h1><p className="sd-muted">Choose a course and a session, then record each student.</p></div>
          </header>

          <section className="sd-card at-pickers" aria-label="Choose course and session">
            <div className="sp-field">
              <label htmlFor="at-course">Course</label>
              <select id="at-course" className="sp-input" value={courseId} onChange={(e) => pickCourse(e.target.value)} disabled={filters.isLoading}>
                <option value="">Select a course</option>
                {(filters.data?.courses || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="sp-field">
              <label htmlFor="at-session">Session</label>
              <select id="at-session" className="sp-input" value={sessionId} disabled={!courseId || sessions.isLoading} onChange={(e) => setSessionId(e.target.value)}>
                <option value="">{courseId ? "Select a session" : "Choose a course first"}</option>
                {(sessions.data?.sessions || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.startsAt)} {formatTime(s.startsAt)} · {s.title}{s.status === "cancelled" ? " (cancelled)" : !s.canMark ? " (not started)" : ` (${s.marked}/${sessions.data.enrolledCount} marked)`}
                  </option>
                ))}
              </select>
            </div>
            <div className="sp-field">
              <label htmlFor="at-date">Attendance date</label>
              <input id="at-date" className="sp-input" readOnly value={data ? formatDate(data.session.attendanceDate) : ""} placeholder="Set by the session" />
            </div>
          </section>

          {filters.isError && <ErrorState message={serverMessage(filters.error, "We could not load your courses.")} onRetry={filters.refetch} />}
          {!filters.isLoading && !filters.isError && (filters.data?.courses || []).length === 0 && (
            <EmptyState title="No courses assigned to you">Attendance can be marked for courses you created or teach.</EmptyState>
          )}

          {sessionId && (
            <section className="sd-card sp-section" aria-label="Student attendance" aria-busy={roster.isFetching}>
              {roster.isLoading ? (
                <div role="status" aria-label="Loading students"><CardSkeleton lines={4} /></div>
              ) : roster.isError ? (
                <ErrorState message={serverMessage(roster.error, "We could not load this session.")} onRetry={roster.refetch} />
              ) : (
                <>
                  <div className="sp-section__head">
                    <h2>{data.session.title}</h2>
                    <p className="sd-muted">{data.session.courseTitle} · {formatDate(data.session.startsAt)}</p>
                  </div>
                  {data.reason && <p className="at-note" role="status">{data.reason}</p>}
                  {data.canMark && !data.canCorrect && <p className="at-note" role="status">Records older than {data.correctionWindowDays} days can only be corrected by an administrator.</p>}

                  {students.length === 0 ? (
                    <EmptyState title="No enrolled students">There are no actively enrolled students in this course.</EmptyState>
                  ) : (
                    <>
                      <div className="at-bulk" role="group" aria-label="Bulk actions">
                        <button type="button" className="sd-btn sd-btn--sm" disabled={!data.canMark} onClick={() => markAll("present")}>Mark All Present</button>
                        <button type="button" className="sd-btn sd-btn--sm" disabled={!data.canMark} onClick={() => markAll("absent")}>Mark All Absent</button>
                        <button type="button" className="sd-btn sd-btn--sm" onClick={reset}>Reset Selection</button>
                        <span className="sd-muted" aria-live="polite">{counts.present} present · {counts.absent} absent · {counts.leave} leave · {changed.length} to save</span>
                      </div>
                      <RosterTable students={students} values={values} lockedIds={lockedIds} onChange={change} />
                      {problems.length > 0 && <ul className="sp-error" role="alert">{problems.map((p) => <li key={p}>{p}</li>)}</ul>}
                      <div className="sp-actions">
                        <button type="button" className="sd-btn sd-btn--primary" disabled={saving || !data.canMark} onClick={submit}>{saving ? "Saving…" : "Save Attendance"}</button>
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          )}

          {courseId && (
            <section className="sd-card sp-section" aria-label="Previous attendance">
              <div className="sp-section__head"><h2>Previous attendance</h2></div>
              {history.isLoading ? <CardSkeleton lines={3} /> : history.isError ? (
                <ErrorState message={serverMessage(history.error, "We could not load the history.")} onRetry={history.refetch} />
              ) : history.data?.items.length ? (
                <RecordsTable items={history.data.items} isAdmin={false} />
              ) : (
                <EmptyState title="No attendance recorded yet">Saved attendance for this course appears here.</EmptyState>
              )}
            </section>
          )}
        </div>
      </Container>

      <ConfirmDialog
        open={confirmCount > 0}
        title="Update existing attendance?"
        message={`${confirmCount} student${confirmCount === 1 ? "" : "s"} already ha${confirmCount === 1 ? "s" : "ve"} attendance for this session. Saving will change ${confirmCount === 1 ? "that record" : "those records"}.`}
        confirmLabel="Update attendance"
        onConfirm={doSave}
        onCancel={() => setConfirmCount(0)}
      />
      <Toasts toasts={toasts} />
    </div>
  );
}