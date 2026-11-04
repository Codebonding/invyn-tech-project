const TABS = [
  ["all", "All courses"],
  ["ongoing", "Ongoing"],
  ["completed", "Completed"],
  ["upcoming", "Upcoming"],
];

const SORTS = [
  ["enrolled_desc", "Newest enrollment"],
  ["enrolled_asc", "Oldest enrollment"],
  ["progress_desc", "Progress: high to low"],
  ["progress_asc", "Progress: low to high"],
  ["title_asc", "Title A–Z"],
];

export default function CourseFilters({ value, searchText, onSearchText, onChange, onClear, counts, options }) {
  const active = Boolean(value.status !== "all" || searchText || value.mode || value.category || value.sort !== "enrolled_desc");

  return (
    <div className="mc-filters">
      <div className="sd-filters" role="group" aria-label="Course categories">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={`sd-chip ${value.status === id ? "is-active" : ""}`} aria-pressed={value.status === id} onClick={() => onChange({ status: id })}>
            {label} <span>{counts?.[id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="mc-filters__row">
        <div className="sp-field">
          <label htmlFor="mc-search">Search courses</label>
          <input id="mc-search" type="search" className="sp-input" placeholder="Search by course name" value={searchText} onChange={(e) => onSearchText(e.target.value)} maxLength={100} />
        </div>
        <div className="sp-field">
          <label htmlFor="mc-mode">Learning mode</label>
          <select id="mc-mode" className="sp-input" value={value.mode} onChange={(e) => onChange({ mode: e.target.value })}>
            <option value="">All modes</option>
            {(options?.modes || []).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="sp-field">
          <label htmlFor="mc-category">Category</label>
          <select id="mc-category" className="sp-input" value={value.category} onChange={(e) => onChange({ category: e.target.value })}>
            <option value="">All categories</option>
            {(options?.categories || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="sp-field">
          <label htmlFor="mc-sort">Sort by</label>
          <select id="mc-sort" className="sp-input" value={value.sort} onChange={(e) => onChange({ sort: e.target.value })}>
            {SORTS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>
        {active && <button type="button" className="sd-btn sd-btn--sm mc-clear" onClick={onClear}>Clear filters</button>}
      </div>
    </div>
  );
}