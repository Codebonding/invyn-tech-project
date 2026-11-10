import StatCard from "../student/StatCard";
import { formatPercent } from "../../utils/attendanceFormat";

/** stats: { total, present, absent, leave, percentage } */
export default function AttendanceStats({ stats }) {
  return (
    <section className="sd-stats" aria-label="Attendance summary">
      <StatCard label="Total records" value={stats?.total ?? "–"} hint="In the current filters" />
      <StatCard label="Present" value={stats?.present ?? "–"} hint="Attended" />
      <StatCard label="Absent" value={stats?.absent ?? "–"} hint="Did not attend" />
      <StatCard label="Leave" value={stats?.leave ?? "–"} hint="Excused" />
      <StatCard label="Attendance" value={stats ? Number(stats.percentage) : 0} progress={stats ? Number(stats.percentage) : 0} />
      {stats && <p className="sr-only visually-hidden">Attendance {formatPercent(stats.percentage)}</p>}
    </section>
  );
}