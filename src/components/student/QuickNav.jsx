import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constant";

/**
 * Only destinations that exist are links. Modules that have not been built yet are shown as disabled,
 * never as dead links.
 */
const ITEMS = [
  { label: "My Courses", to: ROUTES.studentCourses },
  { label: "Class Schedule", href: "#sessions" },
  { label: "Announcements", href: "#announcements" },
  { label: "Notifications", href: "#notifications" },
  { label: "My Profile", to: ROUTES.account },
  { label: "Learning Materials", soon: true },
  { label: "Assignments", soon: true },
  { label: "Assessments", soon: true },
];

export default function QuickNav() {
  return (
    <nav className="sd-quick" aria-label="Quick navigation">
      {ITEMS.map((i) =>
        i.soon ? (
          <span key={i.label} className="sd-quick__item is-disabled" aria-disabled="true">{i.label}<small>Coming soon</small></span>
        ) : i.to ? (
          <Link key={i.label} className="sd-quick__item" to={i.to}>{i.label}</Link>
        ) : (
          <a key={i.label} className="sd-quick__item" href={i.href}>{i.label}</a>
        )
      )}
    </nav>
  );
}