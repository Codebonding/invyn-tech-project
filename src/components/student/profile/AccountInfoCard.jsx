import { formatDate } from "../../../utils/studentFormat";

export default function AccountInfoCard({ profile }) {
  const rows = [
    ["Student ID", profile.studentId],
    ["Account created", formatDate(profile.createdAt)],
    ["Student since", formatDate(profile.joinedAt)],
    ["Account status", profile.status],
    ["Role", profile.role],
    ["Last updated", formatDate(profile.updatedAt)],
  ];
  return (
    <section id="account" className="sd-card sp-section" aria-labelledby="account-heading">
      <div className="sp-section__head"><h2 id="account-heading">Account information</h2></div>
      <dl className="sp-grid">
        {rows.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd className={label === "Account status" || label === "Role" ? "sp-cap" : ""}>{value}</dd></div>
        ))}
      </dl>
      <p className="sd-muted">Your role and account status are managed by INVYN TECH and cannot be changed here.</p>
    </section>
  );
}
