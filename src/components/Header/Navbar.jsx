import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "../../assets/images/invyn-logo.png";

import {
  NAV_ITEMS,
  CTA,
  LOGIN_ROUTE,
  DESKTOP_QUERY,
  isNavActive,
} from "../../utils/navData";

import "./Navbar.css";

const hasMenu = (item) => Array.isArray(item.items) && item.items.length > 0;

const linkClass = (base) => ({ isActive }) => `${base}${isActive ? " is-active" : ""}`;
const activeClass = (base, active) => `${base}${active ? " is-active" : ""}`;

/* ---------- Chevron ---------- */
function Chevron() {
  return (
    <svg className="inv-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Brand ---------- */
function Brand() {
  const [failed, setFailed] = useState(false);

  return (
    <Link to="/" className="inv-brand d-inline-flex align-items-center" aria-label="INVYN TECH home">
      {failed ? (
        <span className="inv-brand__text">
          INVYN <span>TECH</span>
        </span>
      ) : (
        <>
          <img className="inv-brand__img inv-brand__img--full" src={Logo} alt="INVYN TECH" height="44" onError={() => setFailed(true)} />
          <img className="inv-brand__img inv-brand__img--mark" src={Logo} alt="" aria-hidden="true" height="38" />
        </>
      )}
    </Link>
  );
}

/* ---------- Desktop dropdown ---------- */
function DesktopDropdown({ item, open, active, onOpen, onClose, onToggle }) {
  const pointerType = useRef("mouse");
  const menuId = `inv-dd-${item.id}`;

  const handleEnter = (event) => {
    if (event.pointerType === "mouse") onOpen(item.id);
  };

  const handleLeave = (event) => {
    if (event.pointerType === "mouse") onClose(item.id);
  };

  const handleFocusOut = (event) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) onClose(item.id);
  };

  const handleClick = (event) => {
    if (event.detail !== 0 && pointerType.current === "mouse" && open) return;
    onToggle(item.id);
  };

  const handleKeyDown = (event) => {
    if (event.key !== "ArrowDown") return;

    event.preventDefault();
    onOpen(item.id);

    // event.currentTarget is null once the handler returns, so read it BEFORE the animation frame.
    const root = event.currentTarget.closest(".inv-nav__item");
    requestAnimationFrame(() => {
      root?.querySelector(".inv-dd__link")?.focus();
    });
  };

  return (
    <li className="inv-nav__item" onPointerEnter={handleEnter} onPointerLeave={handleLeave} onBlur={handleFocusOut}>
      <button
        type="button"
        className={activeClass("inv-nav__link inv-nav__trigger", active)}
        data-trigger={item.id}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-current={active ? "page" : undefined}
        onPointerDown={(event) => { pointerType.current = event.pointerType; }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {item.label}
        <Chevron />
      </button>

      <div id={menuId} className={`inv-dd${open ? " is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <div className="inv-dd__panel">
          <ul className="inv-dd__list">
            {item.items.map((sub) => (
              <li key={sub.to}>
                <NavLink to={sub.to} className={linkClass("inv-dd__link")}>
                  <span className="inv-dd__title">{sub.label}</span>
                  {sub.desc && <span className="inv-dd__desc">{sub.desc}</span>}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="inv-dd__footer">
            <NavLink to={item.to} end className="inv-dd__all">
              {item.allLabel}
              <Chevron />
            </NavLink>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ---------- Mobile accordion ---------- */
function MobileAccordion({ item, open, active, onToggle }) {
  const panelId = `inv-m-${item.id}`;

  return (
    <li className="inv-m__item">
      <button
        type="button"
        className={activeClass("inv-m__link inv-m__trigger", active)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={active ? "page" : undefined}
        onClick={() => onToggle(item.id)}
      >
        {item.label}
        <Chevron />
      </button>

      <div id={panelId} className={`inv-m__sub${open ? " is-open" : ""}`} aria-hidden={!open} inert={!open}>
        <div className="inv-m__subclip">
          <ul className="inv-m__sublist d-grid">
            {item.items.map((sub) => (
              <li key={sub.to}>
                <NavLink to={sub.to} className={linkClass("inv-m__sublink")}>
                  {sub.label}
                </NavLink>
              </li>
            ))}

            <li>
              <NavLink to={item.to} end className="inv-m__sublink inv-m__sublink--all">
                {item.allLabel}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </li>
  );
}

/* ---------- Navbar ---------- */
export default function Navbar() {
  const location = useLocation();
  const { key: locationKey } = location;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSection, setMobileSection] = useState(null);

  const navRef = useRef(null);
  const toggleRef = useRef(null);

  const openMenu = useCallback((id) => setOpenDropdown(id), []);
  const closeMenu = useCallback((id) => setOpenDropdown((current) => (current === id ? null : current)), []);
  const toggleMenu = useCallback((id) => setOpenDropdown((current) => (current === id ? null : id)), []);
  const toggleSection = useCallback((id) => setMobileSection((current) => (current === id ? null : id)), []);

  /* Scroll state */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close menus on every navigation. location.key changes even when only "?section=" changes
     (pathname alone does not), so the mobile menu also closes after tapping About, Internships or Contact. */
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileSection(null);
  }, [locationKey]);

  /* Close mobile menu when the desktop breakpoint is reached */
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);

    const onChange = (event) => {
      if (event.matches) {
        setMobileOpen(false);
        setMobileSection(null);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  /* Lock page scrolling while mobile menu is open */
  useEffect(() => {
    document.body.classList.toggle("inv-nav-lock", mobileOpen);
    return () => document.body.classList.remove("inv-nav-lock");
  }, [mobileOpen]);

  /* Outside click and Escape key */
  useEffect(() => {
    if (!openDropdown && !mobileOpen) return undefined;

    const onPointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setMobileOpen(false);
        setMobileSection(null);
      }
    };

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (openDropdown) {
        const trigger = navRef.current?.querySelector(`[data-trigger="${openDropdown}"]`);
        setOpenDropdown(null);
        trigger?.focus();
      } else if (mobileOpen) {
        setMobileOpen(false);
        setMobileSection(null);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDropdown, mobileOpen]);

  return (
    <header className={`inv-nav-wrap${scrolled ? " is-scrolled" : ""}`}>
      <nav ref={navRef} className={`inv-nav${mobileOpen ? " is-menu-open" : ""}`} aria-label="Main navigation">
        <div className="inv-nav__bar">
          <Brand />

          {/* Desktop navigation (Bootstrap xl and up) */}
          <ul className="inv-nav__links d-none d-xl-flex align-items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item, location);
              return hasMenu(item) ? (
                <DesktopDropdown
                  key={item.id}
                  item={item}
                  open={openDropdown === item.id}
                  active={active}
                  onOpen={openMenu}
                  onClose={closeMenu}
                  onToggle={toggleMenu}
                />
              ) : (
                <li key={item.id} className="inv-nav__item">
                  <Link to={item.to} className={activeClass("inv-nav__link", active)} aria-current={active ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Navbar actions */}
          <div className="inv-nav__actions d-flex align-items-center gap-2">
            <Link to={LOGIN_ROUTE} className="inv-btn inv-btn--ghost inv-nav__login d-none d-xl-inline-flex">
              Login
            </Link>

            <Link to={CTA.to} className="inv-btn">
              {CTA.label}
            </Link>

            <button
              ref={toggleRef}
              type="button"
              className={`inv-nav__toggle d-xl-none${mobileOpen ? " is-open" : ""}`}
              aria-expanded={mobileOpen}
              aria-controls="inv-mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((current) => !current)}
            >
              <span className="inv-nav__toggle-bar" />
              <span className="inv-nav__toggle-bar" />
              <span className="inv-nav__toggle-bar" />
            </button>
          </div>
        </div>

        {/* Mobile and tablet navigation (below Bootstrap xl) */}
        <div id="inv-mobile-menu" className={`inv-mobile d-xl-none${mobileOpen ? " is-open" : ""}`} aria-hidden={!mobileOpen} inert={!mobileOpen}>
          <div className="inv-mobile__clip">
            <div className="inv-mobile__scroll">
              <ul className="inv-m__list d-grid">
                {NAV_ITEMS.map((item) => {
                  const active = isNavActive(item, location);
                  return hasMenu(item) ? (
                    <MobileAccordion key={item.id} item={item} open={mobileSection === item.id} active={active} onToggle={toggleSection} />
                  ) : (
                    <li key={item.id} className="inv-m__item">
                      <Link to={item.to} className={activeClass("inv-m__link", active)} aria-current={active ? "page" : undefined}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}

                <li className="inv-m__item">
                  <Link to={LOGIN_ROUTE} className={activeClass("inv-m__link", isNavActive({ to: LOGIN_ROUTE }, location))}>
                    Login
                  </Link>
                </li>

                <li className="inv-m__item">
                  <Link to={CTA.to} className={activeClass("inv-m__link", isNavActive(CTA, location))}>
                    {CTA.label}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
