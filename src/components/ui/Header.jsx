import { Link, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"

const TIPO_LABEL = { doador: "Doador", instituicao: "Instituição", admin: "Admin" }

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-purple-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-3 text-2xl font-extrabold text-purple-800"
        >
          <span className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-2xl border-2 border-purple-700 text-xl text-[#FF5C5C]">
            ♡
          </span>
          Elo Solidário
        </Link>

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

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="hidden sm:flex items-center gap-2 rounded-2xl border border-purple-100 bg-white px-4 py-2 font-semibold text-purple-950 hover:bg-purple-50 transition"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-700 text-xs font-bold text-white">
                  {user.nome[0]}
                </span>
                <span className="text-sm">{user.nome.split(" ")[0]}</span>
                <span className="text-xs text-purple-400">▾</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-purple-100 bg-white py-2 shadow-xl shadow-purple-950/10">
                  <p className="px-4 py-1 text-xs text-slate-400">{TIPO_LABEL[user.tipo]}</p>
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
              className="hidden font-semibold text-purple-950 sm:block"
            >
              Login
            </Link>
          )}

          <a
            href="/#campaigns"
            className="rounded-2xl bg-[#FF5C5C] px-5 py-3 font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5"
          >
            Doe agora ♡
          </a>
        </div>
      </div>
    </header>
  );
}
