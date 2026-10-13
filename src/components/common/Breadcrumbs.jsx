import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="inv-crumbs">
      <ol>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.label}>
              {last || !it.to ? <span aria-current={last ? "page" : undefined}>{it.label}</span> : <Link to={it.to}>{it.label}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}