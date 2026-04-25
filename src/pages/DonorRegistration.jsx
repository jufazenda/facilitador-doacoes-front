import { useState } from "react"
import { Link } from "react-router-dom"

export default function DonorRegistration() {
  const [form, setForm] = useState({ nome: "", email: "", cpf: "", senha: "", confirmarSenha: "", termos: false })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
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
            <Field label="CPF" id="cpf" type="text" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
            <Field label="Senha" id="senha" type="password" name="senha" value={form.senha} onChange={handleChange} placeholder="Mínimo 8 caracteres" />
            <Field label="Confirmar senha" id="confirmarSenha" type="password" name="confirmarSenha" value={form.confirmarSenha} onChange={handleChange} placeholder="Repita a senha" />

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

function Field({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink" htmlFor={id}>{label}</label>
      <input id={id} required {...props}
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
    </div>
  )
}
