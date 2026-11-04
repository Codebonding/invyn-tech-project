import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constant";
import { assetUrl } from "../../utils/assetUrl";
import { formatDate, initials } from "../../utils/studentFormat";

export default function ProfileCard({ profile }) {
  return (
    <section className="sd-card sd-profile" aria-label="Student profile">
      {profile.avatarUrl ? (
        <img className="sd-avatar" src={assetUrl(profile.avatarUrl)} alt="" />
      ) : (
        <span className="sd-avatar" aria-hidden="true">{initials(profile.name)}</span>
      )}
      <div className="sd-profile__main">
        <h1 className="sd-profile__name">{profile.name}</h1>
        <p className="sd-muted">{profile.email}</p>
        <dl className="sd-profile__meta">
          <div><dt>Student ID</dt><dd>{profile.studentId}</dd></div>
          <div><dt>Status</dt><dd><span className={`sd-badge sd-badge--${profile.status === "active" ? "ok" : "warn"}`}>{profile.status}</span></dd></div>
          <div><dt>Joined</dt><dd>{formatDate(profile.joinedAt)}</dd></div>
        </dl>
      </div>
      <Link className="sd-btn sd-btn--outline" to={ROUTES.studentProfile}>Edit profile</Link>
    </section>
  );
}