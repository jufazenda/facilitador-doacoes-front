import { useState, useEffect } from "react"
import { useApiClient } from "../hooks/useApiClient"
import { getMyInstitution, updateInstitution } from "../services/institutions"
import { getCampaignsByInstitution, createCampaign, updateCampaign, deleteCampaign } from "../services/campaigns"
import { getNecessitiesByInstitution, createNecessity, updateNecessity, updateNecessityStatus } from "../services/necessities"
import { getDonations } from "../services/donations"
import { categories, slugify, DONATION_STATUS } from "../utils/staticData"
import { updatesMock } from "../utils/mockData"
import { maskCnpj } from "../utils/masks"
import { getInitials } from "../utils/strings"
import Select from "../components/ui/Select"
import FormField from "../components/ui/FormField"
import Textarea from "../components/ui/Textarea"
import Loading from "../components/ui/Loading"
import StatCard from "../components/ui/StatCard"
import TabBar from "../components/ui/TabBar"
import InfoLinha from "../components/ui/InfoLinha"
import { useToast } from "../hooks/useToast"

const TABS = ["Dashboard", "Perfil", "Campanhas", "Necessidades", "Atualizações"]

const INSTITUTION_STATUS = {
  approved: { label: "✓ Verificada", classes: "bg-success-light text-success" },
  pending:  { label: "Em análise",   classes: "bg-warning-light text-warning" },
  rejected: { label: "Rejeitada",    classes: "bg-red-100 text-red-700" },
}

export default function InstitutionArea() {
  const [tab, setTab] = useState("Dashboard")
  const [institution, setInstitution] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [necessities, setNecessities] = useState([])
  const [donations, setDonations] = useState([])
  const [updates, setUpdates] = useState(updatesMock)
  const [loading, setLoading] = useState(true)
  const client = useApiClient()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const inst = await getMyInstitution(client)
        setInstitution(inst)
        const [camps, necess, allDonations] = await Promise.all([
          getCampaignsByInstitution(inst.id).catch(() => []),
          getNecessitiesByInstitution(inst.id).catch(() => []),
          getDonations().catch(() => []),
        ])
        setCampaigns(camps ?? [])
        setNecessities(necess ?? [])
        setDonations((allDonations ?? []).filter((d) => d.institution_id === inst.id))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [client])

  async function toggleUrgentCampaign(campaign) {
    const updated = await updateCampaign(client, campaign.id, {
      title:       campaign.title,
      description: campaign.description,
      goal_amount: campaign.goal_amount,
      category:    campaign.category,
      is_urgent:   !campaign.is_urgent,
    })
    setCampaigns((prev) => prev.map((c) => c.id === campaign.id ? updated : c))
  }

  async function addCampaign(form) {
    const nova = await createCampaign(client, institution.id, {
      title:       form.title,
      description: form.description,
      goal_amount: Math.round(Number(form.goal) * 100),
      keywords:    [slugify(form.category)],
    })
    setCampaigns((prev) => [nova, ...prev])
  }

  async function editCampaign(id, form) {
    const campaign = campaigns.find((c) => c.id === id)
    const updated = await updateCampaign(client, id, {
      title:       form.title,
      description: form.description,
      goal_amount: Math.round(Number(form.goal) * 100),
      keywords:    [slugify(form.category)],
      category:    form.category,
      is_urgent:   campaign?.is_urgent ?? false,
    })
    setCampaigns((prev) => prev.map((c) => c.id === id ? updated : c))
  }

  async function handleDeleteCampaign(id) {
    await deleteCampaign(client, id)
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  async function toggleUrgentNecessity(necessity) {
    const updated = await updateNecessity(client, necessity.id, {
      description: necessity.description,
      category:    necessity.category,
      is_urgent:   !necessity.is_urgent,
    })
    setNecessities((prev) => prev.map((n) => n.id === necessity.id ? updated : n))
  }

  async function attendNecessity(id) {
    const updated = await updateNecessityStatus(client, id, "attended")
    setNecessities((prev) => prev.map((n) => n.id === id ? updated : n))
  }

  async function addNecessity(form) {
    const nova = await createNecessity(client, institution.id, {
      description: form.title,
      category:    form.category,
      is_urgent:   form.urgent,
    })
    setNecessities((prev) => [nova, ...prev])
  }

  function sendUpdate(update) {
    const campaign = campaigns.find((c) => c.id === update.campanhaId)
    setUpdates((prev) => [{
      ...update,
      id:       Date.now(),
      campaign: campaign?.title ?? "",
      sentAt:   new Date().toISOString().slice(0, 10),
    }, ...prev])
  }

  if (loading) return <Loading full />

  const statusInstitution = INSTITUTION_STATUS[institution?.status] ?? INSTITUTION_STATUS.pending
  const initials = getInitials(institution?.name)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">{initials}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-ink">{institution?.name}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInstitution.classes}`}>
              {statusInstitution.label}
            </span>
          </div>
          {institution?.address && (
            <p className="text-sm text-muted">{institution.address}</p>
          )}
        </div>
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "Dashboard"    && <DashboardTab campaigns={campaigns} donations={donations} />}
      {tab === "Perfil"       && <ProfileTab institution={institution} setInstitution={setInstitution} client={client} showToast={showToast} />}
      {tab === "Campanhas"    && <CampaignsTab campaigns={campaigns} onToggleUrgente={toggleUrgentCampaign} onAdicionar={addCampaign} onEditar={editCampaign} onExcluir={handleDeleteCampaign} showToast={showToast} />}
      {tab === "Necessidades" && <NecessitiesTab necessities={necessities} onToggleUrgente={toggleUrgentNecessity} onAtender={attendNecessity} onAdicionar={addNecessity} />}
      {tab === "Atualizações" && <UpdatesTab campaigns={campaigns} updates={updates} onEnviar={sendUpdate} />}
      <ToastContainer />
    </div>
  )
}

function ProfileTab({ institution, setInstitution, client, showToast }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name:        institution?.name ?? "",
    description: institution?.description ?? "",
    address:     institution?.address ?? "",
    phone:       institution?.phone ?? "",
    cnpj:        institution?.cnpj ?? "",
    website:     institution?.website ?? "",
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === "cnpj" ? maskCnpj(value) : value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const updated = await updateInstitution(client, institution.id, {
        name:        form.name,
        description: form.description,
        address:     form.address,
        phone:       form.phone,
        cnpj:        form.cnpj.replace(/\D/g, ""),
        website:     form.website,
      })
      setInstitution(updated)
      setEditing(false)
      showToast("success", "Perfil atualizado com sucesso!")
    } catch (err) {
      setError(err?.response?.data?.error ?? "Erro ao salvar. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const statusInstitution = INSTITUTION_STATUS[institution?.status] ?? INSTITUTION_STATUS.pending

  return (
    <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Dados da instituição</h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInstitution.classes}`}>
          {statusInstitution.label}
        </span>
      </div>

      {!editing ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoLinha label="Nome" value={institution?.name ?? "-"} />
            <InfoLinha label="CNPJ" value={institution?.cnpj || "-"} />
            <InfoLinha label="Telefone" value={institution?.phone || "-"} />
            <InfoLinha label="Website" value={institution?.website || "-"} />
            <InfoLinha label="Endereço" value={institution?.address || "-"} />
          </div>
          {institution?.description && (
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted">Descrição</p>
              <p className="text-sm text-ink font-semibold leading-relaxed">{institution.description}</p>
            </div>
          )}
          <button onClick={() => setEditing(true)}
            className="self-start text-sm text-primary hover:underline font-semibold">
            Editar dados
          </button>
        </>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField compact label="Nome da instituição" name="name" value={form.name} onChange={handleChange} />
            <FormField compact required={false} label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" inputMode="numeric" />
            <FormField compact required={false} label="Telefone" name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
            <FormField compact required={false} label="Website" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
            <div className="sm:col-span-2">
              <FormField compact required={false} label="Endereço" name="address" value={form.address} onChange={handleChange} placeholder="Rua, número, cidade - estado" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted">Descrição</label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Conte sobre a missão e os projetos da sua instituição" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setEditing(false); setError(null) }}
              className="flex-1 border border-line text-muted hover:border-ink rounded-lg py-2.5 text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-bold rounded-lg py-2.5 text-sm transition-colors">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function DashboardTab({ campaigns, donations }) {
  const totalRaised = campaigns.reduce((s, c) => s + (c.total_raised ?? 0), 0) / 100
  const totalGoal   = campaigns.reduce((s, c) => s + (c.goal_amount ?? 0), 0) / 100
  const percentage  = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0
  const active      = campaigns.filter((c) => c.status === "active").length
  const donors      = new Set(donations.map((d) => d.user_id)).size

  const campaignsMap = Object.fromEntries(campaigns.map((c) => [c.id, c]))
  const recent = [...donations]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard value={totalRaised.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} label="Total arrecadado" />
        <StatCard value={`${percentage}%`} label="Da meta atingida" />
        <StatCard value={active} label="Campanhas ativas" />
        <StatCard value={donors} label="Doadores únicos" />
      </div>

      <div className="bg-white rounded-xl border border-line p-5 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-ink">Progresso geral das campanhas</span>
          <span className="text-primary font-bold">{percentage}%</span>
        </div>
        <div className="w-full bg-soft rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${Math.min(percentage, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>{totalRaised.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          <span>Meta: {totalGoal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-ink mb-3">Doações recentes</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma doação recebida ainda.</p>
        ) : (
          <div className="bg-white rounded-xl border border-line divide-y divide-line">
            {recent.map((d) => {
              const s = DONATION_STATUS[d.status] ?? { label: d.status, classes: "bg-soft text-muted" }
              const camp = d.campaign_id ? campaignsMap[d.campaign_id] : null
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

function CampaignsTab({ campaigns, onToggleUrgente, onAdicionar, onEditar, onExcluir, showToast }) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleCreate(form) {
    setSaving(true)
    try {
      await onAdicionar(form)
      setCreating(false)
      showToast("success", "Campanha criada com sucesso!")
    } catch {
      showToast("error", "Erro ao criar campanha. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit(form) {
    setSaving(true)
    try {
      await onEditar(editing.id, form)
      setEditing(null)
      showToast("success", "Campanha atualizada com sucesso!")
    } catch {
      showToast("error", "Erro ao salvar alterações. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      await onExcluir(toDelete.id)
      showToast("success", `"${toDelete.title}" foi excluída.`)
      setToDelete(null)
    } catch {
      showToast("error", "Erro ao excluir campanha. Tente novamente.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setCreating(true)}
          className="text-sm bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-lg transition-colors">
          + Nova campanha
        </button>
      </div>

      {campaigns.map((c) => {
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
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <button onClick={() => onToggleUrgente(c)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                    c.is_urgent
                      ? "border-accent/30 text-accent bg-accent-light hover:bg-accent/20"
                      : "border-line text-muted hover:border-accent hover:text-accent"
                  }`}>
                  {c.is_urgent ? "Remover urgência" : "Marcar urgente"}
                </button>
                <button onClick={() => setEditing(c)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-line text-muted hover:border-primary hover:text-primary font-semibold transition-colors">
                  Editar
                </button>
                <button onClick={() => setToDelete(c)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-semibold transition-colors">
                  Excluir
                </button>
              </div>
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

      {creating && (
        <ModalCampaign
          onSalvar={handleCreate}
          onFechar={() => setCreating(false)}
          salvando={saving}
        />
      )}

      {editing && (
        <ModalCampaign
          campanha={editing}
          onSalvar={handleSaveEdit}
          onFechar={() => setEditing(null)}
          salvando={saving}
        />
      )}

      {toDelete && (
        <ModalConfirmDelete
          titulo={toDelete.title}
          onConfirmar={handleConfirmDelete}
          onCancelar={() => setToDelete(null)}
          excluindo={deleting}
        />
      )}
    </div>
  )
}

function NecessitiesTab({ necessities, onToggleUrgente, onAtender, onAdicionar }) {
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ title: "", category: categories[0], urgent: false })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    try {
      await onAdicionar(form)
      setForm({ title: "", category: categories[0], urgent: false })
      setShowForm(false)
    } finally {
      setSending(false)
    }
  }

  const open      = necessities.filter((n) => n.status === "open")
  const attended  = necessities.filter((n) => n.status === "attended")

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
          <FormField label="Descrição" name="title" value={form.title} onChange={handleChange} placeholder="Ex: 50 cobertores para o inverno" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">Categoria</label>
            <Select
              name="category"
              value={form.category}
              onChange={handleChange}
              options={[...categories, "Vestuário", "Voluntariado"].map((c) => ({ value: c, label: c }))}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-ink font-medium">
            <input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange} className="accent-accent" />
            Marcar como urgente
          </label>
          <button type="submit" disabled={sending}
            className="self-end bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
            {sending ? "Adicionando..." : "Adicionar necessidade"}
          </button>
        </form>
      )}

      {open.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Em aberto</p>
          {open.map((n) => (
            <NecessityItem key={n.id} n={n} onToggleUrgente={onToggleUrgente} onAtender={onAtender} />
          ))}
        </div>
      )}
      {attended.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Atendidas</p>
          {attended.map((n) => (
            <NecessityItem key={n.id} n={n} onToggleUrgente={onToggleUrgente} onAtender={onAtender} />
          ))}
        </div>
      )}
      {necessities.length === 0 && (
        <p className="text-sm text-muted text-center py-4">Nenhuma necessidade cadastrada ainda.</p>
      )}
    </div>
  )
}

function NecessityItem({ n, onToggleUrgente, onAtender }) {
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

function UpdatesTab({ campaigns, updates, onEnviar }) {
  const [form, setForm] = useState({ campanhaId: campaigns[0]?.id ?? "", title: "", message: "" })
  const [sent, setSent] = useState(false)

  function handleChange(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })) }

  function handleSubmit(e) {
    e.preventDefault()
    onEnviar(form)
    setForm({ campanhaId: campaigns[0]?.id ?? "", title: "", message: "" })
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-line p-5 flex flex-col gap-4">
        <h3 className="text-base font-bold text-ink">Enviar atualização aos doadores</h3>
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted">Crie uma campanha primeiro para enviar atualizações.</p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Campanha</label>
              <Select
                name="campanhaId"
                value={form.campanhaId}
                onChange={handleChange}
                options={campaigns.map((c) => ({ value: c.id, label: c.title }))}
              />
            </div>
            <FormField label="Título" name="title" value={form.title} onChange={handleChange} placeholder="Ex: Meta 80% atingida!" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Mensagem</label>
              <Textarea name="message" value={form.message} onChange={handleChange} rows={4} required
                placeholder="Conte aos doadores como está o progresso da campanha..." />
            </div>
            <div className="flex items-center justify-between">
              {sent && <span className="text-sm text-success font-semibold">✓ Atualização enviada!</span>}
              <button type="submit" className="ml-auto bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
                Enviar para doadores
              </button>
            </div>
          </>
        )}
      </form>

      {updates.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Atualizações enviadas</p>
          {updates.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-line p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-ink">{a.title}</p>
                <span className="text-xs text-muted shrink-0">{new Date(a.sentAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <p className="text-xs text-muted">{a.campaign}</p>
              <p className="text-sm text-muted leading-relaxed">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ModalConfirmDelete({ titulo, onConfirmar, onCancelar, excluindo }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 text-lg font-bold">
              !
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Excluir campanha</h3>
              <p className="text-sm text-muted mt-1">
                Tem certeza que deseja excluir{" "}
                <span className="font-semibold text-ink">"{titulo}"</span>?{" "}
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancelar}
              disabled={excluindo}
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted hover:border-ink hover:text-ink disabled:opacity-50 transition-colors">
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirmar}
              disabled={excluindo}
              className="rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 px-5 py-2 text-sm font-bold text-white transition-colors">
              {excluindo ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalCampaign({ campanha, onSalvar, onFechar, salvando }) {
  const isNew = !campanha
  const [form, setForm] = useState({
    title:       campanha?.title ?? "",
    category:    campanha ? (categories.find((c) => slugify(c) === campanha.keywords?.[0]) ?? categories[0]) : categories[0],
    goal:        campanha ? String((campanha.goal_amount ?? 0) / 100) : "",
    description: campanha?.description ?? "",
  })

  function handleChange(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })) }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form
          onSubmit={(e) => { e.preventDefault(); onSalvar(form) }}
          className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">{isNew ? "Nova campanha" : "Editar campanha"}</h3>
            <button type="button" onClick={onFechar}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-soft hover:text-ink">
              ✕
            </button>
          </div>

          <FormField label="Título" name="title" value={form.title} onChange={handleChange} placeholder="Nome da campanha" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Categoria</label>
              <Select
                name="category"
                value={form.category}
                onChange={handleChange}
                options={categories.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <FormField label="Meta" name="goal" type="money" value={form.goal} onChange={handleChange} placeholder="0" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">Descrição</label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={3} required
              placeholder="Descreva o objetivo desta campanha" />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onFechar}
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-ink hover:text-ink">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-60">
              {isNew ? (salvando ? "Criando..." : "Criar campanha") : (salvando ? "Salvando..." : "Salvar alterações")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
