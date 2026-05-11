import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { useApiClient } from "../hooks/useApiClient"
import { createUser } from "../services/users"

const PENDING_KEY = "pending_donor_registration"

function mascararCpf(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

export default function DonorRegistration() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const client = useApiClient()
  const navigate = useNavigate()

  const [form, setForm] = useState({ nome: "", email: "", cpf: "", termos: false })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")

  // Após voltar do Auth0, completa o cadastro com os dados salvos
  useEffect(() => {
    if (!isAuthenticated || isLoading) return

    const pendente = localStorage.getItem(PENDING_KEY)
    if (!pendente) return

    const dados = JSON.parse(pendente)
    localStorage.removeItem(PENDING_KEY)

    setEnviando(true)
    createUser(client, dados)
      .then(() => navigate("/area/doador"))
      .catch((err) => {
        const msg = err?.response?.data?.error
        setErro(msg === "email already in use" ? "Este e-mail já está cadastrado." : "Erro ao criar conta. Tente novamente.")
        setEnviando(false)
      })
  }, [isAuthenticated, isLoading])

  function handleMudanca(e) {
    const { name, value, type, checked } = e.target
    const valor = name === "cpf" ? mascararCpf(value) : value
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : valor }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const dados = {
      name:  form.nome,
      email: form.email,
      cpf:   form.cpf.replace(/\D/g, ""),
      role:  "donor",
    }

    localStorage.setItem(PENDING_KEY, JSON.stringify(dados))

    loginWithRedirect({
      authorizationParams: { screen_hint: "signup" },
      appState: { returnTo: "/cadastro/doador" },
    })
  }

  if (isLoading || enviando) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted text-sm">{enviando ? "Criando sua conta..." : "Carregando..."}</p>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8 px-4 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5 sm:p-8 sm:gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink">Criar conta como doador</h1>
            <p className="text-sm text-muted mt-1">Acompanhe suas doações e faça a diferença</p>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Campo label="Nome completo" id="nome" name="nome" type="text"
              value={form.nome} onChange={handleMudanca} placeholder="Seu nome completo" />
            <Campo label="E-mail" id="email" name="email" type="email"
              value={form.email} onChange={handleMudanca} placeholder="seu@email.com" />
            <Campo label="CPF" id="cpf" name="cpf" type="text" inputMode="numeric"
              value={form.cpf} onChange={handleMudanca} placeholder="000.000.000-00" />

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" name="termos" checked={form.termos}
                onChange={handleMudanca} required className="mt-0.5 accent-primary" />
              <span className="text-xs text-muted">
                Concordo com os{" "}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a>{" "}
                e a{" "}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <button type="submit"
              className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors">
              Criar conta
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Campo({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink" htmlFor={id}>{label}</label>
      <input id={id} required {...props}
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
    </div>
  )
}
