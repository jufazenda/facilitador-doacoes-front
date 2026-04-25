import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Eye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

const MOCK_USERS = [
  { email: "doador@email.com",      senha: "123456", tipo: "doador",      nome: "Maria Silva",       rota: "/area/doador" },
  { email: "instituicao@email.com", senha: "123456", tipo: "instituicao", nome: "Associação Passos de Luz", rota: "/area/instituicao" },
  { email: "admin@email.com",       senha: "123456", tipo: "admin",       nome: "Admin",             rota: "/area/admin" },
]

export default function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()

  function handleSubmit(e) {
    e.preventDefault()
    const found = MOCK_USERS.find((u) => u.email === email && u.senha === senha)
    if (found) {
      const { senha: _, ...userData } = found
      login(userData)
      navigate(found.rota)
    } else {
      setErro("E-mail ou senha inválidos.")
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8 px-4 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5 sm:p-8 sm:gap-6">
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
              <div className="relative">
                <input
                  id="senha" type={showSenha ? "text" : "password"} required value={senha}
                  onChange={(e) => setSenha(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-lg border border-line px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                />
                <button type="button" onClick={() => setShowSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}>
                  {showSenha ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {erro && <p className="text-sm text-accent font-semibold">{erro}</p>}
            <button type="submit"
              className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors">
              Entrar
            </button>
            <div className="text-xs text-muted bg-soft rounded-lg px-3 py-2 flex flex-col gap-0.5">
              <p className="font-semibold text-ink mb-1">Credenciais de teste:</p>
              <p>doador@email.com · 123456</p>
              <p>instituicao@email.com · 123456</p>
              <p>admin@email.com · 123456</p>
            </div>
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
