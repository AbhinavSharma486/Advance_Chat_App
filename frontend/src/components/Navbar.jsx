import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User, X, Type } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../redux/user/userSlice";
import { THEMES } from "../constants";
import { setTheme, setFont } from "../redux/themeSlice";

const FONTS = [
  { name: 'System', class: 'font-system', size: 'text-base' },
  { name: 'Roboto', class: 'font-roboto', size: 'text-base' },
  { name: 'Poppins', class: 'font-poppins', size: 'text-base' },
  { name: 'Montserrat', class: 'font-montserrat', size: 'text-base' },
  { name: 'Raleway', class: 'font-raleway', size: 'text-base' },
  { name: 'Rubik', class: 'font-rubik', size: 'text-base' },
  { name: 'Quicksand', class: 'font-quicksand', size: 'text-base' },
  { name: 'Nunito', class: 'font-nunito', size: 'text-base' },
  { name: 'Lexend', class: 'font-lexend', size: 'text-base' },
  { name: 'Inter', class: 'font-inter', size: 'text-base' },
  { name: 'Lato', class: 'font-lato', size: 'text-base' },
  { name: 'Dancing Script', class: 'font-dancingscript', size: 'text-xl' },
  { name: 'Great Vibes', class: 'font-greatvibes', size: 'text-xl' },
  { name: 'Pacifico', class: 'font-pacifico', size: 'text-lg' },
  { name: 'Italianno', class: 'font-italianno', size: 'text-3xl' },
  { name: 'Satisfy', class: 'font-satisfy', size: 'text-xl' },
  { name: 'Caveat', class: 'font-caveat', size: 'text-2xl' },
  { name: 'Orbitron', class: 'font-orbitron', size: 'text-lg' },
  { name: 'Gloria Hallelujah', class: 'font-gloriahallelujah', size: 'text-xl' },
  { name: 'Shadows Into Light', class: 'font-shadowsintolight', size: 'text-xl' },
];

// For global use (App.jsx): map font class to size
export const FONT_SIZE_MAP = Object.fromEntries(FONTS.map(f => [f.class, f.size]));

const ThemeModal = ({ open, onClose }) => {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  if (!open) return null;

  return (
    <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-base-content/60 hover:text-base-content"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold mb-2">Theme</h2>
        <p className="text-sm text-base-content/70 mb-4">Choose a theme for your chat interface</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors w-full
                ${theme === t ? "bg-base-200 ring-2 ring-primary" : "hover:bg-base-200/50"}
              `}
              onClick={() => {
                if (theme !== t) {
                  dispatch(setTheme(t));
                  onClose();
                }
              }}
              disabled={theme === t}
              style={{ position: 'relative' }}
            >
              <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
                {theme === t && (
                  <span className="absolute top-1 right-1 bg-primary text-white rounded-full px-1 text-xs">✔</span>
                )}
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const FontModal = ({ open, onClose }) => {
  const font = useSelector((state) => state.theme.font);
  const dispatch = useDispatch();
  if (!open) return null;
  return (
    <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-base-content/60 hover:text-base-content"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold mb-2">Font</h2>
        <p className="text-sm text-base-content/70 mb-4">Choose a font for your chat interface</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.class}
              className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors w-full border border-base-300
                ${font === f.class ? "bg-base-200 ring-2 ring-primary" : "hover:bg-base-200/50"}
              `}
              onClick={() => {
                if (font !== f.class) {
                  dispatch(setFont(f.class));
                  onClose();
                }
              }}
              disabled={font === f.class}
              style={{ position: 'relative' }}
            >
              <span className={`${f.size} ${f.class}`}>{f.name}</span>
              <span className={`${f.size} ${f.class}`}>The quick brown fox</span>
              {font === f.class && (
                <span className="absolute top-1 right-1 bg-primary text-white rounded-full px-1 text-xs">✔</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [fontModalOpen, setFontModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <ThemeModal open={themeModalOpen} onClose={() => setThemeModalOpen(false)} />
      <FontModal open={fontModalOpen} onClose={() => setFontModalOpen(false)} />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">Chatify</h1>
          </Link>
        </div>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm gap-2 transition-colors`}
            onClick={() => setThemeModalOpen(true)}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Themes</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm gap-2 transition-colors`}
            onClick={() => setFontModalOpen(true)}
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Fonts</span>
          </button>
          {currentUser && (
            <>
              <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                <User className="size-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button className="flex gap-2 items-center btn btn-sm" onClick={handleLogout}>
                <LogOut className="size-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex flex-col md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-base-100 shadow-lg p-4 flex flex-col gap-3 w-11/12 max-w-xs h-full" onClick={e => e.stopPropagation()}>
            <button className="self-end mb-2 btn btn-ghost btn-circle" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            <button
              type="button"
              className={`btn btn-sm gap-2 transition-colors`}
              onClick={() => { setThemeModalOpen(true); setMobileMenuOpen(false); }}
            >
              <Settings className="w-4 h-4" />
              Themes
            </button>
            <button
              type="button"
              className={`btn btn-sm gap-2 transition-colors`}
              onClick={() => { setFontModalOpen(true); setMobileMenuOpen(false); }}
            >
              <Type className="w-4 h-4" />
              Fonts
            </button>
            {currentUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`} onClick={() => setMobileMenuOpen(false)}>
                  <User className="size-5" />
                  Profile
                </Link>
                <button className="flex gap-2 items-center btn btn-sm" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  <LogOut className="size-5" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;