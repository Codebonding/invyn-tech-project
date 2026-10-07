import { Link } from "react-router-dom";
import FooterIcon from "./FooterIcons";
import { CONTACT, SOCIAL } from "../../data/footer";
import { ROUTES } from "../../utils/constant";

const SOCIALS = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "github", label: "GitHub" },
  { key: "youtube", label: "YouTube" },
];

export default function FooterContact() {
  const { email, phone, location } = CONTACT;
  const hasContact = Boolean(email || phone || location);

  return (
    <div className="inv-footer__panel">
      <section className="inv-footer__contact" aria-labelledby="footer-contact-title">
        <h2 id="footer-contact-title" className="inv-fcol__title">Contact</h2>
        {hasContact ? (
          <ul className="inv-fcontact">
            {email && (
              <li>
                <FooterIcon name="mail" />
                <a href={`mailto:${email}`} className="inv-flink">{email}</a>
              </li>
            )}
            {phone && (
              <li>
                <FooterIcon name="phone" />
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inv-flink">{phone}</a>
              </li>
            )}
            {location && (
              <li>
                <FooterIcon name="pin" />
                <span>{location}</span>
              </li>
            )}
          </ul>
        ) : (
          <p className="inv-footer__muted">
            Have a project or a question? <Link className="inv-flink inv-flink--inline" to={ROUTES.contact}>Get in touch</Link>.
          </p>
        )}
      </section>

      <section className="inv-footer__social" aria-labelledby="footer-social-title">
        <h2 id="footer-social-title" className="inv-fcol__title">Follow Us</h2>
        <ul className="inv-socials">
          {SOCIALS.map(({ key, label }) => {
            const url = SOCIAL[key];
            return (
              <li key={key}>
                {url ? (
                  <a className="inv-social" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
                    <FooterIcon name={key} />
                  </a>
                ) : (
                  <span className="inv-social is-off" aria-disabled="true" role="img" aria-label={`${label} (link not set yet)`}>
                    <FooterIcon name={key} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}