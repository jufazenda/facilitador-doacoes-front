import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Heart, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import logo from "../../assets/logo.png";

const TIPO_LABEL = {
  doador: "Doador",
  instituicao: "Instituição",
  admin: "Admin",
};

function UserAvatar({ picture, nome, tipo, size = "sm" }) {
  const dim = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  const shape = tipo === "instituicao" ? "rounded-lg" : "rounded-full";
  if (picture) {
    return <img src={picture} alt={nome} className={`${dim} ${shape} object-cover shrink-0`} />;
  }
  return (
    <span className={`flex ${dim} shrink-0 items-center justify-center ${shape} bg-purple-700 font-bold text-white`}>
      {nome[0]}
    </span>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { favorites: topInstitutions } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  function handleHashNav(hash) {
    setMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: hash } });
    }
  }

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
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-purple-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="group flex shrink-0 items-center gap-2"
          >
            <img
              src={logo}
              alt=""
              className="h-10 w-auto transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:h-12"
            />
            <span
              className="flex items-center text-accent"
              style={{ fontFamily: '"Luckiest Guy", cursive' }}
            >
              <span className="-rotate-6 text-lg leading-none sm:text-xl">Faz</span>
              <span className="mx-1 rotate-3 text-sm leading-none sm:text-base">a</span>
              <span className="-rotate-2 text-lg leading-none sm:text-xl">Boa</span>
            </span>
            <span className="sr-only">Faz a Boa</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 font-semibold text-purple-950 md:flex">
            <Link to="/" className="transition hover:text-purple-600">Home</Link>
            <button onClick={() => handleHashNav("campaigns")} className="transition hover:text-purple-600">
              Campanhas
            </button>
            <Link to="/instituicoes" className="transition hover:text-purple-600">Instituições</Link>
            <Link to="/sobre-nos" className="transition hover:text-purple-600">Sobre Nós</Link>
          </nav>

          {/* Desktop actions */}
          <div className="flex items-center gap-6">
            {user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-white px-3 py-2 font-semibold text-purple-950 transition hover:bg-purple-50"
                >
                  <UserAvatar picture={user.avatarUrl ?? user.picture} nome={user.nome} tipo={user.tipo} size="sm" />
                  <span className="text-sm">{user.nome.split(" ")[0]}</span>
                  <ChevronDown size={14} className="text-purple-400" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-purple-100 bg-white py-2 shadow-xl shadow-purple-950/10">
                    <p className="px-4 py-1 text-xs text-slate-400">{TIPO_LABEL[user.tipo]}</p>
                    <Link
                      to={`/area/${user.tipo}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm font-semibold text-purple-950 hover:bg-purple-50"
                    >
                      Minha área
                    </Link>
                    {topInstitutions.length > 0 && (
                      <>
                        <div className="mx-4 my-1 border-t border-purple-100" />
                        <p className="px-4 py-1 text-xs text-slate-400">Instituições</p>
                        {topInstitutions.map((inst) => (
                          <Link
                            key={inst.id}
                            to={`/instituicao/${inst.id}`}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50"
                          >
                            {inst.logo_url ? (
                              <img src={inst.logo_url} alt={inst.name} className="h-6 w-6 rounded-lg object-cover shrink-0" />
                            ) : (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-light text-xs font-bold text-primary">
                                {inst.name[0]}
                              </span>
                            )}
                            <span className="truncate text-sm text-purple-950">{inst.name}</span>
                          </Link>
                        ))}
                      </>
                    )}
                    <div className="mx-4 my-1 border-t border-purple-100" />
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
                className="hidden font-semibold text-purple-950 transition hover:text-purple-600 md:block"
              >
                Login
              </Link>
            )}

            {user?.tipo !== "instituicao" && (
              <button
                onClick={() => handleHashNav("campaigns")}
                className="hidden rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 md:flex md:gap-2 md:justify-center md:items-center"
              >
                Doe agora <Heart size={14} />
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-purple-950 transition hover:bg-purple-50 md:hidden"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div
        className={`fixed left-0 right-0 top-16 z-40 bg-white transition-transform duration-200 md:hidden ${
          menuOpen ? "translate-y-0 shadow-xl" : "-translate-y-full pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pt-4">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 font-semibold text-purple-950 hover:bg-purple-50"
          >
            Home
          </Link>
          <button
            onClick={() => handleHashNav("campaigns")}
            className="rounded-xl px-4 py-3 text-left font-semibold text-purple-950 hover:bg-purple-50"
          >
            Campanhas
          </button>
          <Link
            to="/instituicoes"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 font-semibold text-purple-950 hover:bg-purple-50"
          >
            Instituições
          </Link>
          <Link
            to="/sobre-nos"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 font-semibold text-purple-950 hover:bg-purple-50"
          >
            Sobre Nós
          </Link>
        </nav>

        <div className="flex flex-col gap-3 border-t border-purple-100 px-4 pb-6 pt-4 mt-2">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2">
                <UserAvatar picture={user.avatarUrl ?? user.picture} nome={user.nome} tipo={user.tipo} size="lg" />
                <div>
                  <p className="text-sm font-bold text-purple-950">{user.nome.split(" ")[0]}</p>
                  <p className="text-xs text-slate-400">{TIPO_LABEL[user.tipo]}</p>
                </div>
              </div>
              <Link
                to={`/area/${user.tipo}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-purple-50 px-4 py-3 text-center font-semibold text-purple-800"
              >
                Minha área
              </Link>
              {topInstitutions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="px-1 text-xs text-slate-400">Instituições</p>
                  {topInstitutions.map((inst) => (
                    <Link
                      key={inst.id}
                      to={`/instituicao/${inst.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-purple-50"
                    >
                      {inst.logo_url ? (
                        <img src={inst.logo_url} alt={inst.name} className="h-6 w-6 rounded-lg object-cover shrink-0" />
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-light text-xs font-bold text-primary">
                          {inst.name[0]}
                        </span>
                      )}
                      <span className="truncate text-sm font-semibold text-purple-950">{inst.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-100 px-4 py-3 text-center font-semibold text-red-500"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-purple-200 px-4 py-3 text-center font-semibold text-purple-800"
            >
              Login
            </Link>
          )}
          {user?.tipo !== "instituicao" && (
            <button
              onClick={() => handleHashNav("campaigns")}
              className="rounded-2xl bg-accent px-4 py-3 text-center font-bold text-white shadow-lg shadow-red-200"
            >
              Doe agora ♡
            </button>
          )}
        </div>
      </div>
    </>
  );
}
