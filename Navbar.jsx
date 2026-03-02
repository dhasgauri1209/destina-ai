import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import Logo from "./Logo";

function Navbar({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem("destina_token");
  const { t, lang, setLang } = useI18n();

  const navItems = [
    { label: t("home"), to: "/" },
    { label: t("login"), to: "/login" },
    { label: t("register"), to: "/register" }
  ];

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("destina_token");
    localStorage.removeItem("destina_user_name");
    navigate("/login");
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/45 backdrop-blur-2xl light:bg-white/55">
      <nav className="app-container flex h-20 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2" onClick={closeMenu}>
          <Logo />
          <span className="font-heading text-xl font-bold tracking-wide text-white light:text-slate-900">Destina AI</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative text-sm font-medium ${isActive ? "text-secondary" : "text-slate-200 light:text-slate-700"}`
              }
            >
              {({ isActive }) => (
                <span className="group relative">
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded bg-gradient-to-r from-secondary to-accent transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </span>
              )}
            </NavLink>
          ))}

          {token && (
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-full border border-secondary/35 bg-secondary/15 px-4 py-2 text-sm font-semibold text-secondary"
            >
              {t("dashboard")}
            </button>
          )}

          <select
            value={lang}
            onChange={(event) => setLang(event.target.value)}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white light:border-slate-300 light:bg-white light:text-slate-800"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onToggleTheme}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white light:border-slate-300 light:bg-white light:text-slate-800"
          >
            {darkMode ? "Light" : "Dark"}
          </motion.button>

          {token && (
            <button onClick={handleLogout} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow">
              Logout
            </button>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`absolute h-0.5 w-5 rounded bg-white transition-all duration-300 light:bg-slate-800 ${menuOpen ? "rotate-45" : "-translate-y-1.5"}`} />
          <span className={`absolute h-0.5 w-5 rounded bg-white transition-opacity duration-300 light:bg-slate-800 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute h-0.5 w-5 rounded bg-white transition-all duration-300 light:bg-slate-800 ${menuOpen ? "-rotate-45" : "translate-y-1.5"}`} />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-2xl light:bg-white/85 md:hidden"
          >
            <div className="space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 light:text-slate-700"
                >
                  {item.label}
                </NavLink>
              ))}
              {token && (
                <button
                  onClick={() => {
                    closeMenu();
                    navigate("/dashboard");
                  }}
                  className="block w-full rounded-xl bg-secondary/15 px-3 py-2 text-left text-sm font-semibold text-secondary"
                >
                  {t("dashboard")}
                </button>
              )}
              <select
                value={lang}
                onChange={(event) => setLang(event.target.value)}
                className="block w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-slate-200 light:border-slate-300 light:bg-white light:text-slate-700"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
              <button
                onClick={onToggleTheme}
                className="block w-full rounded-xl bg-white/10 px-3 py-2 text-left text-sm text-slate-200 light:bg-white light:text-slate-700"
              >
                Switch to {darkMode ? "Light" : "Dark"}
              </button>
              {token && (
                <button onClick={handleLogout} className="block w-full rounded-xl bg-primary px-3 py-2 text-left text-sm font-semibold text-white">
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
