import { useEffect, useRef, useState } from "react";
import FormField from "../student/profile/FormField";
import { serverFieldErrors, serverMessage } from "../../utils/profileValidation";
import { FILE_RULES, MATERIAL_TYPES, buildFormData, formatBytes, isFileType, isLinkType, validateMaterialForm } from "../../utils/materialValidation";

const empty = { courseId: "", moduleIndex: "", title: "", description: "", type: "pdf", url: "", content: "", allowDownload: true };
const fromMaterial = (m) => ({
  courseId: String(m.courseId), moduleIndex: m.moduleIndex === null || m.moduleIndex === undefined ? "" : String(m.moduleIndex),
  title: m.title, description: m.description || "", type: m.type, url: m.url || "", content: m.content || "", allowDownload: m.allowDownload,
});

/** Create or edit. Fields depend on the material type; course and type are fixed once a material exists. */
export default function MaterialForm({ courses, material = null, onSubmit, onCancel }) {
  const editing = Boolean(material);
  const [values, setValues] = useState(() => (material ? fromMaterial(material) : empty));
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const course = courses.find((c) => String(c.id) === String(values.courseId));

  useEffect(() => {
    if (!file || !file.type?.startsWith("image/")) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const change = (key, value) => {
    setValues((v) => ({ ...v, [key]: value, ...(key === "courseId" ? { moduleIndex: "" } : {}), ...(key === "type" ? { url: "", content: "" } : {}) }));
    if (key === "type") setFile(null);
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const pickFile = (event) => {
    const picked = event.target.files?.[0] || null;
    setFile(picked);
    setErrors((e) => ({ ...e, file: undefined }));
  };

  const submit = async (status) => {
    if (busyRef.current) return;
    const found = validateMaterialForm(values, { editing, file, hasExistingFile: material?.hasFile });
    setErrors(found);
    setFormError("");
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`mf-${first}`)?.focus(); return; }

    busyRef.current = true;
    setBusy(true);
    try {
      await onSubmit(buildFormData(values, file, { editing, status: editing ? undefined : status }));
    } catch (err) {
      setErrors(serverFieldErrors(err));
      setFormError(serverMessage(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const rule = FILE_RULES[values.type];

  return (
    <form className="sd-card lm-form" noValidate onSubmit={(e) => { e.preventDefault(); submit("draft"); }} aria-label={editing ? "Edit material" : "Upload material"}>
      <h2>{editing ? "Edit material" : "Upload material"}</h2>
      <div className="sp-grid sp-grid--form">
        <FormField id="mf-courseId" label="Course" as="select" required disabled={editing} value={values.courseId} error={errors.courseId} onChange={(e) => change("courseId", e.target.value)}
          options={[["", "Select a course"], ...courses.map((c) => [String(c.id), c.title])]} />
        <FormField id="mf-moduleIndex" label="Module (optional)" as="select" disabled={!course} value={values.moduleIndex} error={errors.moduleIndex} onChange={(e) => change("moduleIndex", e.target.value)}
          options={[["", "Not in a module"], ...(course?.modules || []).map((m) => [String(m.index), m.title])]} />
        <FormField id="mf-title" label="Title" required maxLength={150} value={values.title} error={errors.title} onChange={(e) => change("title", e.target.value)} />
        <FormField id="mf-type" label="Material type" as="select" required disabled={editing} value={values.type} error={errors.type} onChange={(e) => change("type", e.target.value)} options={MATERIAL_TYPES} />
        <div className="lm-form__wide">
          <FormField id="mf-description" label="Description" as="textarea" maxLength={500} value={values.description} error={errors.description} onChange={(e) => change("description", e.target.value)} />
        </div>

        {isFileType(values.type) && (
          <div className="lm-form__wide sp-field">
            <label htmlFor="mf-file">{editing ? "Replace file (optional)" : "File"}{!editing && <span aria-hidden="true"> *</span>}</label>
            <input id="mf-file" type="file" className="sp-input" accept={rule.accept} aria-invalid={errors.file ? "true" : undefined} aria-describedby="mf-file-hint" onChange={pickFile} />
            <p id="mf-file-hint" className="sd-muted">{rule.label}</p>
            {editing && material.hasFile && !file && <p className="sd-muted">Current file: {material.fileName} ({formatBytes(material.sizeBytes)})</p>}
            {file && (
              <div className="lm-preview">
                {preview ? <img src={preview} alt="Preview of the selected image" /> : null}
                <p className="sd-muted">{file.name} · {formatBytes(file.size)}</p>
              </div>
            )}
            {errors.file && <p className="sp-error" role="alert">{errors.file}</p>}
          </div>
        )}

        {isLinkType(values.type) && (
          <div className="lm-form__wide">
            <FormField id="mf-url" label={values.type === "video" ? "Video link" : "Link"} type="url" required value={values.url} error={errors.url} onChange={(e) => change("url", e.target.value)}
              hint={values.type === "video" ? "YouTube or Vimeo links get a safe preview; any other https link opens in a new tab." : "Only https:// links are accepted."} />
          </div>
        )}

        {values.type === "notes" && (
          <div className="lm-form__wide">
            <FormField id="mf-content" label="Notes" as="textarea" required rows={6} maxLength={20000} value={values.content} error={errors.content} onChange={(e) => change("content", e.target.value)} hint="Plain text only." />
          </div>
        )}

        {isFileType(values.type) && (
          <div className="sp-field sp-check">
            <label htmlFor="mf-allowDownload">
              <input id="mf-allowDownload" type="checkbox" checked={values.allowDownload} onChange={(e) => change("allowDownload", e.target.checked)} /> Allow students to download
            </label>
          </div>
        )}
      </div>

      {formError && <p className="sp-error" role="alert">{formError}</p>}
      <div className="sp-actions">
        {editing ? (
          <button type="button" className="sd-btn sd-btn--primary" disabled={busy} onClick={() => submit()}>{busy ? "Saving…" : "Save changes"}</button>
        ) : (
          <>
            <button type="button" className="sd-btn" disabled={busy} onClick={() => submit("draft")}>{busy ? "Uploading…" : "Save as draft"}</button>
            <button type="button" className="sd-btn sd-btn--primary" disabled={busy} onClick={() => submit("published")}>{busy ? "Uploading…" : "Publish"}</button>
          </>
        )}
        <button type="button" className="sd-btn" disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}