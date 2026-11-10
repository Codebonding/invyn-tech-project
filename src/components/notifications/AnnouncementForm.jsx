import { useRef, useState } from "react";
import FormField from "../student/profile/FormField";
import { serverFieldErrors, serverMessage } from "../../utils/profileValidation";
import { AUDIENCES, PRIORITIES, TYPES, buildPayload, toLocalInput, validateAnnouncement } from "../../utils/announcementFormat";

const blank = { title: "", description: "", announcementType: "general", targetAudience: "", courseId: "", priority: "normal", scheduledAt: "", expiresAt: "", actionUrl: "" };
const fromAnnouncement = (a) => ({ title: a.title, description: a.description, announcementType: a.announcementType, targetAudience: a.targetAudience, courseId: a.courseId ? String(a.courseId) : "", priority: a.priority, scheduledAt: toLocalInput(a.scheduledAt), expiresAt: toLocalInput(a.expiresAt), actionUrl: a.actionUrl || "" });

/** Plain text only. Employees can only choose "students of a course" and only their own courses (the server enforces both). */
export default function AnnouncementForm({ options, announcement = null, onSubmit, onCancel }) {
  const editing = Boolean(announcement);
  const published = announcement?.status === "published";
  const [v, setV] = useState(() => (announcement ? fromAnnouncement(announcement) : { ...blank, targetAudience: options.canTargetAll ? "" : "course_students" }));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const set = (k, val) => { setV((x) => ({ ...x, [k]: val, ...(k === "targetAudience" ? { courseId: "" } : {}) })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const submit = async (publishNow) => {
    if (busyRef.current) return;
    const found = validateAnnouncement(v, { editing, published });
    setErrors(found); setError("");
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`af-${first}`)?.focus(); return; }
    busyRef.current = true; setBusy(true);
    try {
      const payload = buildPayload(v, { editing });
      if (published) delete payload.scheduledAt; // the schedule is over once published
      if (publishNow) payload.scheduledAt = null; // publishing now ignores any schedule
      await onSubmit(payload, { publish: publishNow });
    } catch (err) { setErrors(serverFieldErrors(err)); setError(serverMessage(err)); }
    finally { busyRef.current = false; setBusy(false); }
  };

  const audiences = AUDIENCES.filter(([id]) => options.canTargetAll || id === "course_students");

  return (
    <form className="sd-card lm-form" noValidate onSubmit={(e) => { e.preventDefault(); submit(false); }} aria-label={editing ? "Edit announcement" : "New announcement"}>
      <h2>{editing ? "Edit announcement" : "New announcement"}</h2>
      {published && <p className="sd-muted">This announcement is published. The audience cannot change; edits are shown to every recipient.</p>}
      <div className="sp-grid sp-grid--form">
        <div className="lm-form__wide"><FormField id="af-title" label="Title" required maxLength={150} value={v.title} error={errors.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div className="lm-form__wide"><FormField id="af-description" label="Description" as="textarea" rows={5} required maxLength={5000} value={v.description} error={errors.description} hint="Plain text. Links and formatting are not interpreted." onChange={(e) => set("description", e.target.value)} /></div>
        <FormField id="af-announcementType" label="Announcement type" as="select" options={TYPES} value={v.announcementType} error={errors.announcementType} onChange={(e) => set("announcementType", e.target.value)} />
        <FormField id="af-priority" label="Priority" as="select" options={PRIORITIES} value={v.priority} error={errors.priority} onChange={(e) => set("priority", e.target.value)} />
        <FormField id="af-targetAudience" label="Audience" as="select" required disabled={editing} value={v.targetAudience} error={errors.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} options={[["", "Choose an audience"], ...audiences]} />
        {v.targetAudience === "course_students" && (
          <FormField id="af-courseId" label="Course" as="select" required disabled={editing} value={v.courseId} error={errors.courseId} onChange={(e) => set("courseId", e.target.value)} options={[["", "Select a course"], ...options.courses.map((c) => [String(c.id), c.title])]} />
        )}
        {!published && <FormField id="af-scheduledAt" label="Schedule for (optional)" type="datetime-local" value={v.scheduledAt} error={errors.scheduledAt} hint="Leave empty to save a draft or publish now." onChange={(e) => set("scheduledAt", e.target.value)} />}
        <FormField id="af-expiresAt" label="Expires (optional)" type="datetime-local" value={v.expiresAt} error={errors.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
        <div className="lm-form__wide"><FormField id="af-actionUrl" label="Action link (optional)" maxLength={500} value={v.actionUrl} error={errors.actionUrl} hint="An internal path like /student/courses/3, or an https:// link." onChange={(e) => set("actionUrl", e.target.value)} /></div>
      </div>
      {error && <p className="sp-error" role="alert">{error}</p>}
      <div className="sp-actions">
        {editing ? (
          <button type="button" className="sd-btn sd-btn--primary" disabled={busy} onClick={() => submit(false)}>{busy ? "Saving…" : "Save changes"}</button>
        ) : (
          <>
            <button type="button" className="sd-btn" disabled={busy} onClick={() => submit(false)}>{busy ? "Saving…" : v.scheduledAt ? "Schedule" : "Save draft"}</button>
            <button type="button" className="sd-btn sd-btn--primary" disabled={busy} onClick={() => submit(true)}>{busy ? "Publishing…" : "Publish now"}</button>
          </>
        )}
        <button type="button" className="sd-btn" disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}