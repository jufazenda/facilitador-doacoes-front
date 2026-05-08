import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8 px-4 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-6 sm:p-8">

          <div className="text-center flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-ink">Entrar</h1>
            <p className="text-sm text-muted">Acesse sua conta para gerenciar doações</p>
          </div>

          <button
            onClick={login}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors"
          >
            Entrar com Auth0
          </button>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-line" />
            <span className="text-xs text-muted">Não tem uma conta?</span>
            <hr className="flex-1 border-line" />
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/cadastro/doador"
              className="w-full text-center border border-line hover:border-primary text-ink text-sm font-semibold rounded-lg py-2.5 transition-colors hover:text-primary"
            >
              Cadastrar como doador
            </Link>
            <Link
              to="/cadastro/instituicao"
              className="w-full text-center border border-line hover:border-primary text-ink text-sm font-semibold rounded-lg py-2.5 transition-colors hover:text-primary"
            >
              Cadastrar minha instituição
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
