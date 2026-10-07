import { Link } from "react-router-dom";
const isExternal = (to) => /^https?:\/\//.test(to);
export function FooterLink({ label, to }) {
  if (!to) {
    return (
      <span className="inv-flink is-soon" aria-disabled="true">
        {label}
        <span className="visually-hidden"> (coming soon)</span>
      </span>
    );
  }
  if (isExternal(to)) {
    return (
      <a className="inv-flink" href={to} target="_blank" rel="noopener noreferrer">
        {label}
        <span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    );
  }
  return <Link className="inv-flink" to={to}>{label}</Link>;
}

export default function FooterLinks({ links }) {
  return (
    <ul className="inv-flist">
      {links.map((l) => (
        <li key={l.label}>
          <FooterLink {...l} />
        </li>
      ))}
    </ul>
  );
}