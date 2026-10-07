import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../../assets/images/invyn-logo.png';
import './Navbar.css';
import {NAV_ITEMS,CTA,DESKTOP_QUERY} from '../../utils/navData';
function Chevron() {
  return (
    <svg
      className="inv-chevron"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function Brand() {
  const [failed, setFailed] = useState(false);

  return (
    <Link to="/" className="inv-brand">
      {failed ? (
        <span className="inv-brand__text">
          INVYN <span>TECH</span>
        </span>
      ) : (
        <img
          className="inv-brand__img"
          src={Logo}
          alt="INVYN TECH"
          height="42"
          onError={() => setFailed(true)}
        />
      )}
    </Link>
  );
}
const linkClass = (base) => ({ isActive }) =>
  `${base}${isActive ? ' is-active' : ''}`;
function DesktopDropdown({
  item,
  open,
  active,
  onOpen,
  onClose,
  onToggle,
}) {
  const pointerType = useRef('mouse');
  const menuId = `inv-dd-${item.id}`;

  const handleEnter = (e) => {
    if (e.pointerType === 'mouse') onOpen(item.id);
  };
  const handleLeave = (e) => {
    if (e.pointerType === 'mouse') onClose(item.id);
  };
  const handleFocusOut = (e) => {
    if (
      e.relatedTarget &&
      !e.currentTarget.contains(e.relatedTarget)
    ) {
      onClose(item.id);
    }
  };
  const handleClick = (e) => {
    if (
      e.detail !== 0 &&
      pointerType.current === 'mouse' &&
      open
    ) {
      return;
    }

    onToggle(item.id);
  };
  const handleKeyDown = (e) => {
    if (e.key !== 'ArrowDown') return;
    e.preventDefault();
    const li = e.currentTarget.parentElement;
    onOpen(item.id);
    requestAnimationFrame(() => {
      li.querySelector('.inv-dd__link')?.focus();
    });
  };
  return (
    <li
      className="inv-nav__item"
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onBlur={handleFocusOut}
    >
      <button
        type="button"
        className={`inv-nav__link inv-nav__trigger${
          active ? ' is-active' : ''
        }`}
        data-trigger={item.id}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {item.label}
        <Chevron />
      </button>

      <div
        id={menuId}
        className={`inv-dd ${
          item.wide ? 'inv-dd--wide' : 'inv-dd--narrow'
        }${open ? ' is-open' : ''}`}
      >
        <div className="inv-dd__panel">

          <ul className="inv-dd__list">
            {item.items.map((sub) => (
              <li key={sub.to}>
                <NavLink
                  to={sub.to}
                  className={linkClass('inv-dd__link')}
                >
                  <span className="inv-dd__title">
                    {sub.label}
                  </span>

                  <span className="inv-dd__desc">
                    {sub.desc}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="inv-dd__footer">
            <NavLink
              to={item.to}
              end
              className="inv-dd__all"
            >
              {item.allLabel}
              <Chevron />
            </NavLink>
          </div>

        </div>
      </div>
    </li>
  );
}


function MobileAccordion({
  item,
  open,
  active,
  onToggle,
}) {
  const panelId = `inv-m-${item.id}`;

  return (
    <li className="inv-m__item">

      <button
        type="button"
        className={`inv-m__link inv-m__trigger${
          active ? ' is-active' : ''
        }`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(item.id)}
      >
        {item.label}
        <Chevron />
      </button>

      <div
        id={panelId}
        className={`inv-m__sub${open ? ' is-open' : ''}`}
      >
        <div className="inv-m__subclip">

          <ul className="inv-m__sublist">

            {item.items.map((sub) => (
              <li key={sub.to}>
                <NavLink
                  to={sub.to}
                  className={linkClass('inv-m__sublink')}
                >
                  {sub.label}
                </NavLink>
              </li>
            ))}

            <li>
              <NavLink
                to={item.to}
                end
                className="inv-m__sublink inv-m__sublink--all"
              >
                {item.allLabel}
              </NavLink>
            </li>

          </ul>

        </div>
      </div>

    </li>
  );
}


export default function Navbar() {
  const { pathname } = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSection, setMobileSection] = useState(null);

  const navRef = useRef(null);
  const toggleRef = useRef(null);


  const openMenu = useCallback(
    (id) => setOpenDropdown(id),
    []
  );

  const closeMenu = useCallback(
    (id) =>
      setOpenDropdown((current) =>
        current === id ? null : current
      ),
    []
  );

  const toggleMenu = useCallback(
    (id) =>
      setOpenDropdown((current) =>
        current === id ? null : id
      ),
    []
  );

  const toggleSection = useCallback(
    (id) =>
      setMobileSection((current) =>
        current === id ? null : id
      ),
    []
  );


  const isSectionActive = (to) =>
    pathname === to || pathname.startsWith(`${to}/`);


  /* Scroll */
  useEffect(() => {
    const handleScroll = () =>
      setScrolled(window.scrollY > 12);

    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        'scroll',
        handleScroll
      );
  }, []);


  /* Route change */
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileSection(null);
  }, [pathname]);


  /* Desktop resize */
  useEffect(() => {
    const mediaQuery =
      window.matchMedia(DESKTOP_QUERY);

    const handleChange = (e) => {
      if (e.matches) {
        setMobileOpen(false);
      }
    };

    mediaQuery.addEventListener?.(
      'change',
      handleChange
    );

    return () =>
      mediaQuery.removeEventListener?.(
        'change',
        handleChange
      );
  }, []);


  /* Lock body */
  useEffect(() => {
    document.body.classList.toggle(
      'inv-nav-lock',
      mobileOpen
    );

    return () =>
      document.body.classList.remove(
        'inv-nav-lock'
      );
  }, [mobileOpen]);


  /* Outside click + Escape */
  useEffect(() => {
    if (!openDropdown && !mobileOpen) return;


    const handlePointerDown = (e) => {
      if (
        navRef.current &&
        !navRef.current.contains(e.target)
      ) {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };


    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;


      if (openDropdown) {
        const trigger =
          navRef.current?.querySelector(
            `[data-trigger="${openDropdown}"]`
          );

        setOpenDropdown(null);
        trigger?.focus();

        return;
      }


      if (mobileOpen) {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };


    document.addEventListener(
      'pointerdown',
      handlePointerDown
    );

    document.addEventListener(
      'keydown',
      handleKeyDown
    );


    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };

  }, [openDropdown, mobileOpen]);


  return (
    <header
      className={`inv-nav-wrap${
        scrolled ? ' is-scrolled' : ''
      }`}
    >

      <nav
        ref={navRef}
        className={`inv-nav${
          mobileOpen ? ' is-menu-open' : ''
        }`}
        aria-label="Main navigation"
      >

        <div className="inv-nav__bar">

          <Brand />


          {/* Desktop */}
          <ul className="inv-nav__links">

            {NAV_ITEMS.map((item) =>
              item.items ? (

                <DesktopDropdown
                  key={item.id}
                  item={item}
                  open={openDropdown === item.id}
                  active={isSectionActive(item.to)}
                  onOpen={openMenu}
                  onClose={closeMenu}
                  onToggle={toggleMenu}
                />

              ) : (

                <li
                  key={item.id}
                  className="inv-nav__item"
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={linkClass(
                      'inv-nav__link'
                    )}
                  >
                    {item.label}
                  </NavLink>
                </li>

              )
            )}

          </ul>


          {/* Actions */}
          <div className="inv-nav__actions">

            <Link
              to={CTA.to}
              className="inv-btn"
            >
              {CTA.label}
            </Link>


            <button
              ref={toggleRef}
              type="button"
              className={`inv-nav__toggle${
                mobileOpen ? ' is-open' : ''
              }`}
              aria-expanded={mobileOpen}
              aria-controls="inv-mobile-menu"
              aria-label={
                mobileOpen
                  ? 'Close menu'
                  : 'Open menu'
              }
              onClick={() =>
                setMobileOpen((value) => !value)
              }
            >
              <span className="inv-nav__toggle-bar" />
              <span className="inv-nav__toggle-bar" />
              <span className="inv-nav__toggle-bar" />
            </button>

          </div>

        </div>


        {/* Mobile */}
        <div
          id="inv-mobile-menu"
          className={`inv-mobile${
            mobileOpen ? ' is-open' : ''
          }`}
        >

          <div className="inv-mobile__clip">

            <div className="inv-mobile__scroll">

              <ul className="inv-m__list">

                {NAV_ITEMS.map((item) =>
                  item.items ? (

                    <MobileAccordion
                      key={item.id}
                      item={item}
                      open={
                        mobileSection === item.id
                      }
                      active={isSectionActive(
                        item.to
                      )}
                      onToggle={toggleSection}
                    />

                  ) : (

                    <li
                      key={item.id}
                      className="inv-m__item"
                    >
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={linkClass(
                          'inv-m__link'
                        )}
                      >
                        {item.label}
                      </NavLink>
                    </li>

                  )
                )}

              </ul>

            </div>

          </div>

        </div>

      </nav>

    </header>
  );
}