import { Link } from "react-router-dom"
import logo from "../../assets/logo.png"

const LINKS = [
  { label: "Campanhas",      href: "/#campaigns",    external: true  },
  { label: "Instituições",   href: "/instituicoes",  external: false },
  { label: "Como funciona?", href: "/#how-it-works", external: true  },
  { label: "Sobre nós",      href: "/sobre-nos",     external: false },
]

function NavLink({ label, href, external }) {
  const cls = "group relative text-sm font-semibold text-purple-300 transition-colors duration-200 hover:text-white"
  const inner = (
    <>
      {label}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white/60 transition-all duration-300 group-hover:w-full" />
    </>
  )
  return external
    ? <a href={href} className={cls}>{inner}</a>
    : <Link to={href} className={cls}>{inner}</Link>
}

export default function Footer() {
  return (
    <footer className="bg-purple-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">

        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">

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
          <nav className="flex flex-col gap-4 sm:items-end">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-500">Links</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 sm:flex-col sm:items-end sm:gap-3">
              {LINKS.map((link) => <NavLink key={link.label} {...link} />)}
            </div>
          </nav>

        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-purple-800/60 pt-6 sm:flex-row">
          <p className="text-xs text-purple-500">© 2026 Faz a Boa. Todos os direitos reservados.</p>
          <p className="text-xs text-purple-600">Informática Biomédica · UFCSPA</p>
        </div>

      </div>
    </footer>
  )
}
