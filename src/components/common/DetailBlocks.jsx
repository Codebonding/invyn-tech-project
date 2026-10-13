import { pad2 } from "../../utils/helpers";

/** Shared building blocks for detail pages (courses and services). */
export function Section({ id, title, children }) {
  return (
    <section className="inv-cd__section" aria-labelledby={id}>
      <h2 id={id} className="inv-cd__h2">{title}</h2>
      {children}
    </section>
  );
}

export const List = ({ items }) => <ul className="inv-cd__list">{items.map((t) => <li key={t}>{t}</li>)}</ul>;

export const Pills = ({ items, label }) => (
  <ul className="inv-pills" aria-label={label}>{items.map((t) => <li className="inv-pill" key={t}>{t}</li>)}</ul>
);

export function Steps({ items }) {
  return (
    <ol className="inv-steps">
      {items.map((s, i) => (
        <li key={s.title}>
          <span className="inv-steps__num" aria-hidden="true">{pad2(i + 1)}</span>
          <div>
            <h3 className="inv-steps__title">{s.title}</h3>
            <p>{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}