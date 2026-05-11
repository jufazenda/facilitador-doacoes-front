import { Link } from "react-router-dom"
import logo from "../../assets/logo.png"

const LINKS = [
  { label: "Campanhas",      href: "/#campaigns",    external: true  },
  { label: "Instituições",   href: "/instituicoes",  external: false },
  { label: "Como funciona?", href: "/#how-it-works", external: true  },
  { label: "Sobre nós",      href: "/sobre-nos",     external: false },
]

export default function Footer() {
  return (
    <footer className="bg-purple-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">

        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Faz a Boa" className="h-10 w-auto drop-shadow-md" />
              <span className="text-xl font-black tracking-tight">Faz a Boa</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-purple-300">
              Conectamos doadores com instituições que transformam vidas.
            </p>
          </div>

          {/* Links */}
          <nav className="grid grid-cols-2 gap-x-12 gap-y-4">
            {LINKS.map(({ label, href, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-semibold text-purple-200 transition-colors hover:text-white"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  to={href}
                  className="text-sm font-semibold text-purple-200 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              )
            )}
          </nav>

        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-purple-800 pt-6 sm:flex-row">
          <p className="text-xs text-purple-400">© 2026 Faz a Boa. Todos os direitos reservados.</p>
          <p className="text-xs text-purple-500">Informática Biomédica · UFCSPA</p>
        </div>

      </div>
    </footer>
  )
}
