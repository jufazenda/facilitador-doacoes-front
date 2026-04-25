import { useState } from "react"
import { Link } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    console.log("login:", { email, senha })
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-line p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink">Entrar</h1>
            <p className="text-sm text-muted mt-1">Acesse sua conta para gerenciar doações</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="E-mail" id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-ink" htmlFor="senha">Senha</label>
                <a href="#" className="text-xs text-primary hover:underline font-medium">Esqueci minha senha</a>
              </div>
              <input
                id="senha" type="password" required value={senha}
                onChange={(e) => setSenha(e.target.value)} placeholder="••••••••"
                className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
              />
            </div>

            <button type="submit"
              className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors">
              Entrar
            </button>
          </form>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-line" />
            <span className="text-xs text-muted">Não tem uma conta?</span>
            <hr className="flex-1 border-line" />
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/cadastro/doador"
              className="w-full text-center border border-line hover:border-primary text-ink text-sm font-semibold rounded-lg py-2.5 transition-colors hover:text-primary">
              Cadastrar como doador
            </Link>
            <Link to="/cadastro/instituicao"
              className="w-full text-center border border-line hover:border-primary text-ink text-sm font-semibold rounded-lg py-2.5 transition-colors hover:text-primary">
              Cadastrar minha instituição
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink" htmlFor={id}>{label}</label>
      <input id={id} required {...props}
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
    </div>
  )
}
