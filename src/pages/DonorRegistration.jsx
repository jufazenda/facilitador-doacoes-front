import { useState } from "react"
import { Link } from "react-router-dom"

function maskCpf(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

export default function DonorRegistration() {
  const [form, setForm] = useState({ nome: "", email: "", cpf: "", senha: "", confirmarSenha: "", termos: false })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    const masked = name === "cpf" ? maskCpf(value) : value
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : masked }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log("cadastro doador:", form)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8 px-4 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5 sm:p-8 sm:gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink">Criar conta como doador</h1>
            <p className="text-sm text-muted mt-1">Acompanhe suas doações e faça a diferença</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Nome completo" id="nome" type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome completo" />
            <Field label="E-mail" id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" />
            <Field label="CPF" id="cpf" type="text" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" inputMode="numeric" />
            <PasswordField label="Senha" id="senha" name="senha" value={form.senha} onChange={handleChange} placeholder="Mínimo 8 caracteres" />
            <PasswordField label="Confirmar senha" id="confirmarSenha" name="confirmarSenha" value={form.confirmarSenha} onChange={handleChange} placeholder="Repita a senha" />

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" name="termos" checked={form.termos} onChange={handleChange} required className="mt-0.5 accent-primary" />
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

function Field({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink" htmlFor={id}>{label}</label>
      <input id={id} required {...props}
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
    </div>
  )
}

function PasswordField({ label, id, ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} required type={show ? "text" : "password"} {...props}
          className="w-full rounded-lg border border-line px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
        <button type="button" onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  )
}
