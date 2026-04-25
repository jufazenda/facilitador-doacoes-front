import { useState } from "react"
import { Link } from "react-router-dom"

export default function InstitutionRegistration() {
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "", cidade: "", estado: "", descricao: "", senha: "", confirmarSenha: "", termos: false })
  const [arquivo, setArquivo] = useState(null)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log("cadastro instituição:", form, arquivo)
  }

  return (
    <div className="flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl border border-line p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink">Cadastrar instituição</h1>
            <p className="text-sm text-muted mt-1">Após o cadastro, sua conta será analisada pela nossa equipe</p>
          </div>

          <div className="bg-warning-light border border-warning/30 rounded-lg px-4 py-3 text-sm text-ink">
            Sua instituição só aparecerá publicamente após a verificação dos documentos pelo nosso time.
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">Dados da instituição</p>
            <Field label="Nome da instituição" id="nome" name="nome" type="text" value={form.nome} onChange={handleChange} placeholder="Nome oficial da ONG ou entidade" />
            <Field label="CNPJ" id="cnpj" name="cnpj" type="text" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" />
            <Field label="E-mail institucional" id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="contato@instituicao.org" />
            <Field label="Telefone" id="telefone" name="telefone" type="tel" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cidade" id="cidade" name="cidade" type="text" value={form.cidade} onChange={handleChange} placeholder="São Paulo" />
              <Field label="Estado" id="estado" name="estado" type="text" value={form.estado} onChange={handleChange} placeholder="SP" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink" htmlFor="descricao">Descrição</label>
              <textarea id="descricao" name="descricao" required rows={3} value={form.descricao} onChange={handleChange}
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
            <Field label="Senha" id="senha" name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="Mínimo 8 caracteres" />
            <Field label="Confirmar senha" id="confirmarSenha" name="confirmarSenha" type="password" value={form.confirmarSenha} onChange={handleChange} placeholder="Repita a senha" />

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

function Field({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink" htmlFor={id}>{label}</label>
      <input id={id} required {...props}
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
    </div>
  )
}
