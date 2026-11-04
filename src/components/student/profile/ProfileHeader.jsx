import AvatarUploader from "./AvatarUploader";

export default function ProfileHeader({ profile, onEditProfile, onUploadAvatar, onRemoveAvatar }) {
  return (
    <header className="sd-card sp-header">
      <AvatarUploader name={profile.name} avatarUrl={profile.avatarUrl} onUpload={onUploadAvatar} onRemove={onRemoveAvatar} />
      <div className="sp-header__main">
        <h1 className="sd-profile__name">{profile.name}</h1>
        <p className="sd-muted">Student ID: <strong>{profile.studentId}</strong></p>
        <p>
          <span className={`sd-badge sd-badge--${profile.status === "active" ? "ok" : "warn"}`}>{profile.status}</span>
        </p>
      </div>
      <button type="button" className="sd-btn sd-btn--primary" onClick={onEditProfile}>Edit profile</button>
    </header>
  );
}