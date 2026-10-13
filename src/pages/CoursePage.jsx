import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import GradientText from "../components/common/GradientText";
import Breadcrumbs from "../components/common/Breadcrumbs";
import CourseCard from "../components/courses/CourseCard";
import CourseFilters from "../components/courses/CourseFilters";
import useCourseFilters from "../hooks/useCourseFilters";
import usePageSeo from "../hooks/usePageSeo";
import useMediaQuery from "../hooks/useMediaQuery";
import useReducedMotion from "../hooks/useReducedMotion";
import { mq } from "../utils/responsive";
import { ROUTES } from "../utils/constant";
import { allCourses } from "../utils/courses";
import { buildOptions, filterCourses, sortCourses } from "../utils/courseFilters";
import "../styles/course-pages.css";

export default function CoursesPage() {
  usePageSeo({
    title: "Technology Courses | INVYN TECH",
    description: "Explore practical technology courses from INVYN TECH: AI, full stack, data science, cloud, cybersecurity, Python, Java and software development.",
    path: ROUTES.courses,
  });
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const belowTablet = useMediaQuery(mq.belowTablet);
  const tilt = reduced || belowTablet ? 0 : 1;

  const options = useMemo(() => buildOptions(allCourses), []);
  const { filters, set, clear, dirty } = useCourseFilters(options);
  const results = useMemo(() => sortCourses(filterCourses(allCourses, filters), filters.sort), [filters]);

  const openCourse = (course) => (e) => {
    if (e.target.closest("a, button")) return;
    navigate(course.href);
  };

  return (
    <div className="inv-page">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Courses" }]} />
        <header className="inv-pagehead">
          <p className="inv-eyebrow">COURSES</p>
          <h1 className="inv-section-title">Explore Our <GradientText>Technology Courses</GradientText></h1>
          <p className="inv-section-desc">Search by title, topic or technology, then compare duration and learning mode. Every course is built around practical, project-based learning.</p>
        </header>

        <CourseFilters filters={filters} set={set} clear={clear} dirty={dirty} options={options} shown={results.length} total={allCourses.length} />

        {results.length > 0 ? (
          <ul className="row g-4 inv-cgrid" aria-label="Courses">
            {results.map((c) => (
              <li key={c.slug} className="col-12 col-md-6 col-xl-4">
                <CourseCard course={c} tiltIntensity={tilt} onSurfaceClick={openCourse(c)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="inv-empty" role="status">
            <h2>No courses match your search</h2>
            <p>Try a different keyword or remove some filters.</p>
            <div className="inv-empty__actions">
              <button type="button" className="inv-btn inv-btn--primary" onClick={clear}>Clear all filters</button>
              <Link className="inv-btn inv-btn--outline" to={ROUTES.contact}>Ask INVYN TECH</Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}