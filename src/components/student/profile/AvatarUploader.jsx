import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../../../utils/assetUrl";
import { initials } from "../../../utils/studentFormat";
import { serverMessage, validateAvatarFile } from "../../../utils/profileValidation";

/** Choose a file, see a preview, then upload. Validates type and size before anything is sent. */
export default function AvatarUploader({ name, avatarUrl, onUpload, onRemove }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = ""; // allows choosing the same file again after a failure
    if (!picked) return;
    const problem = validateAvatarFile(picked);
    setError(problem);
    setFile(problem ? null : picked);
  };

  const cancel = () => { setFile(null); setError(""); };

  const upload = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      await onUpload(file);
      setFile(null);
    } catch (err) {
      setError(serverMessage(err, "The upload failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onRemove();
    } catch (err) {
      setError(serverMessage(err, "Could not remove the picture."));
    } finally {
      setBusy(false);
    }
  };

  const shown = preview || (avatarUrl ? assetUrl(avatarUrl) : "");

  return (
    <div className="sp-avatar">
      {shown ? (
        <img className="sd-avatar sp-avatar__img" src={shown} alt={preview ? "Preview of the new profile picture" : `${name}'s profile picture`} />
      ) : (
        <span className="sd-avatar sp-avatar__img" aria-hidden="true">{initials(name)}</span>
      )}

      <input ref={inputRef} type="file" className="visually-hidden" accept="image/jpeg,image/png,image/webp" aria-label="Choose profile picture" tabIndex={-1} onChange={choose} />

      <div className="sp-avatar__actions">
        {file ? (
          <>
            <button type="button" className="sd-btn sd-btn--sm sd-btn--primary" onClick={upload} disabled={busy}>{busy ? "Uploading…" : "Upload photo"}</button>
            <button type="button" className="sd-btn sd-btn--sm" onClick={cancel} disabled={busy}>Cancel</button>
          </>
        ) : (
          <>
            <button type="button" className="sd-btn sd-btn--sm" onClick={() => inputRef.current?.click()} disabled={busy}>{avatarUrl ? "Change photo" : "Add photo"}</button>
            {avatarUrl && <button type="button" className="sd-btn sd-btn--sm" onClick={remove} disabled={busy}>{busy ? "Removing…" : "Remove"}</button>}
          </>
        )}
      </div>
      <p className="sd-muted">JPG, PNG or WebP, up to 2 MB.</p>
      {error && <p className="sp-error" role="alert">{error}</p>}
    </div>
  );
}