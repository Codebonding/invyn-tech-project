import { MATERIAL_TYPES, STATUSES } from "../../utils/materialValidation";

export default function MaterialFilters({ value, searchText, onSearchText, onChange, onClear, courses }) {
  const selectedCourse = courses.find((c) => String(c.id) === String(value.courseId));
  const active = Boolean(searchText || value.courseId || value.moduleIndex || value.type || value.status || value.sort !== "created_desc");

  return (
    <div className="lm-filters">
      <div className="sp-field lm-filters__search">
        <label htmlFor="lm-search">Search by title</label>
        <input id="lm-search" type="search" className="sp-input" placeholder="Search materials" maxLength={100} value={searchText} onChange={(e) => onSearchText(e.target.value)} />
      </div>
      <div className="sp-field">
        <label htmlFor="lm-course">Course</label>
        <select id="lm-course" className="sp-input" value={value.courseId} onChange={(e) => onChange({ courseId: e.target.value, moduleIndex: "" })}>
          <option value="">All courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      <div className="sp-field">
        <label htmlFor="lm-module">Module</label>
        <select id="lm-module" className="sp-input" value={value.moduleIndex} disabled={!selectedCourse} onChange={(e) => onChange({ moduleIndex: e.target.value })}>
          <option value="">All modules</option>
          <option value="none">Not in a module</option>
          {(selectedCourse?.modules || []).map((m) => <option key={m.index} value={m.index}>{m.title}</option>)}
        </select>
      </div>
      <div className="sp-field">
        <label htmlFor="lm-type">Material type</label>
        <select id="lm-type" className="sp-input" value={value.type} onChange={(e) => onChange({ type: e.target.value })}>
          <option value="">All types</option>
          {MATERIAL_TYPES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
      <div className="sp-field">
        <label htmlFor="lm-status">Status</label>
        <select id="lm-status" className="sp-input" value={value.status} onChange={(e) => onChange({ status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
      <div className="sp-field">
        <label htmlFor="lm-sort">Sort by</label>
        <select id="lm-sort" className="sp-input" value={value.sort} onChange={(e) => onChange({ sort: e.target.value })}>
          <option value="created_desc">Newest first</option>
          <option value="created_asc">Oldest first</option>
          <option value="title_asc">Title A–Z</option>
        </select>
      </div>
      {active && <button type="button" className="sd-btn sd-btn--sm lm-clear" onClick={onClear}>Clear filters</button>}
    </div>
  );
}