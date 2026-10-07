import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/images/invyn-logo.png";
import FooterIcon from "./FooterIcons";
import FooterLinks, { FooterLink } from "./FooterLinks";
import FooterContact from "./FooterContact";
import useMediaQuery from "../../hooks/useMediaQuery";
import useReducedMotion from "../../hooks/useReducedMotion";
import { mq } from "../../utils/responsive";
import { footerBrand, footerColumns, legalLinks } from "../../data/footer";
import "../../styles/footer.css";

/** Link column. On mobile the heading becomes a real button (accordion); `hidden` keeps closed links out of the tab order. */
function FooterColumn({ title, links }) {
  const small = useMediaQuery(mq.belowTablet);
  const [open, setOpen] = useState(false);
  const uid = useId();
  const expanded = !small || open;

  return (
    <nav className={`inv-fcol ${small ? "is-accordion" : ""}`} aria-labelledby={`${uid}-t`}>
      <h2 id={`${uid}-t`} className="inv-fcol__title">
        {small ? (
          <button
            type="button"
            className="inv-fcol__toggle"
            aria-expanded={expanded}
            aria-controls={`${uid}-p`}
            onClick={() => setOpen((o) => !o)}
          >
            {title}
            <FooterIcon name="chevron" size={18} className="inv-fcol__chev" />
          </button>
        ) : (
          title
        )}
      </h2>
      <div id={`${uid}-p`} hidden={!expanded}>
        <FooterLinks links={links} />
      </div>
    </nav>
  );
}

export default function Footer() {
  const { pathname, hash } = useLocation();
  const reduced = useReducedMotion();

  // "/#about" style links: scroll to the section after navigation
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [pathname, hash, reduced]);

  return (
    <footer className="inv-footer">
      <div className="inv-footer__inner">
        <div className="inv-footer__grid">
          <div className="inv-footer__brand">
            <Link to="/" className="inv-footer__logo" aria-label="INVYN TECH home">
              <img src={logo} alt="INVYN TECH" loading="lazy" decoding="async" />
            </Link>
            <p className="inv-footer__desc">{footerBrand.description}</p>
            <p></p>
          </div>

          {footerColumns.map((col) => (
            <FooterColumn key={col.id} title={col.title} links={col.links} />
          ))}
        </div>

        <FooterContact />

        <div className="inv-footer__bottom">
          <p className="inv-footer__copy">© {new Date().getFullYear()} INVYN TECH. All rights reserved.</p>
          <ul className="inv-footer__legal">
            {legalLinks.map((l) => (
              <li key={l.label}><FooterLink {...l} /></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}