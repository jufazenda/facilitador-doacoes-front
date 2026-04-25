import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const TIPO_LABEL = {
  doador: "Doador",
  instituicao: "Instituição",
  admin: "Admin",
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-purple-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3"
        >
          <img src={logo} alt="Faz a Boa" className="h-10 w-auto sm:h-12" />

          <span className="sr-only">Faz a Boa</span>
        </Link>

        {/* Desktop nav */}

        <nav className="hidden items-center gap-10 font-semibold text-purple-950 md:flex">
          <a href="/#campaigns" className="transition hover:text-purple-600">
            Campanhas
          </a>
          <a href="/#institutions" className="transition hover:text-purple-600">
            Instituições
          </a>
          <a href="/#how-it-works" className="transition hover:text-purple-600">
            Como funciona?
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop user / login */}
          {user ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-white px-4 py-2 font-semibold text-purple-950 transition hover:bg-purple-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-700 text-xs font-bold text-white">
                  {user.nome[0]}
                </span>
                <span className="text-sm">{user.nome.split(" ")[0]}</span>
                <span className="text-xs text-purple-400">▾</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-purple-100 bg-white py-2 shadow-xl shadow-purple-950/10">
                  <p className="px-4 py-1 text-xs text-slate-400">
                    {TIPO_LABEL[user.tipo]}
                  </p>
                  <Link
                    to={`/area/${user.tipo}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-purple-950 hover:bg-purple-50"
                  >
                    Minha área
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden font-semibold text-purple-950 sm:block hover:text-purple-600 transition"
            >
              Login
            </Link>
          )}

          <a
            href="/#campaigns"
            className="hidden rounded-2xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 sm:block sm:px-5 sm:py-3"
          >
            Doe agora ♡
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-purple-950 transition hover:bg-purple-50 md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 4l12 12M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-purple-100 bg-white px-4 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <a
              href="/#campaigns"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 font-semibold text-purple-950 hover:bg-purple-50"
            >
              Campanhas
            </a>
            <a
              href="/#institutions"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 font-semibold text-purple-950 hover:bg-purple-50"
            >
              Instituições
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 font-semibold text-purple-950 hover:bg-purple-50"
            >
              Como funciona?
            </a>
          </nav>

          <div className="mt-4 border-t border-purple-100 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 text-sm font-bold text-white">
                    {user.nome[0]}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-purple-950">
                      {user.nome}
                    </p>
                    <p className="text-xs text-slate-400">
                      {TIPO_LABEL[user.tipo]}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/area/${user.tipo}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-purple-50 px-4 py-3 text-center font-semibold text-purple-800"
                >
                  Minha área
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-red-100 px-4 py-3 text-center font-semibold text-red-500"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-purple-200 px-4 py-3 text-center font-semibold text-purple-800"
                >
                  Login
                </Link>
              </>
            )}
            <a
              href="/#campaigns"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl bg-[#FF5C5C] px-4 py-3 text-center font-bold text-white shadow-lg shadow-red-200"
            >
              Doe agora ♡
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
