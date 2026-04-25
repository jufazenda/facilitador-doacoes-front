import { useState } from "react"
import { Link } from "react-router-dom"

function mascararCnpj(v) {
  return v
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
}

export default function InstituicaoCadastro() {
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "", cidade: "", estado: "", descricao: "", senha: "", confirmarSenha: "", termos: false })
  const [arquivo, setArquivo] = useState(null)

  function handleMudanca(e) {
    const { name: nome, value: valor, type: tipo, checked: marcado } = e.target
    const mascarado = nome === "cnpj" ? mascararCnpj(valor) : valor
    setForm((prev) => ({ ...prev, [nome]: tipo === "checkbox" ? marcado : mascarado }))
  }

  function handleSubmeter(e) {
    e.preventDefault()
    console.log("cadastro instituição:", form, arquivo)
  }

  return (
    <div className="flex items-start justify-center py-8 px-4 sm:py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5 sm:p-8 sm:gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink">Cadastrar instituição</h1>
            <p className="text-sm text-muted mt-1">Após o cadastro, sua conta será analisada pela nossa equipe</p>
          </div>

          <div className="bg-warning-light border border-warning/30 rounded-lg px-4 py-3 text-sm text-ink">
            Sua instituição só aparecerá publicamente após a verificação dos documentos pelo nosso time.
          </div>

          <form onSubmit={handleSubmeter} className="flex flex-col gap-4">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">Dados da instituição</p>
            <Campo label="Nome da instituição" id="nome" name="nome" type="text" value={form.nome} onChange={handleMudanca} placeholder="Nome oficial da ONG ou entidade" />
            <Campo label="CNPJ" id="cnpj" name="cnpj" type="text" value={form.cnpj} onChange={handleMudanca} placeholder="00.000.000/0000-00" inputMode="numeric" />
            <Campo label="E-mail institucional" id="email" name="email" type="email" value={form.email} onChange={handleMudanca} placeholder="contato@instituicao.org" />
            <Campo label="Telefone" id="telefone" name="telefone" type="tel" value={form.telefone} onChange={handleMudanca} placeholder="(00) 00000-0000" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo label="Cidade" id="cidade" name="cidade" type="text" value={form.cidade} onChange={handleMudanca} placeholder="São Paulo" />
              <Campo label="Estado" id="estado" name="estado" type="text" value={form.estado} onChange={handleMudanca} placeholder="SP" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink" htmlFor="descricao">Descrição</label>
              <textarea id="descricao" name="descricao" required rows={3} value={form.descricao} onChange={handleMudanca}
                placeholder="Descreva a missão e o trabalho da sua instituição"
                className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Documento de verificação</label>
              <p className="text-xs text-muted">Envie o cartão CNPJ ou estatuto social (PDF, JPG ou PNG)</p>
              <label className="flex items-center justify-center gap-2 border border-dashed border-line rounded-lg py-4 cursor-pointer hover:border-primary transition-colors text-sm text-muted">
                <span>{arquivo ? arquivo.name : "Clique para selecionar o arquivo"}</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setArquivo(e.target.files[0] ?? null)} required />
              </label>
            </div>

            <p className="text-xs font-bold text-muted uppercase tracking-wide mt-2">Dados de acesso</p>
            <CampoSenha label="Senha" id="senha" name="senha" value={form.senha} onChange={handleMudanca} placeholder="Mínimo 8 caracteres" />
            <CampoSenha label="Confirmar senha" id="confirmarSenha" name="confirmarSenha" value={form.confirmarSenha} onChange={handleMudanca} placeholder="Repita a senha" />

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" name="termos" checked={form.termos} onChange={handleMudanca} required className="mt-0.5 accent-primary" />
              <span className="text-xs text-muted">
                Concordo com os{" "}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a>{" "}
                e a{" "}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <button type="submit"
              className="mt-2 w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors">
              Enviar para verificação
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

function Visivel() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function Oculto() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
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

function CampoSenha({ label, id, ...props }) {
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
          {show ? <Oculto /> : <Visivel />}
        </button>
      </div>
    </div>
  )
}
