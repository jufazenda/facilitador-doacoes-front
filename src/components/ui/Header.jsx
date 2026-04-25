import { Link } from "react-router-dom"

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="text-green-600 font-bold text-xl">
          Facilitador de Doações
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-green-600 transition-colors">Campanhas</Link>
          <Link to="/instituicoes" className="hover:text-green-600 transition-colors">Instituições</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Cadastrar
          </Link>
        </div>

      </div>
    </header>
  )
}