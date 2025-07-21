import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../redux/user/userSlice";
import { THEMES } from "../constants";
import { setTheme } from "../redux/themeSlice";

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

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  return (
    <header
      className='bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80'
    >
      <ThemeModal open={themeModalOpen} onClose={() => setThemeModalOpen(false)} />
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">

          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatify</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm gap-2 transition-colors`}
              onClick={() => setThemeModalOpen(true)}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Themes</span>
            </button>

            {
              currentUser && (
                <>
                  <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                    <User className="size-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <button className="flex gap-2 items-center" onClick={handleLogout}>
                    <LogOut className="size-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )
            }
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;