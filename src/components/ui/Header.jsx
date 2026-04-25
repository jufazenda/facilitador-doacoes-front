import { Link } from "react-router-dom"
import { useState, useRef, useEffect } from "react"

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="bg-white border-b border-line sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="text-primary font-bold text-xl font-heading">
          Facilitador de Doações
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
          <Link to="/" className="hover:text-primary transition-colors font-medium">Campanhas</Link>
          <Link to="/instituicoes" className="hover:text-primary transition-colors font-medium">Instituições</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted hover:text-primary transition-colors font-semibold">
            Entrar
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="text-sm bg-accent hover:bg-[#e54b4b] text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              Cadastrar
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-line shadow-lg py-1 z-50">
                <Link
                  to="/cadastro/doador"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-sm text-ink hover:bg-soft hover:text-primary transition-colors"
                >
                  Sou doador
                </Link>
                <Link
                  to="/cadastro/instituicao"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-sm text-ink hover:bg-soft hover:text-primary transition-colors"
                >
                  Sou uma instituição
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
