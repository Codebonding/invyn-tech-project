import { Link } from "react-router-dom";
import Container from "../common/Container";
import Breadcrumbs from "../common/Breadcrumbs";
import { Section, List } from "../common/DetailBlocks";
import { CONTACT } from "../../data/footer";
import { legalUpdated } from "../../data/legal";
import { ROUTES } from "../../utils/constant";
import "../../styles/course-pages.css";
import "../../styles/legal-pages.css";

const telHref = (phone) => `tel:${phone.replace(/[^+\d]/g, "")}`;

/** Shared layout for the legal pages: header, "On this page" list and numbered sections. `other` is { label, to }. */
export default function LegalDocument({ doc, other }) {
  return (
    <div className="inv-page inv-legal">
      <Container>
        <Breadcrumbs items={[{ label: "Home", to: ROUTES.home }, { label: doc.title }]} />

        <header className="inv-pagehead">
          <p className="inv-eyebrow">Legal</p>
          <h1 className="inv-section-title">{doc.title}</h1>
          <p className="inv-legal__meta">Last updated: {legalUpdated}</p>
          <p className="inv-section-desc">{doc.intro}</p>
        </header>

        <div className="row g-4 g-xl-5">
          <aside className="col-12 col-lg-4 col-xl-3" aria-label="On this page">
            <div className="inv-cd__aside">
              <h2 className="inv-cd__h2">On this page</h2>
              <ol className="inv-legal__toc">
                {doc.sections.map((s) => (
                  <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="col-12 col-lg-8 col-xl-9">
            {doc.sections.map((s, i) => (
              <Section key={s.id} id={s.id} title={`${i + 1}. ${s.title}`}>
                {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                {s.list && <List items={s.list} />}
                {s.contact && (
                  <ul className="inv-legal__contact">
                    <li>Email: <a className="inv-cd__link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                    <li>Phone: <a className="inv-cd__link" href={telHref(CONTACT.phone)}>{CONTACT.phone}</a></li>
                  </ul>
                )}
              </Section>
            ))}

            {other && (
              <p className="inv-legal__other">
                Also read: <Link className="inv-cd__link" to={other.to}>{other.label}</Link>
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}