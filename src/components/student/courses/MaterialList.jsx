import { useMemo, useState } from "react";
import { openPrivateFile } from "../../../utils/materialFile";
import { formatDate } from "../../../utils/studentFormat";
import { formatBytes } from "../../../utils/materialValidation";
import { EmptyState } from "../StudentStates";

const TYPE_LABEL = { pdf: "PDF", document: "Document", image: "Image", notes: "Notes", video: "Video", link: "Link" };

export default function MaterialList({ data, onError }) {
  const [busy, setBusy] = useState(null);
  const [openNotes, setOpenNotes] = useState(null);
  const [openVideo, setOpenVideo] = useState(null);

  const groups = useMemo(() => {
    if (!data || data.locked) return [];
    const byModule = new Map();
    for (const m of data.items) {
      const key = m.moduleIndex ?? "general";
      if (!byModule.has(key)) byModule.set(key, []);
      byModule.get(key).push(m);
    }
    const ordered = (data.modules || []).filter((mod) => byModule.has(mod.index)).map((mod) => ({ key: mod.index, title: mod.title, items: byModule.get(mod.index) }));
    if (byModule.has("general")) ordered.push({ key: "general", title: "General materials", items: byModule.get("general") });
    return ordered;
  }, [data]);

  if (data.locked) return <EmptyState title="Materials open when the course starts">This course starts on {data.availableOn}.</EmptyState>;
  if (data.items.length === 0) return <EmptyState title="No materials yet">Your instructor has not published any materials for this course.</EmptyState>;

  const open = async (key, path, options) => {
    setBusy(key);
    try {
      await openPrivateFile(path, options);
    } catch {
      onError("Could not open this file. You may no longer have access to it.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mc-modules">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.title} className="mc-module">
          <h3 className="mc-module__title">{group.title}</h3>
          <ul className="sd-list mc-materials">
            {group.items.map((m) => (
              <li key={m.id}>
                <div className="mc-material__head">
                  <div>
                    <p className="sd-timeline__title"><span className="sd-tag">{TYPE_LABEL[m.type]}</span> {m.title}</p>
                    {m.description && <p className="sd-muted">{m.description}</p>}
                    <p className="sd-muted">
                      Added {formatDate(m.uploadedAt)}
                      {m.fileName && ` · ${m.fileName}`}{m.sizeBytes ? ` · ${formatBytes(m.sizeBytes)}` : ""}
                    </p>
                  </div>

                  <div className="lm-actions">
                    {m.previewPath && (
                      <button type="button" className="sd-btn sd-btn--sm" disabled={busy === `p${m.id}`} onClick={() => open(`p${m.id}`, m.previewPath)}>
                        {busy === `p${m.id}` ? "Opening…" : "Preview"}<span className="visually-hidden"> {m.title}</span>
                      </button>
                    )}
                    {m.downloadPath && (
                      <button type="button" className="sd-btn sd-btn--sm" disabled={busy === `d${m.id}`} onClick={() => open(`d${m.id}`, m.downloadPath, { download: true, fileName: m.fileName })}>
                        {busy === `d${m.id}` ? "Downloading…" : "Download"}<span className="visually-hidden"> {m.title}</span>
                      </button>
                    )}
                    {m.fileName && !m.downloadPath && !m.previewPath && <span className="sd-muted">Preview and download are not available</span>}
                    {m.type === "video" && m.embedUrl && (
                      <button type="button" className="sd-btn sd-btn--sm" aria-expanded={openVideo === m.id} onClick={() => setOpenVideo(openVideo === m.id ? null : m.id)}>
                        {openVideo === m.id ? "Hide video" : "Preview video"}<span className="visually-hidden"> {m.title}</span>
                      </button>
                    )}
                    {(m.type === "video" || m.type === "link") && (
                      <a className="sd-btn sd-btn--sm" href={m.url} target="_blank" rel="noopener noreferrer">
                        {m.type === "video" ? "Open video" : "Open link"}<span className="visually-hidden"> {m.title}</span>
                      </a>
                    )}
                    {m.type === "notes" && (
                      <button type="button" className="sd-btn sd-btn--sm" aria-expanded={openNotes === m.id} onClick={() => setOpenNotes(openNotes === m.id ? null : m.id)}>
                        {openNotes === m.id ? "Hide notes" : "Read notes"}
                      </button>
                    )}
                  </div>
                </div>

                {m.type === "notes" && openNotes === m.id && <p className="mc-notes">{m.content}</p>}
                {/* Only YouTube/Vimeo embeds built by the server are ever framed; no other site is embedded. */}
                {m.type === "video" && m.embedUrl && openVideo === m.id && (
                  <div className="lm-embed">
                    <iframe src={m.embedUrl} title={m.title} loading="lazy" allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}