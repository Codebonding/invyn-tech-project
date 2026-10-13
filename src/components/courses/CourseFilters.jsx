import { useEffect, useId, useRef, useState } from "react";

function Select({ label, value, onChange, children }) {
  const id = useId();
  return (
    <div className="inv-cf__field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="inv-cf__control" value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </div>
  );
}

export default function CourseFilters({ filters, set, clear, dirty, options, shown, total }) {
  const searchId = useId();

  // The input owns its text (no lost keystrokes); the URL follows after a short pause.
  const [q, setQ] = useState(filters.q);
  const pushed = useRef(filters.q);
  useEffect(() => {
    if (filters.q !== pushed.current) { pushed.current = filters.q; setQ(filters.q); } // e.g. "Clear all filters"
  }, [filters.q]);
  useEffect(() => {
    if (q === pushed.current) return undefined;
    const t = setTimeout(() => { pushed.current = q; set({ q }); }, 200);
    return () => clearTimeout(t);
  }, [q, set]);

  return (
    <form className="inv-cf" role="search" aria-label="Search and filter courses" onSubmit={(e) => e.preventDefault()}>
      <div className="inv-cf__field inv-cf__field--search">
        <label htmlFor={searchId}>Search courses</label>
        <input
          id={searchId} type="search" className="inv-cf__control" value={q}
          placeholder="Title, category, topic or technology" autoComplete="off"
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Select label="Category" value={filters.category} onChange={(v) => set({ category: v })}>
        <option value="">All categories</option>
        {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Select label="Learning mode" value={filters.mode} onChange={(v) => set({ mode: v })}>
        <option value="">Any mode</option>
        {options.modes.map((m) => <option key={m} value={m}>{m}</option>)}
      </Select>
      {options.durations.length > 0 && (
        <Select label="Duration" value={filters.duration} onChange={(v) => set({ duration: v })}>
          <option value="">Any duration</option>
          {options.durations.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </Select>
      )}
      <Select label="Sort by" value={filters.sort} onChange={(v) => set({ sort: v })}>
        {options.sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>
      <div className="inv-cf__bar">
        <p className="inv-cf__count" role="status" aria-live="polite">
          Showing <strong>{shown}</strong> of {total} {total === 1 ? "course" : "courses"}
        </p>
        <button type="button" className="inv-cf__clear" onClick={clear} disabled={!dirty}>Clear all filters</button>
      </div>
    </form>
  );
}