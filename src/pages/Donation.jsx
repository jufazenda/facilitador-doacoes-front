import { useState, useEffect, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import { getCampaignById } from "../services/campaigns"
import { getInstitutionById } from "../services/institutions"
import { createDonation, getDonationById } from "../services/donations"
import { getMe } from "../services/users"
import { useAuth } from "../hooks/useAuth"
import { useApiClient } from "../hooks/useApiClient"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import Loading from "../components/ui/Loading"
import FormField from "../components/ui/FormField"
import { STATES } from "../utils/states"
import { maskCep, maskCardExpiry } from "../utils/masks"
import { searchAddressByCep, searchCitiesByState } from "../services/address"

const PRESET_VALUES = [10, 25, 50, 100, 200]

export default function Donation() {
  const { campaignId } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [institutionName, setInstitutionName] = useState("")
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const { user: authUser } = useAuth()
  const client = useApiClient()
  const [userId, setUserId] = useState(null)
  const [userPhone, setUserPhone] = useState("")


  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    async function load() {
      try {
        const c = await getCampaignById(campaignId)
        setCampaign(c)
        const inst = await getInstitutionById(c.institution_id).catch(() => null)
        if (inst) setInstitutionName(inst.name)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [campaignId])

  useEffect(() => {
    if (!authUser) return
    getMe(client).then((me) => { setUserId(me.id); setUserPhone(me.phone ?? "") }).catch(() => {})
  }, [authUser, client])

  const [step, setStep] = useState(1)
  const [value, setValue] = useState(50)
  const [customValue, setCustomValue] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [method, setMethod] = useState(null)
  const [copied, setCopied] = useState(false)
  const [card, setCard] = useState({ numero: "", nome: "", validade: "", cvv: "", telefone: "", cep: "", numero_end: "", rua: "", bairro: "", cidade: "", estado: "", cidadesDisponiveis: [] })
  const [donation, setDonation] = useState(null)
  const [creating, setCreating] = useState(false)
  const [creationError, setCreationError] = useState(null)
  const finalValue = isCustom ? Number(customValue) || 0 : value

  const pollingRef = useRef(null)

  useEffect(() => {
    if (step !== 2 || method !== "pix" || !donation?.id) return

    pollingRef.current = setInterval(async () => {
      try {
        const updated = await getDonationById(donation.id)
        if (updated.status === "PAID") {
          clearInterval(pollingRef.current)
          setDonation(updated)
          setStep(3)
        }
      } catch { /* tenta no próximo tick */ }
    }, 5000)

    return () => clearInterval(pollingRef.current)
  }, [step, method, donation?.id])

  async function handleAdvancePayment() {
    if (!authUser) { setCreationError("Faça login para continuar com a doação."); return }
    if (!userId)   { setCreationError("Carregando seus dados, aguarde um momento."); return }
    // passo 1 só avança — método escolhido no passo 2
    setStep(2)
  }

  async function handleConfirmPix() {
    setCreating(true)
    setCreationError(null)
    try {
      const d = await createDonation(client, {
        user_id: userId,
        amount: Math.round(finalValue * 100),
        campaign_id: campaignId,
        payment_method: "PIX",
      })
      setDonation(d)
    } catch (err) {
      const raw = err?.response?.data?.error ?? ""
      const isCpfError = raw.toLowerCase().includes("cpf") || raw.toLowerCase().includes("cnpj")
      setCreationError({
        msg: isCpfError ? "CPF inválido ou ausente no seu perfil. Atualize seus dados pessoais antes de continuar." : raw || "Não foi possível iniciar a doação. Tente novamente.",
        isCpfError,
      })
    } finally {
      setCreating(false)
    }
  }

  async function handleConfirmCard() {
    if (!authUser || !userId) return
    setCreating(true)
    setCreationError(null)
    try {
      const [expiryMonth, expiryYear] = card.validade.split("/")
      const d = await createDonation(client, {
        user_id: userId,
        amount: Math.round(finalValue * 100),
        campaign_id: campaignId,
        payment_method: "CREDIT_CARD",
        credit_card: {
          holder_name:    card.nome,
          number:         card.numero,
          expiry_month:   expiryMonth,
          expiry_year:    `20${expiryYear}`,
          ccv:            card.cvv,
          postal_code:    card.cep.replace(/\D/g, ""),
          address_number: card.numero_end,
          phone:          userPhone.replace(/\D/g, ""),
        },
      })
      setDonation(d)
      setStep(3)
    } catch (err) {
      const raw = err?.response?.data?.error ?? ""
      setCreationError({ msg: raw || "Não foi possível processar o cartão. Tente novamente.", isCpfError: false })
    } finally {
      setCreating(false)
    }
  }

  function handleBackToValue() {
    setDonation(null)
    setCreationError(null)
    setStep(1)
  }

  function handleCopyPix() {
    navigator.clipboard.writeText(donation?.br_code ?? "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <Loading full />

  if (notFound || !campaign) {
    return (
      <div className="py-20 text-center text-muted px-4">
        <p className="text-lg">Campanha não encontrada.</p>
        <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">← Voltar</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <Link to={`/campanha/${campaign.id}`}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-semibold">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voltar para a campanha
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-line p-4">
          <p className="text-xs text-muted mb-1">Doando para</p>
          <p className="font-bold text-ink">{campaign.title}</p>
          <p className="text-xs text-muted mt-0.5">{institutionName}</p>
        </div>

        <Step step={step} />

        {step === 1 && (
          <StepValue
            value={value} setValue={setValue}
            isCustom={isCustom} setIsCustom={setIsCustom}
            customValue={customValue} setCustomValue={setCustomValue}
            onNext={handleAdvancePayment}
            loading={creating}
            erro={creationError}
          />
        )}
        {step === 2 && (
          <StepPayment
            method={method} setMethod={setMethod}
            card={card} setCard={setCard}
            copied={copied} onCopiarPix={handleCopyPix}
            donation={donation} setDonation={setDonation}
            onBack={handleBackToValue}
            onConfirmarPix={handleConfirmPix}
            onConfirmarCartao={handleConfirmCard}
            awaitingPayment={method === "pix" && !!donation && donation.status !== "PAID"}
            creating={creating}
            erro={creationError}
          />
        )}
        {step === 3 && (
          <StepConfirmation
            campaign={campaign} institutionName={institutionName}
            value={finalValue} method={method} donation={donation}
          />
        )}
      </div>
    </div>
  )
}

function Step({ step }) {
  const steps = ["Valor", "Pagamento", "Confirmação"]
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const num = i + 1
        const active = num === step
        const done = num < step
        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done || active ? "bg-primary text-white" : "bg-soft text-muted"}`}>
                {done ? "✓" : num}
              </div>
              <span className={`text-sm hidden sm:block font-medium ${active ? "text-ink" : "text-muted"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-line mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

function StepValue({ value, setValue, isCustom, setIsCustom, customValue, setCustomValue, onNext, loading, erro }) {
  function handlePreset(v) { setValue(v); setIsCustom(false); setCustomValue("") }
  const finalValue = isCustom ? Number(customValue) || 0 : value

  return (
    <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-6">
      <div>
        <p className="text-sm font-bold text-ink mb-3">Escolha um valor</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PRESET_VALUES.map((v) => (
            <button key={v} onClick={() => handlePreset(v)}
              className={`py-2.5 rounded-lg text-sm font-bold border transition-colors ${!isCustom && value === v ? "bg-primary text-white border-primary" : "bg-white text-muted border-line hover:border-primary hover:text-primary"}`}>
              {v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
            </button>
          ))}
          <button onClick={() => { setIsCustom(true); setValue(0) }}
            className={`py-2.5 rounded-lg text-sm font-bold border transition-colors col-span-2 sm:col-span-5 ${isCustom ? "bg-primary text-white border-primary" : "bg-white text-muted border-line hover:border-primary hover:text-primary"}`}>
            Outro valor
          </button>
        </div>
        {isCustom && (
          <div className="mt-3">
            <Input type="money" min="1" value={customValue} onChange={(e) => setCustomValue(e.target.value)} placeholder="0,00" autoFocus />
          </div>
        )}
      </div>

      {/* Tipo de doação — desativado por enquanto
      <div>
        <p className="text-sm font-bold text-ink mb-3">Tipo de doação</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ value: "unica", label: "Doação única" }, { value: "recorrente", label: "Recorrente" }].map(({ value, label }) => (
            <button key={value} onClick={() => setTipo(value)}
              className={`py-2.5 rounded-lg text-sm font-bold border transition-colors ${tipo === value ? "bg-primary text-white border-primary" : "bg-white text-muted border-line hover:border-primary hover:text-primary"}`}>
              {label}
            </button>
          ))}
        </div>
        {tipo === "recorrente" && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[{ value: "mensal", label: "Mensal" }, { value: "trimestral", label: "Trimestral" }].map(({ value, label }) => (
              <button key={value} onClick={() => setIntervalo(value)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${intervalo === value ? "border-primary text-primary bg-primary-light" : "border-line text-muted hover:border-primary"}`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      */}

      {erro && (
        <div className="flex flex-col gap-2 -mb-2">
          <p className="text-sm text-accent font-semibold text-center">{typeof erro === "object" ? erro.msg : erro}</p>
          {erro?.isCpfError && (
            <Link to="/area/doador" className="text-sm text-primary hover:underline font-semibold text-center">
              Atualizar meus dados →
            </Link>
          )}
        </div>
      )}

      <button onClick={onNext} disabled={finalValue < 1 || loading}
        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg py-3 transition-colors">
        {loading ? "Aguarde..." : "Continuar →"}
      </button>
    </div>
  )
}

function StepPayment({ method, setMethod, card, setCard, copied, onCopiarPix, donation, setDonation, onBack, onConfirmarPix, onConfirmarCartao, awaitingPayment, creating, erro }) {
  const [searchingCep, setSearchingCep] = useState(false)

  async function handleChooseMethod(value) {
    if (value === method) return
    setDonation(null)
    setMethod(value)
    if (value === "pix") onConfirmarPix()
  }

  async function handleCard(e) {
    const { name, value } = e.target
    if (name === "cep") {
      const v = maskCep(value)
      setCard((prev) => ({ ...prev, cep: v }))
      if (v.replace(/\D/g, "").length === 8) {
        setSearchingCep(true)
        try {
          const data = await searchAddressByCep(v)
          if (data) {
            const cidades = await searchCitiesByState(data.uf)
            setCard((prev) => ({
              ...prev, cep: v,
              rua:    data.logradouro ?? prev.rua,
              bairro: data.bairro     ?? prev.bairro,
              cidade: data.localidade ?? prev.cidade,
              estado: data.uf         ?? prev.estado,
              cidadesDisponiveis: cidades,
            }))
          }
        } finally { setSearchingCep(false) }
      }
      return
    }
    if (name === "estado") {
      setCard((prev) => ({ ...prev, estado: value, cidade: "", cidadesDisponiveis: [] }))
      const cidades = await searchCitiesByState(value)
      setCard((prev) => ({ ...prev, cidadesDisponiveis: cidades }))
      return
    }
    if (name === "validade") {
      setCard((prev) => ({ ...prev, validade: maskCardExpiry(value) }))
      return
    }
    setCard((prev) => ({ ...prev, [name]: value }))
  }

  const cardValid = (
    card.numero.length >= 16 &&
    card.nome &&
    card.validade.length === 5 &&
    card.cvv.length >= 3 &&
    card.cep.replace(/\D/g, "").length === 8 &&
    card.numero_end
  )

  return (
    <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-6">

      {/* Seleção de método */}
      <div>
        <p className="text-sm font-bold text-ink mb-3">Como deseja pagar?</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: "pix",
              label: "Pix",
              desc: "Aprovação imediata",
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6.5 14l4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="16" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="2" y="16" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 18h2m2 0h2M16 22h2m4-4v2m0 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              value: "cartao",
              label: "Cartão de crédito",
              desc: "Todas as bandeiras",
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="2" y="6" width="24" height="17" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 11h24" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="5" y="15" width="5" height="3" rx="1" fill="currentColor" opacity=".4"/>
                </svg>
              ),
            },
          ].map(({ value, label, desc, icon }) => {
            const active = method === value
            return (
              <button key={value} type="button"
                onClick={() => handleChooseMethod(value)}
                disabled={creating && method !== value}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? "border-primary bg-primary-light"
                    : "border-line bg-white hover:border-primary/40"
                }`}>
                <span className={active ? "text-primary" : "text-muted"}>{icon}</span>
                <div>
                  <p className={`text-sm font-bold ${active ? "text-primary" : "text-ink"}`}>{label}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Estado: nenhum método escolhido */}
      {!method && (
        <p className="text-sm text-muted text-center py-2">Escolha uma forma de pagamento acima para continuar.</p>
      )}

      {/* PIX */}
      {method === "pix" && (
        <div className="flex flex-col items-center gap-4">
          {creating ? (
            <div className="w-44 h-44 rounded-xl border border-line bg-soft flex flex-col items-center justify-center gap-3">
              <span className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted">Gerando QR Code...</p>
            </div>
          ) : donation?.qr_code_url ? (
            <img
              src={donation.qr_code_url.startsWith("data:") ? donation.qr_code_url : `data:image/png;base64,${donation.qr_code_url}`}
              alt="QR Code PIX"
              className="w-44 h-44 rounded-xl border border-line object-contain"
            />
          ) : null}

          {donation?.br_code && (
            <div className="w-full flex items-center gap-2 bg-soft rounded-lg border border-line px-3 py-2.5">
              <span className="text-xs text-muted flex-1 truncate font-mono">{donation.br_code}</span>
              <button onClick={onCopiarPix} className="text-xs font-bold text-primary hover:underline shrink-0">
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          )}

          {donation && (
            awaitingPayment ? (
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="inline-block w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Aguardando confirmação do pagamento...
              </div>
            ) : (
              <p className="text-xs text-success font-semibold">Pagamento confirmado!</p>
            )
          )}
        </div>
      )}

      {/* Cartão */}
      {method === "cartao" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Dados do cartão</p>
            <FormField compact required={false} labelClassName="text-xs font-semibold text-muted" label="Número do cartão" name="numero" value={card.numero} onChange={handleCard} placeholder="0000 0000 0000 0000" maxLength={16} inputMode="numeric" />
            <FormField compact required={false} labelClassName="text-xs font-semibold text-muted" label="Nome impresso no cartão" name="nome" value={card.nome} onChange={handleCard} placeholder="Como aparece no cartão" />
            <div className="grid grid-cols-2 gap-3">
              <FormField compact required={false} labelClassName="text-xs font-semibold text-muted" label="Validade" name="validade" value={card.validade} onChange={handleCard} placeholder="MM/AA" maxLength={5} />
              <FormField compact required={false} labelClassName="text-xs font-semibold text-muted" label="CVV" name="cvv" value={card.cvv} onChange={handleCard} placeholder="000" maxLength={4} inputMode="numeric" />
            </div>
          </div>

          <div className="h-px bg-line" />

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Endereço de cobrança</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5 relative">
                <FormField compact required={false} labelClassName="text-xs font-semibold text-muted" label="CEP" name="cep" value={card.cep} onChange={handleCard} placeholder="00000-000" maxLength={9} inputMode="numeric" />
                {searchingCep && <span className="absolute right-3 bottom-2.5 w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
              </div>
              <FormField compact required={false} labelClassName="text-xs font-semibold text-muted" label="Número" name="numero_end" value={card.numero_end} onChange={handleCard} placeholder="123" />
            </div>
            <FormField compact required={false} labelClassName="text-xs font-semibold text-muted" label="Rua / Logradouro" name="rua" value={card.rua} onChange={handleCard} placeholder="Rua, Avenida, Travessa..." />
            <FormField compact required={false} labelClassName="text-xs font-semibold text-muted" label="Bairro" name="bairro" value={card.bairro} onChange={handleCard} placeholder="Bairro" />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">Estado</label>
                <Select name="estado" value={card.estado} onChange={handleCard} options={STATES} placeholder="Selecione" searchable />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">Cidade</label>
                {card.cidadesDisponiveis?.length > 0 ? (
                  <Select name="cidade" value={card.cidade} onChange={handleCard} options={card.cidadesDisponiveis.map((c) => ({ value: c, label: c }))} placeholder="Selecione" searchable />
                ) : (
                  <Input name="cidade" value={card.cidade} onChange={handleCard} placeholder="Cidade" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {erro && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-accent font-semibold text-center">{typeof erro === "object" ? erro.msg : erro}</p>
          {erro?.isCpfError && (
            <Link to="/area/doador" className="text-sm text-primary hover:underline font-semibold text-center">
              Atualizar meus dados →
            </Link>
          )}
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-line text-muted hover:border-ink rounded-xl py-3 text-sm font-semibold transition-colors">
          ← Voltar
        </button>
        {method === "cartao" && (
          <button onClick={onConfirmarCartao} disabled={!cardValid || creating}
            className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 transition-colors">
            {creating ? "Processando..." : "Confirmar doação"}
          </button>
        )}
      </div>
    </div>
  )
}

function StepConfirmation({ campaign, institutionName, value, method, donation }) {
  const methodLabel = method === "pix" ? "PIX" : "Cartão de crédito"
  const formattedValue = value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Ícone animado */}
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-success-light flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M8 22l10 10L36 12" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-success" style={{color: "var(--color-success)"}} />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-success-light opacity-30 animate-ping" />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-ink">Doação registrada!</h2>
        <p className="text-sm text-muted max-w-xs mx-auto">
          Obrigado por fazer a diferença. Seu pagamento está sendo processado.
        </p>
      </div>

      {/* Card de resumo */}
      <div className="w-full bg-white rounded-2xl border border-line overflow-hidden">
        {/* Valor em destaque */}
        <div className="bg-primary px-6 py-5 flex flex-col items-center gap-1">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">Valor doado</p>
          <p className="text-3xl font-bold text-white">{formattedValue}</p>
        </div>

        {/* Detalhes */}
        <div className="px-5 py-4 flex flex-col divide-y divide-line">
          <SummaryRow label="Campanha" value={campaign.title} />
          <SummaryRow label="Instituição" value={institutionName} />
          <SummaryRow label="Forma de pagamento" value={methodLabel} />
          {donation?.id && (
            <SummaryRow label="Protocolo" value={`#${donation.id.slice(0, 8).toUpperCase()}`} mono />
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3 w-full">
        <Link to={`/campanha/${campaign.id}`}
          className="w-full text-center bg-primary hover:bg-primary-dark text-white font-bold rounded-xl py-3 transition-colors">
          Voltar para a campanha
        </Link>
        <Link to="/"
          className="w-full text-center border border-line hover:border-primary text-muted hover:text-primary text-sm font-semibold rounded-xl py-2.5 transition-colors">
          Ver outras campanhas
        </Link>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex justify-between items-center gap-4 py-3 text-sm">
      <span className="text-muted shrink-0">{label}</span>
      <span className={`font-semibold text-right text-ink ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}
