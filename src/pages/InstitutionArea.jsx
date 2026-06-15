import { useState, useEffect, useRef, useCallback } from "react"
import { Move } from "lucide-react"
import { useApiClient } from "../hooks/useApiClient"
import { getMyInstitution, updateInstitution, uploadInstitutionImage } from "../services/institutions"
import { getCampaignsByInstitution, createCampaign, updateCampaign, deleteCampaign } from "../services/campaigns"
import { getNecessitiesByInstitution, createNecessity, updateNecessity, updateNecessityStatus } from "../services/necessities"
import { getDonations } from "../services/donations"
import { categorias, slugify } from "../utils/staticData"
import { atualizacoesMock } from "../utils/mockData"
import { useCoverPosition } from "../hooks/useCoverPosition"
import DraggablePhoto from "../components/ui/DraggablePhoto"
import PhotoCropModal from "../components/ui/PhotoCropModal"
import Select from "../components/ui/Select"
import Input from "../components/ui/Input"
import Textarea from "../components/ui/Textarea"
import Loading from "../components/ui/Loading"
import { useToast } from "../components/ui/Toast"

const ABAS = ["Dashboard", "Perfil", "Campanhas", "Necessidades", "Atualizações"]


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
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const client = useApiClient()
  const { showToast, ToastContainer } = useToast()

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
      keywords:    [slugify(form.categoria)],
    })
    setCampanhas((prev) => [nova, ...prev])
  }

  async function editarCampanha(id, form) {
    const campanha = campanhas.find((c) => c.id === id)
    const updated = await updateCampaign(client, id, {
      title:       form.titulo,
      description: form.descricao,
      goal_amount: Math.round(Number(form.meta) * 100),
      keywords:    [slugify(form.categoria)],
      category:    form.categoria,
      is_urgent:   campanha?.is_urgent ?? false,
    })
    setCampanhas((prev) => prev.map((c) => c.id === id ? updated : c))
  }

  async function excluirCampanha(id) {
    await deleteCampaign(client, id)
    setCampanhas((prev) => prev.filter((c) => c.id !== id))
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

  if (loading) return <Loading full />

  async function handleLogoFile(file, position) {
    setUploadingLogo(true)
    try {
      const updated = await uploadInstitutionImage(client, instituicao.id, "logo", file)
      setInstituicao(updated)
      showToast("success", "Logo atualizado!")
    } catch {
      showToast("error", "Erro ao enviar logo. Tente novamente.")
    } finally {
      setUploadingLogo(false)
    }
  }

  const statusInst = STATUS_INST[instituicao?.status] ?? STATUS_INST.pending
  const iniciais = (instituicao?.name ?? "?").split(" ").slice(0, 2).map((w) => w[0]).join("")

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <DraggablePhoto
          imageUrl={instituicao?.logo_url ?? null}
          fallback={<div className="w-full h-full rounded-2xl bg-primary flex items-center justify-center"><span className="text-white text-xl font-bold">{iniciais}</span></div>}
          shape="rounded-2xl"
          size="w-14 h-14"
          aspectRatio={1}
          storageKey={`logo_pos_${instituicao?.id}`}
          uploading={uploadingLogo}
          onFileChange={handleLogoFile}
          editMode={editandoPerfil && aba === "Perfil"}
        />
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

      <div className="flex border-b border-line gap-1 ">
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
      {aba === "Perfil"       && <AbaPerfil instituicao={instituicao} setInstituicao={setInstituicao} client={client} showToast={showToast} onEditandoChange={setEditandoPerfil} />}
      {aba === "Campanhas"    && <AbaCampanhas campanhas={campanhas} onToggleUrgente={toggleUrgenteC} onAdicionar={adicionarCampanha} onEditar={editarCampanha} onExcluir={excluirCampanha} showToast={showToast} />}
      {aba === "Necessidades" && <AbaNecessidades necessidades={necessidades} onToggleUrgente={toggleUrgenteN} onAtender={atenderNecessidade} onAdicionar={adicionarNecessidade} />}
      {aba === "Atualizações" && <AbaAtualizacoes campanhas={campanhas} atualizacoes={atualizacoes} onEnviar={enviarAtualizacao} />}
      <ToastContainer />
    </div>
  )
}

function mascararCnpj(v) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
}

function AbaPerfil({ instituicao, setInstituicao, client, showToast, onEditandoChange }) {
  const [editando, setEditando] = useState(false)

  function setEditandoSync(v) {
    setEditando(v)
    onEditandoChange?.(v)
  }

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingLogoInner, setUploadingLogoInner] = useState(false)
  const [pendingCoverFile, setPendingCoverFile] = useState(null)
  const coverInputRef = useRef(null)
  const [form, setForm] = useState({
    name:        instituicao?.name ?? "",
    description: instituicao?.description ?? "",
    address:     instituicao?.address ?? "",
    phone:       instituicao?.phone ?? "",
    cnpj:        instituicao?.cnpj ?? "",
    website:     instituicao?.website ?? "",
  })

  async function handleCoverFile(file, position) {
    setUploadingCover(true)
    if (position) savePosition(position)
    try {
      const updated = await uploadInstitutionImage(client, instituicao.id, "cover", file)
      setInstituicao(updated)
      showToast("success", "Capa atualizada!")
    } catch {
      showToast("error", "Erro ao enviar capa. Tente novamente.")
    } finally {
      setUploadingCover(false)
    }
  }

  async function handleLogoInnerFile(file, position) {
    setUploadingLogoInner(true)
    try {
      const updated = await uploadInstitutionImage(client, instituicao.id, "logo", file)
      setInstituicao(updated)
      showToast("success", "Logo atualizado!")
    } catch {
      showToast("error", "Erro ao enviar logo. Tente novamente.")
    } finally {
      setUploadingLogoInner(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === "cnpj" ? mascararCnpj(value) : value }))
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      const updated = await updateInstitution(client, instituicao.id, {
        name:        form.name,
        description: form.description,
        address:     form.address,
        phone:       form.phone,
        cnpj:        form.cnpj.replace(/\D/g, ""),
        website:     form.website,
      })
      setInstituicao(updated)
      setEditandoSync(false)
      showToast("success", "Perfil atualizado com sucesso!")
    } catch (err) {
      setErro(err?.response?.data?.error ?? "Erro ao salvar. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  const statusInst = STATUS_INST[instituicao?.status] ?? STATUS_INST.pending
  const { position, save: savePosition } = useCoverPosition(instituicao?.id)
  const iniciais = (instituicao?.name ?? "?").split(" ").slice(0, 2).map((w) => w[0]).join("")

  // drag-to-reposition on cover panel
  const dragRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)

  const onPointerDown = useCallback((e) => {
    if (!instituicao?.cover_image_url) return
    e.preventDefault()
    dragRef.current = e.currentTarget
    const [px, py] = position.split(" ").map((v) => parseFloat(v))
    dragStart.current = { x: e.clientX, y: e.clientY, px, py }
    setDragging(true)
    dragRef.current.setPointerCapture(e.pointerId)
  }, [position, instituicao?.cover_image_url])

  const onPointerMove = useCallback((e) => {
    if (!dragging || !dragStart.current || !dragRef.current) return
    const rect = dragRef.current.getBoundingClientRect()
    const dx = (dragStart.current.x - e.clientX) / rect.width * 100
    const dy = (dragStart.current.y - e.clientY) / rect.height * 100
    const nx = Math.min(100, Math.max(0, dragStart.current.px + dx))
    const ny = Math.min(100, Math.max(0, dragStart.current.py + dy))
    savePosition(`${nx.toFixed(1)}% ${ny.toFixed(1)}%`)
  }, [dragging, savePosition])

  const onPointerUp = useCallback(() => {
    setDragging(false)
    dragStart.current = null
  }, [])

  return (
    <div className="bg-white rounded-xl border border-line overflow-hidden flex flex-col gap-5">

      {/* Hero — same layout as InstitutionDetail */}
      <div className="grid grid-cols-1 lg:grid-cols-5">

        {/* left: name + status + edit button */}
        <div className="flex flex-col gap-4 p-6 lg:col-span-3">
          <div className="flex items-start gap-3">
            <DraggablePhoto
              imageUrl={instituicao?.logo_url ?? null}
              fallback={<div className="w-full h-full rounded-2xl bg-primary-light flex items-center justify-center"><span className="text-xl font-black text-primary">{iniciais}</span></div>}
              shape="rounded-2xl"
              size="w-14 h-14"
              aspectRatio={1}
              storageKey={`logo_pos_${instituicao?.id}`}
              uploading={uploadingLogoInner}
              onFileChange={handleLogoInnerFile}
              editMode={editando}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xl font-black text-purple-950 leading-tight">{instituicao?.name}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInst.classes}`}>
                  {statusInst.label}
                </span>
              </div>
              {instituicao?.address && (
                <p className="text-sm text-muted mt-0.5">{instituicao.address}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="self-start flex items-center gap-1.5 text-xs font-semibold text-muted border border-line rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploadingCover
              ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : <Move size={13} />}
            Alterar capa
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingCoverFile(f); e.target.value = "" }}
          />
          {pendingCoverFile && (
            <PhotoCropModal
              file={pendingCoverFile}
              frameShape="rounded-none"
              aspectRatio={2 / 3}
              onConfirm={({ file, position: pos }) => { setPendingCoverFile(null); handleCoverFile(file, pos) }}
              onCancel={() => setPendingCoverFile(null)}
            />
          )}
        </div>

        {/* right: cover panel identical to IllustracaoHero */}
        <div className="h-48 lg:col-span-2 lg:h-auto">
          <div
            ref={dragRef}
            className={`relative h-full overflow-hidden ${instituicao?.cover_image_url ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {instituicao?.cover_image_url ? (
              <>
                <img
                  src={instituicao.cover_image_url}
                  alt="Capa"
                  draggable={false}
                  className="h-full w-full object-cover select-none"
                  style={{ objectPosition: position }}
                />
                <div className={`absolute inset-0 bg-linear-to-t from-purple-950/30 to-transparent transition-opacity ${dragging ? "opacity-0" : ""}`} />
                {!dragging && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-1 rounded-full pointer-events-none select-none">
                    <Move size={10} /> Arraste para reposicionar
                  </div>
                )}
              </>
            ) : (
              <div className="relative h-full overflow-hidden bg-linear-to-br from-purple-50 via-primary-light to-soft">
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-200/50" />
                <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-primary/10" />
                <div className="absolute bottom-16 right-10 h-28 w-28 rounded-full bg-purple-300/30" />
                <div className="absolute inset-0 bg-[radial-gradient(#4b1fa6_2px,transparent_2px)] bg-size-[22px_22px] opacity-[0.07]" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-5">
        <h2 className="text-base font-bold text-ink">Dados da instituição</h2>

      {!editando ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoLinha label="Nome" value={instituicao?.name ?? "-"} />
            <InfoLinha label="CNPJ" value={instituicao?.cnpj || "-"} />
            <InfoLinha label="Telefone" value={instituicao?.phone || "-"} />
            <InfoLinha label="Website" value={instituicao?.website || "-"} />
            <InfoLinha label="Endereço" value={instituicao?.address || "-"} />
          </div>
          {instituicao?.description && (
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted">Descrição</p>
              <p className="text-sm text-ink font-semibold leading-relaxed">{instituicao.description}</p>
            </div>
          )}
          <button onClick={() => setEditandoSync(true)}
            className="self-start text-sm text-primary hover:underline font-semibold">
            Editar dados
          </button>
        </>
      ) : (
        <form onSubmit={handleSalvar} className="flex flex-col gap-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
              {erro}
            </div>
          )}
          <CampoEdicao label="Nome da instituição" name="name" value={form.name} onChange={handleChange} required />
          <CampoEdicao label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" inputMode="numeric" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CampoEdicao label="Telefone" name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
            <CampoEdicao label="Website" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
          </div>
          <CampoEdicao label="Endereço" name="address" value={form.address} onChange={handleChange} placeholder="Rua, número, cidade - estado" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted">Descrição</label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Conte sobre a missão e os projetos da sua instituição" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setEditandoSync(false); setErro(null) }}
              className="flex-1 border border-line text-muted hover:border-ink rounded-lg py-2.5 text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-bold rounded-lg py-2.5 text-sm transition-colors">
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}
      </div>
    </div>
  )
}

function CampoEdicao({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted">{label}</label>
      <input
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
        {...props}
      />
    </div>
  )
}

function InfoLinha({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm text-ink font-semibold">{value}</p>
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

function AbaCampanhas({ campanhas, onToggleUrgente, onAdicionar, onEditar, onExcluir, showToast }) {
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [paraExcluir, setParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  async function handleCriar(form) {
    setSalvando(true)
    try {
      await onAdicionar(form)
      setCriando(false)
      showToast("success", "Campanha criada com sucesso!")
    } catch {
      showToast("error", "Erro ao criar campanha. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  async function handleSalvarEdicao(form) {
    setSalvando(true)
    try {
      await onEditar(editando.id, form)
      setEditando(null)
      showToast("success", "Campanha atualizada com sucesso!")
    } catch {
      showToast("error", "Erro ao salvar alterações. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  async function handleConfirmarExclusao() {
    setExcluindo(true)
    try {
      await onExcluir(paraExcluir.id)
      showToast("success", `"${paraExcluir.title}" foi excluída.`)
      setParaExcluir(null)
    } catch {
      showToast("error", "Erro ao excluir campanha. Tente novamente.")
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button onClick={() => setCriando(true)}
          className="text-sm bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-lg transition-colors">
          + Nova campanha
        </button>
      </div>

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
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <button onClick={() => onToggleUrgente(c)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                    c.is_urgent
                      ? "border-accent/30 text-accent bg-accent-light hover:bg-accent/20"
                      : "border-line text-muted hover:border-accent hover:text-accent"
                  }`}>
                  {c.is_urgent ? "Remover urgência" : "Marcar urgente"}
                </button>
                <button onClick={() => setEditando(c)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-line text-muted hover:border-primary hover:text-primary font-semibold transition-colors">
                  Editar
                </button>
                <button onClick={() => setParaExcluir(c)}
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

      {criando && (
        <ModalCampanha
          onSalvar={handleCriar}
          onFechar={() => setCriando(false)}
          salvando={salvando}
        />
      )}

      {editando && (
        <ModalCampanha
          campanha={editando}
          onSalvar={handleSalvarEdicao}
          onFechar={() => setEditando(null)}
          salvando={salvando}
        />
      )}

      {paraExcluir && (
        <ModalConfirmarExclusao
          titulo={paraExcluir.title}
          onConfirmar={handleConfirmarExclusao}
          onCancelar={() => setParaExcluir(null)}
          excluindo={excluindo}
        />
      )}
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
            <Select
              name="categoria"
              value={form.categoria}
              onChange={handleMudanca}
              options={[...categorias, "Vestuário", "Voluntariado"].map((c) => ({ value: c, label: c }))}
            />
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
              <Select
                name="campanhaId"
                value={form.campanhaId}
                onChange={handleMudanca}
                options={campanhas.map((c) => ({ value: c.id, label: c.title }))}
              />
            </div>
            <FormField label="Título" name="titulo" value={form.titulo} onChange={handleMudanca} placeholder="Ex: Meta 80% atingida!" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Mensagem</label>
              <Textarea name="mensagem" value={form.mensagem} onChange={handleMudanca} rows={4} required
                placeholder="Conte aos doadores como está o progresso da campanha..." />
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
      <Input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required />
    </div>
  )
}

function ModalConfirmarExclusao({ titulo, onConfirmar, onCancelar, excluindo }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-5">
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

function ModalCampanha({ campanha, onSalvar, onFechar, salvando }) {
  const isNew = !campanha
  const [form, setForm] = useState({
    titulo:    campanha?.title ?? "",
    categoria: campanha ? (categorias.find((c) => slugify(c) === campanha.keywords?.[0]) ?? categorias[0]) : categorias[0],
    meta:      campanha ? String((campanha.goal_amount ?? 0) / 100) : "",
    descricao: campanha?.description ?? "",
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
          className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">{isNew ? "Nova campanha" : "Editar campanha"}</h3>
            <button type="button" onClick={onFechar}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-soft hover:text-ink">
              ✕
            </button>
          </div>

          <FormField label="Título" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Nome da campanha" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink">Categoria</label>
              <Select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                options={categorias.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <FormField label="Meta" name="meta" type="money" value={form.meta} onChange={handleChange} placeholder="0" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink">Descrição</label>
            <Textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} required
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
