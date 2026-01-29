import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "./AppLayout.css";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
];

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-layout">
      <header className="app-header">
        <button
          type="button"
          className="hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </header>

      <div
        className={`menu-overlay ${menuOpen ? "menu-overlay--open" : ""}`}
        onClick={closeMenu}
      />

      <nav className={`side-menu ${menuOpen ? "side-menu--open" : ""}`}>
        <button
          type="button"
          className="side-menu__close"
          onClick={closeMenu}
          aria-label="Close menu"
        >
          ×
        </button>
        <ul className="side-menu__list">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="side-menu__link" onClick={closeMenu}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
