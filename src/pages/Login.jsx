import { useAuth } from "../context/AuthContext"

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border border-line p-8 flex flex-col gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-ink">Entrar</h1>
            <p className="text-sm text-muted">
              Acesse sua conta ou crie uma nova para começar a fazer a diferença
            </p>
          </div>

          <button
            onClick={login}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors"
          >
            Entrar com Auth0
          </button>

          <p className="text-xs text-muted">
            Não tem conta? Clique no botão acima e escolha "Sign up" na tela do Auth0.
          </p>
        </div>
      </div>
    </div>
  )
}
