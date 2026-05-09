import { useState, useEffect } from "react"
import { useApiClient } from "../hooks/useApiClient"
import { getMyInstitution } from "../services/institutions"
import { getCampaignsByInstitution, createCampaign, updateCampaign } from "../services/campaigns"
import { getNecessitiesByInstitution, createNecessity, updateNecessity, updateNecessityStatus } from "../services/necessities"
import { getDonations } from "../services/donations"
import { categorias, atualizacoesMock } from "../utils/mockData"

const ABAS = ["Dashboard", "Campanhas", "Necessidades", "Atualizações"]

const STATUS_DOACAO = {
  pendente:   { label: "Pendente",   classes: "bg-warning-light text-warning" },
  processado: { label: "Processado", classes: "bg-blue-100 text-blue-700" },
  confirmado: { label: "Confirmado", classes: "bg-secondary/10 text-secondary" },
  aplicado:   { label: "Aplicado",   classes: "bg-success-light text-success" },
}

const STATUS_INST = {
  approved: { label: "✓ Verificada", classes: "bg-success-light text-success" },
  pending:  { label: "Em análise",   classes: "bg-warning-light text-warning" },
  rejected: { label: "Rejeitada",    classes: "bg-red-100 text-red-700" },
}

export default function InstitutionArea() {
  const [aba, setAba] = useState("Dashboard")
  const [instituicao, setInstituicao] = useState(null)
  const [campanhas, setCampanhas] = useState([])
  const [necessidades, setNecessidades] = useState([])
  const [doacoes, setDoacoes] = useState([])
  const [atualizacoes, setAtualizacoes] = useState(atualizacoesMock)
  const [loading, setLoading] = useState(true)
  const client = useApiClient()

  useEffect(() => {
    async function load() {
      try {
        const inst = await getMyInstitution(client)
        setInstituicao(inst)
        const [camps, necess, allDoacoes] = await Promise.all([
          getCampaignsByInstitution(inst.id).catch(() => []),
          getNecessitiesByInstitution(inst.id).catch(() => []),
          getDonations().catch(() => []),
        ])
        setCampanhas(camps ?? [])
        setNecessidades(necess ?? [])
        setDoacoes((allDoacoes ?? []).filter((d) => d.institution_id === inst.id))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [client])

  async function toggleUrgenteC(campanha) {
    const updated = await updateCampaign(client, campanha.id, {
      title:       campanha.title,
      description: campanha.description,
      goal_amount: campanha.goal_amount,
      category:    campanha.category,
      is_urgent:   !campanha.is_urgent,
    })
    setCampanhas((prev) => prev.map((c) => c.id === campanha.id ? updated : c))
  }

  async function adicionarCampanha(form) {
    const nova = await createCampaign(client, instituicao.id, {
      title:       form.titulo,
      description: form.descricao,
      goal_amount: Math.round(Number(form.meta) * 100),
      category:    form.categoria,
    })
    setCampanhas((prev) => [nova, ...prev])
  }

  async function toggleUrgenteN(necessidade) {
    const updated = await updateNecessity(client, necessidade.id, {
      description: necessidade.description,
      category:    necessidade.category,
      is_urgent:   !necessidade.is_urgent,
    })
    setNecessidades((prev) => prev.map((n) => n.id === necessidade.id ? updated : n))
  }

  async function atenderNecessidade(id) {
    const updated = await updateNecessityStatus(client, id, "attended")
    setNecessidades((prev) => prev.map((n) => n.id === id ? updated : n))
  }

  async function adicionarNecessidade(form) {
    const nova = await createNecessity(client, instituicao.id, {
      description: form.titulo,
      category:    form.categoria,
      is_urgent:   form.urgente,
    })
    setNecessidades((prev) => [nova, ...prev])
  }

  function enviarAtualizacao(update) {
    const campanha = campanhas.find((c) => c.id === update.campanhaId)
    setAtualizacoes((prev) => [{
      ...update,
      id:        Date.now(),
      campanha:  campanha?.title ?? "",
      enviadaEm: new Date().toISOString().slice(0, 10),
    }, ...prev])
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted text-sm">Carregando...</p>
      </div>
    )
  }

  const statusInst = STATUS_INST[instituicao?.status] ?? STATUS_INST.pending
  const iniciais = (instituicao?.name ?? "?").split(" ").slice(0, 2).map((w) => w[0]).join("")

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">{iniciais}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-ink">{instituicao?.name}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInst.classes}`}>
              {statusInst.label}
            </span>
          </div>
          {instituicao?.address && (
            <p className="text-sm text-muted">{instituicao.address}</p>
          )}
        </div>
      </div>

      <div className="flex border-b border-line gap-1 overflow-x-auto">
        {ABAS.map((t) => (
          <button key={t} onClick={() => setAba(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
              aba === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {aba === "Dashboard"    && <AbaDashboard campanhas={campanhas} doacoes={doacoes} />}
      {aba === "Campanhas"    && <AbaCampanhas campanhas={campanhas} onToggleUrgente={toggleUrgenteC} onAdicionar={adicionarCampanha} />}
      {aba === "Necessidades" && <AbaNecessidades necessidades={necessidades} onToggleUrgente={toggleUrgenteN} onAtender={atenderNecessidade} onAdicionar={adicionarNecessidade} />}
      {aba === "Atualizações" && <AbaAtualizacoes campanhas={campanhas} atualizacoes={atualizacoes} onEnviar={enviarAtualizacao} />}
    </div>
  )
}

function AbaDashboard({ campanhas, doacoes }) {
  const totalArrecadado = campanhas.reduce((s, c) => s + (c.total_raised ?? 0), 0) / 100
  const totalMeta       = campanhas.reduce((s, c) => s + (c.goal_amount ?? 0), 0) / 100
  const percentual      = totalMeta > 0 ? Math.round((totalArrecadado / totalMeta) * 100) : 0
  const ativas          = campanhas.filter((c) => c.status === "active").length
  const doadores        = new Set(doacoes.map((d) => d.user_id)).size

  const campanhasMap = Object.fromEntries(campanhas.map((c) => [c.id, c]))
  const recentes = [...doacoes]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard value={totalArrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} label="Total arrecadado" />
        <StatCard value={`${percentual}%`} label="Da meta atingida" />
        <StatCard value={ativas} label="Campanhas ativas" />
        <StatCard value={doadores} label="Doadores únicos" />
      </div>

      <div className="bg-white rounded-xl border border-line p-5 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-ink">Progresso geral das campanhas</span>
          <span className="text-primary font-bold">{percentual}%</span>
        </div>
        <div className="w-full bg-soft rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${Math.min(percentual, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>{totalArrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          <span>Meta: {totalMeta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-ink mb-3">Doações recentes</h2>
        {recentes.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma doação recebida ainda.</p>
        ) : (
          <div className="bg-white rounded-xl border border-line divide-y divide-line">
            {recentes.map((d) => {
              const s = STATUS_DOACAO[d.status] ?? { label: d.status, classes: "bg-soft text-muted" }
              const camp = d.campaign_id ? campanhasMap[d.campaign_id] : null
              return (
                <div key={d.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-ink">Doador</span>
                    <span className="text-xs text-muted truncate">{camp?.title ?? "Doação avulsa"}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
                    <span className="text-sm font-bold text-ink">
                      {((d.amount ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function AbaCampanhas({ campanhas, onToggleUrgente, onAdicionar }) {
  const [showForm, setShowForm] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({ titulo: "", categoria: categorias[0], meta: "", descricao: "" })

  function handleChange(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await onAdicionar(form)
      setForm({ titulo: "", categoria: categorias[0], meta: "", descricao: "" })
      setShowForm(false)
    } finally {
      setEnviando(false)
    }
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <button type="submit" disabled={enviando}
            className="self-end bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
            {enviando ? "Criando..." : "Criar campanha"}
          </button>
        </form>
      )}

      {campanhas.map((c) => {
        const pct = c.goal_amount > 0 ? Math.min(Math.round((c.total_raised / c.goal_amount) * 100), 100) : 0
        return (
          <div key={c.id} className="bg-white rounded-xl border border-line p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">{c.category}</span>
                  {c.is_urgent && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-light text-accent">Urgente</span>}
                </div>
                <p className="text-sm font-bold text-ink mt-1">{c.title}</p>
              </div>
              <button onClick={() => onToggleUrgente(c)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors shrink-0 ${
                  c.is_urgent
                    ? "border-accent/30 text-accent bg-accent-light hover:bg-accent/20"
                    : "border-line text-muted hover:border-accent hover:text-accent"
                }`}>
                {c.is_urgent ? "Remover urgência" : "Marcar urgente"}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-full bg-soft rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>{(c.total_raised / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} arrecadados</span>
                <span>Meta: {(c.goal_amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · {pct}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AbaNecessidades({ necessidades, onToggleUrgente, onAtender, onAdicionar }) {
  const [showForm, setShowForm] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({ titulo: "", categoria: categorias[0], urgente: false })

  function handleMudanca(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function handleSubmeter(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await onAdicionar(form)
      setForm({ titulo: "", categoria: categorias[0], urgente: false })
      setShowForm(false)
    } finally {
      setEnviando(false)
    }
  }

  const abertas   = necessidades.filter((n) => n.status === "open")
  const atendidas = necessidades.filter((n) => n.status === "attended")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-lg transition-colors">
          {showForm ? "Cancelar" : "+ Nova necessidade"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmeter} className="bg-white rounded-xl border border-line p-5 flex flex-col gap-4">
          <h3 className="text-base font-bold text-ink">Nova necessidade</h3>
          <FormField label="Descrição" name="titulo" value={form.titulo} onChange={handleMudanca} placeholder="Ex: 50 cobertores para o inverno" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">Categoria</label>
            <select name="categoria" value={form.categoria} onChange={handleMudanca}
              className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition">
              {[...categorias, "Vestuário", "Voluntariado"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-ink font-medium">
            <input type="checkbox" name="urgente" checked={form.urgente} onChange={handleMudanca} className="accent-accent" />
            Marcar como urgente
          </label>
          <button type="submit" disabled={enviando}
            className="self-end bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
            {enviando ? "Adicionando..." : "Adicionar necessidade"}
          </button>
        </form>
      )}

      {abertas.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Em aberto</p>
          {abertas.map((n) => (
            <ItemNecessario key={n.id} n={n} onToggleUrgente={onToggleUrgente} onAtender={onAtender} />
          ))}
        </div>
      )}
      {atendidas.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Atendidas</p>
          {atendidas.map((n) => (
            <ItemNecessario key={n.id} n={n} onToggleUrgente={onToggleUrgente} onAtender={onAtender} />
          ))}
        </div>
      )}
      {necessidades.length === 0 && (
        <p className="text-sm text-muted text-center py-4">Nenhuma necessidade cadastrada ainda.</p>
      )}
    </div>
  )
}

function ItemNecessario({ n, onToggleUrgente, onAtender }) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-3 ${n.status === "attended" ? "border-line opacity-60" : "border-line"}`}>
      <div className="flex items-center gap-3 min-w-0">
        {n.is_urgent && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-ink">{n.description}</p>
          <p className="text-xs text-muted">{n.category} · {new Date(n.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
      </div>
      {n.status === "open" && (
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onToggleUrgente(n)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors ${
              n.is_urgent
                ? "border-accent/30 text-accent bg-accent-light"
                : "border-line text-muted hover:border-accent hover:text-accent"
            }`}>
            {n.is_urgent ? "Urgente ✓" : "Urgente"}
          </button>
          <button onClick={() => onAtender(n.id)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-success/30 text-success bg-success-light hover:bg-success/20 font-semibold transition-colors">
            Atendida
          </button>
        </div>
      )}
      {n.status === "attended" && (
        <span className="text-xs text-success font-semibold shrink-0">✓ Atendida</span>
      )}
    </div>
  )
}

function AbaAtualizacoes({ campanhas, atualizacoes, onEnviar }) {
  const [form, setForm] = useState({ campanhaId: campanhas[0]?.id ?? "", titulo: "", mensagem: "" })
  const [enviado, setEnviado] = useState(false)

  function handleMudanca(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })) }

  function handleSubmeter(e) {
    e.preventDefault()
    onEnviar(form)
    setForm({ campanhaId: campanhas[0]?.id ?? "", titulo: "", mensagem: "" })
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmeter} className="bg-white rounded-xl border border-line p-5 flex flex-col gap-4">
        <h3 className="text-base font-bold text-ink">Enviar atualização aos doadores</h3>
        {campanhas.length === 0 ? (
          <p className="text-sm text-muted">Crie uma campanha primeiro para enviar atualizações.</p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Campanha</label>
              <select name="campanhaId" value={form.campanhaId} onChange={handleMudanca}
                className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition">
                {campanhas.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <FormField label="Título" name="titulo" value={form.titulo} onChange={handleMudanca} placeholder="Ex: Meta 80% atingida!" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Mensagem</label>
              <textarea name="mensagem" value={form.mensagem} onChange={handleMudanca} rows={4} required
                placeholder="Conte aos doadores como está o progresso da campanha..."
                className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition resize-none" />
            </div>
            <div className="flex items-center justify-between">
              {enviado && <span className="text-sm text-success font-semibold">✓ Atualização enviada!</span>}
              <button type="submit" className="ml-auto bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
                Enviar para doadores
              </button>
            </div>
          </>
        )}
      </form>

      {atualizacoes.length > 0 && (
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
      )}
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
