import { useState } from "react"
import { campanhas as campanhasMock, categorias, instituicoes, necessidadesMock, atualizacoesMock, doacoesInstituicaoMock } from "../utils/mockData"

const TABS = ["Dashboard", "Campanhas", "Necessidades", "Atualizações"]

const STATUS_STYLES = {
  pendente:   { label: "Pendente",   classes: "bg-warning-light text-warning" },
  processado: { label: "Processado", classes: "bg-blue-100 text-blue-700" },
  confirmado: { label: "Confirmado", classes: "bg-secondary/10 text-secondary" },
  aplicado:   { label: "Aplicado",   classes: "bg-success-light text-success" },
}

export default function InstitutionArea() {
  const [tab, setTab] = useState("Dashboard")
  const instituicao = instituicoes[0]
  const [campas, setCampas] = useState(campanhasMock.filter((c) => c.instituicaoId === instituicao.id))
  const [necessidades, setNecessidades] = useState(necessidadesMock)
  const [atualizacoes, setAtualizacoes] = useState(atualizacoesMock)

  function toggleUrgenteC(id) { setCampas((prev) => prev.map((c) => c.id === id ? { ...c, urgente: !c.urgente } : c)) }
  function adicionarCampanha(nova) {
    setCampas((prev) => [{ ...nova, id: Date.now(), arrecadado: 0, urgente: false, instituicaoId: instituicao.id, instituicao: instituicao.nome }, ...prev])
  }
  function toggleUrgenteN(id) { setNecessidades((prev) => prev.map((n) => n.id === id ? { ...n, urgente: !n.urgente } : n)) }
  function atenderNecessidade(id) { setNecessidades((prev) => prev.map((n) => n.id === id ? { ...n, status: "atendida" } : n)) }
  function adicionarNecessidade(nova) {
    setNecessidades((prev) => [{ ...nova, id: Date.now(), status: "aberta", criadaEm: new Date().toISOString().slice(0, 10) }, ...prev])
  }
  function enviarAtualizacao(update) {
    const campanha = campas.find((c) => c.id === Number(update.campanhaId))
    setAtualizacoes((prev) => [{ ...update, id: Date.now(), campanha: campanha?.titulo ?? "", enviadaEm: new Date().toISOString().slice(0, 10) }, ...prev])
  }

  return (
    <div className="py-8 px-4 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">
            {instituicao.nome.split(" ").slice(0, 2).map((w) => w[0]).join("")}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">{instituicao.nome}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-light text-success">✓ Verificada</span>
          </div>
          <p className="text-sm text-muted">{instituicao.cidade}, {instituicao.estado}</p>
        </div>
      </div>

      <div className="flex border-b border-line gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Dashboard"    && <TabDashboard campas={campas} />}
      {tab === "Campanhas"    && <TabCampanhas campas={campas} onToggleUrgente={toggleUrgenteC} onAdicionar={adicionarCampanha} />}
      {tab === "Necessidades" && <TabNecessidades necessidades={necessidades} onToggleUrgente={toggleUrgenteN} onAtender={atenderNecessidade} onAdicionar={adicionarNecessidade} />}
      {tab === "Atualizações" && <TabAtualizacoes campas={campas} atualizacoes={atualizacoes} onEnviar={enviarAtualizacao} />}
    </div>
  )
}

function TabDashboard({ campas }) {
  const totalArrecadado = campas.reduce((s, c) => s + c.arrecadado, 0)
  const totalMeta = campas.reduce((s, c) => s + c.meta, 0)
  const percentual = totalMeta > 0 ? Math.round((totalArrecadado / totalMeta) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={totalArrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} label="Total arrecadado" />
        <StatCard value={`${percentual}%`} label="Da meta atingida" />
        <StatCard value={campas.length} label="Campanhas ativas" />
        <StatCard value={47} label="Doadores únicos" />
      </div>
      <div className="bg-white rounded-xl border border-line p-5 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-ink">Progresso geral das campanhas</span>
          <span className="text-primary font-bold">{percentual}%</span>
        </div>
        <div className="w-full bg-soft rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${percentual}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>{totalArrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          <span>Meta: {totalMeta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      </div>
      <div>
        <h2 className="text-base font-bold text-ink mb-3">Doações recentes</h2>
        <div className="bg-white rounded-xl border border-line divide-y divide-line">
          {doacoesInstituicaoMock.map((d) => {
            const s = STATUS_STYLES[d.status]
            return (
              <div key={d.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-ink">{d.doador}</span>
                  <span className="text-xs text-muted truncate">{d.campanha}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
                  <span className="text-sm font-bold text-ink">{d.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TabCampanhas({ campas, onToggleUrgente, onAdicionar }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: "", categoria: categorias[0], meta: "", descricao: "" })

  function handleChange(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })) }
  function handleSubmit(e) {
    e.preventDefault()
    onAdicionar({ ...form, meta: Number(form.meta) })
    setForm({ titulo: "", categoria: categorias[0], meta: "", descricao: "" })
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-lg transition-colors">
          {showForm ? "Cancelar" : "+ Nova campanha"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-line p-5 flex flex-col gap-4">
          <h3 className="text-base font-bold text-ink">Nova campanha</h3>
          <FormField label="Título" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Nome da campanha" />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Categoria</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}
                className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition">
                {categorias.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <FormField label="Meta (R$)" name="meta" type="number" value={form.meta} onChange={handleChange} placeholder="0" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">Descrição</label>
            <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} required
              placeholder="Descreva o objetivo desta campanha"
              className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition resize-none" />
          </div>
          <button type="submit" className="self-end bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
            Criar campanha
          </button>
        </form>
      )}
      {campas.map((c) => {
        const pct = Math.min(Math.round((c.arrecadado / c.meta) * 100), 100)
        return (
          <div key={c.id} className="bg-white rounded-xl border border-line p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">{c.categoria}</span>
                  {c.urgente && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-light text-accent">Urgente</span>}
                </div>
                <p className="text-sm font-bold text-ink mt-1">{c.titulo}</p>
              </div>
              <button onClick={() => onToggleUrgente(c.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors shrink-0 ${
                  c.urgente ? "border-accent/30 text-accent bg-accent-light hover:bg-accent/20" : "border-line text-muted hover:border-accent hover:text-accent"
                }`}>
                {c.urgente ? "Remover urgência" : "Marcar urgente"}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-full bg-soft rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>{c.arrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} arrecadados</span>
                <span>Meta: {c.meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · {pct}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TabNecessidades({ necessidades, onToggleUrgente, onAtender, onAdicionar }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: "", categoria: categorias[0], urgente: false })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }
  function handleSubmit(e) {
    e.preventDefault()
    onAdicionar(form)
    setForm({ titulo: "", categoria: categorias[0], urgente: false })
    setShowForm(false)
  }

  const abertas  = necessidades.filter((n) => n.status === "aberta")
  const atendidas = necessidades.filter((n) => n.status === "atendida")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-lg transition-colors">
          {showForm ? "Cancelar" : "+ Nova necessidade"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-line p-5 flex flex-col gap-4">
          <h3 className="text-base font-bold text-ink">Nova necessidade</h3>
          <FormField label="Descrição" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ex: 50 cobertores para o inverno" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">Categoria</label>
            <select name="categoria" value={form.categoria} onChange={handleChange}
              className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition">
              {[...categorias, "Vestuário", "Voluntariado"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-ink font-medium">
            <input type="checkbox" name="urgente" checked={form.urgente} onChange={handleChange} className="accent-accent" />
            Marcar como urgente
          </label>
          <button type="submit" className="self-end bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
            Adicionar necessidade
          </button>
        </form>
      )}
      {abertas.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Em aberto</p>
          {abertas.map((n) => <NeedItem key={n.id} n={n} onToggleUrgente={onToggleUrgente} onAtender={onAtender} />)}
        </div>
      )}
      {atendidas.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Atendidas</p>
          {atendidas.map((n) => <NeedItem key={n.id} n={n} onToggleUrgente={onToggleUrgente} onAtender={onAtender} />)}
        </div>
      )}
    </div>
  )
}

function NeedItem({ n, onToggleUrgente, onAtender }) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-3 ${n.status === "atendida" ? "border-line opacity-60" : "border-line"}`}>
      <div className="flex items-center gap-3 min-w-0">
        {n.urgente && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-ink">{n.titulo}</p>
          <p className="text-xs text-muted">{n.categoria} · {new Date(n.criadaEm).toLocaleDateString("pt-BR")}</p>
        </div>
      </div>
      {n.status === "aberta" && (
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onToggleUrgente(n.id)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors ${n.urgente ? "border-accent/30 text-accent bg-accent-light" : "border-line text-muted hover:border-accent hover:text-accent"}`}>
            {n.urgente ? "Urgente ✓" : "Urgente"}
          </button>
          <button onClick={() => onAtender(n.id)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-success/30 text-success bg-success-light hover:bg-success/20 font-semibold transition-colors">
            Atendida
          </button>
        </div>
      )}
      {n.status === "atendida" && <span className="text-xs text-success font-semibold shrink-0">✓ Atendida</span>}
    </div>
  )
}

function TabAtualizacoes({ campas, atualizacoes, onEnviar }) {
  const [form, setForm] = useState({ campanhaId: campas[0]?.id ?? "", titulo: "", mensagem: "" })
  const [enviado, setEnviado] = useState(false)

  function handleChange(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })) }
  function handleSubmit(e) {
    e.preventDefault()
    onEnviar(form)
    setForm({ campanhaId: campas[0]?.id ?? "", titulo: "", mensagem: "" })
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-line p-5 flex flex-col gap-4">
        <h3 className="text-base font-bold text-ink">Enviar atualização aos doadores</h3>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Campanha</label>
          <select name="campanhaId" value={form.campanhaId} onChange={handleChange}
            className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition">
            {campas.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
        </div>
        <FormField label="Título" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ex: Meta 80% atingida!" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-ink">Mensagem</label>
          <textarea name="mensagem" value={form.mensagem} onChange={handleChange} rows={4} required
            placeholder="Conte aos doadores como está o progresso da campanha..."
            className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition resize-none" />
        </div>
        <div className="flex items-center justify-between">
          {enviado && <span className="text-sm text-success font-semibold">✓ Atualização enviada!</span>}
          <button type="submit" className="ml-auto bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
            Enviar para doadores
          </button>
        </div>
      </form>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold text-muted uppercase tracking-wide">Atualizações enviadas</p>
        {atualizacoes.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-line p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-ink">{a.titulo}</p>
              <span className="text-xs text-muted shrink-0">{new Date(a.enviadaEm).toLocaleDateString("pt-BR")}</span>
            </div>
            <p className="text-xs text-muted">{a.campanha}</p>
            <p className="text-sm text-muted leading-relaxed">{a.mensagem}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-xl border border-line p-4 text-center">
      <p className="text-xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  )
}

function FormField({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
    </div>
  )
}
