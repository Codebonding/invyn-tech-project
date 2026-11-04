export default function Pagination({ page, pageCount, onPage }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="mc-pager" aria-label="Course pages">
      <button type="button" className="sd-btn sd-btn--sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <span className="sd-muted" aria-live="polite">Page {page} of {pageCount}</span>
      <button type="button" className="sd-btn sd-btn--sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</button>
    </nav>
  );
}