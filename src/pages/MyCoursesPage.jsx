import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import { useGetMyCoursesQuery, useGetMyCoursesSummaryQuery } from "../services/studentApi";
import { ROUTES } from "../utils/constant";
import StatCard from "../components/student/StatCard";
import CourseFilters from "../components/student/courses/CourseFilters";
import MyCourseCard from "../components/student/courses/MyCourseCard";
import Pagination from "../components/student/courses/Pagination";
import { CardSkeleton, EmptyState, ErrorState } from "../components/student/StudentStates";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";
import "../styles/my-courses.css";

const PAGE_SIZE = 9;
const DEFAULTS = { status: "all", mode: "", category: "", sort: "enrolled_desc" };

export default function MyCoursesPage() {
  usePageSeo({ title: "My courses | INVYN TECH", description: "Manage and continue your learning journey.", path: ROUTES.studentCourses }, []);

  const [filters, setFilters] = useState(DEFAULTS);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce typing so the API is called once the student pauses.
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchText.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const params = {
    status: filters.status,
    sort: filters.sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    ...(search && { search }),
    ...(filters.mode && { mode: filters.mode }),
    ...(filters.category && { category: filters.category }),
  };

  const list = useGetMyCoursesQuery(params);
  const summary = useGetMyCoursesSummaryQuery();
  const data = list.data;

  const change = (partial) => { setFilters((f) => ({ ...f, ...partial })); setPage(1); };
  const clear = () => { setFilters(DEFAULTS); setSearchText(""); setSearch(""); setPage(1); };
  const filtered = Boolean(search || filters.mode || filters.category || filters.status !== "all");
  const stats = summary.data;
  const pageCount = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="inv-page">
      <Container>
        <div className="sp mc">
          <nav className="sp-back" aria-label="Breadcrumb"><Link to={ROUTES.studentDashboard}>← Back to dashboard</Link></nav>

          <header className="mc-header">
            <div>
              <h1>My Courses</h1>
              <p className="sd-muted">Manage and continue your learning journey.</p>
            </div>
            {stats && <p className="sd-badge">{stats.totalCourses} enrolled</p>}
          </header>

          <section className="sd-stats" aria-label="Learning summary">
            <StatCard label="Total enrolled" value={stats?.totalCourses ?? "–"} hint="Active and completed" />
            <StatCard label="Ongoing" value={stats?.ongoingCourses ?? "–"} hint="In progress" />
            <StatCard label="Completed" value={stats?.completedCourses ?? "–"} hint="Finished courses" />
            <StatCard label="Overall progress" value={stats?.overallProgress ?? 0} progress={stats?.overallProgress ?? 0} />
          </section>

          <CourseFilters value={{ ...filters }} searchText={searchText} onSearchText={setSearchText} onChange={change} onClear={clear} counts={data?.counts} options={data?.filters} />

          <section aria-label="Courses" aria-busy={list.isFetching} className={list.isFetching && data ? "mc-dim" : ""}>
            {list.isLoading ? (
              <div className="sd-courses" role="status" aria-label="Loading your courses">{[0, 1, 2].map((i) => <CardSkeleton key={i} lines={5} />)}</div>
            ) : list.isError ? (
              <ErrorState message={list.error?.data?.message || "We could not load your courses."} onRetry={list.refetch} />
            ) : data.total === 0 ? (
              filtered ? (
                <EmptyState title="No courses match your filters" action={<button type="button" className="sd-btn sd-btn--primary" onClick={clear}>Clear filters</button>}>
                  Try a different search or filter.
                </EmptyState>
              ) : (
                <EmptyState title="You have not enrolled in any course yet" action={<Link className="sd-btn sd-btn--primary" to={ROUTES.courses}>Browse courses</Link>}>
                  Courses you enrol in will appear here with your progress.
                </EmptyState>
              )
            ) : (
              <>
                <p className="sd-muted" aria-live="polite">Showing {data.items.length} of {data.total} course{data.total === 1 ? "" : "s"}</p>
                <div className="sd-courses">{data.items.map((c) => <MyCourseCard key={c.enrollmentId} course={c} />)}</div>
                <Pagination page={page} pageCount={pageCount} onPage={setPage} />
              </>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}