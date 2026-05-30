import { useState, useEffect, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import { getCampaignById } from "../services/campaigns"
import CheckIcon from "@mui/icons-material/Check"
import { getInstitutionById } from "../services/institutions"
import { createDonation, getDonationById } from "../services/donations"
import { getMe } from "../services/users"
import { useAuth } from "../context/AuthContext"
import { useApiClient } from "../hooks/useApiClient"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import Loading from "../components/ui/Loading"

const VALORES_PRESET = [10, 25, 50, 100, 200]

const ESTADOS = [
  { value: "AC", label: "Acre" }, { value: "AL", label: "Alagoas" }, { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" }, { value: "BA", label: "Bahia" }, { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" }, { value: "ES", label: "Espírito Santo" }, { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" }, { value: "MT", label: "Mato Grosso" }, { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" }, { value: "PA", label: "Pará" }, { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" }, { value: "PE", label: "Pernambuco" }, { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" }, { value: "RN", label: "Rio Grande do Norte" }, { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" }, { value: "RR", label: "Roraima" }, { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" }, { value: "SE", label: "Sergipe" }, { value: "TO", label: "Tocantins" },
]

export default function Donation() {
  const { campanhaId } = useParams()
  const [campanha, setCampanha] = useState(null)
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
        const c = await getCampaignById(campanhaId)
        setCampanha(c)
        const inst = await getInstitutionById(c.institution_id).catch(() => null)
        if (inst) setInstitutionName(inst.name)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [campanhaId])

  useEffect(() => {
    if (!authUser) return
    getMe(client).then((me) => { setUserId(me.id); setUserPhone(me.phone ?? "") }).catch(() => {})
  }, [authUser, client])

  const [passo, setPasso] = useState(1)
  const [valor, setValor] = useState(50)
  const [valorCustom, setValorCustom] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [metodo, setMetodo] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [cartao, setCartao] = useState({ numero: "", nome: "", validade: "", cvv: "", telefone: "", cep: "", numero_end: "", rua: "", bairro: "", cidade: "", estado: "", cidadesDisponiveis: [] })
  const [donation, setDonation] = useState(null)
  const [criando, setCriando] = useState(false)
  const [erroCriacao, setErroCriacao] = useState(null)
  const valorFinal = isCustom ? Number(valorCustom) || 0 : valor

  const pollingRef = useRef(null)

  useEffect(() => {
    if (passo !== 2 || metodo !== "pix" || !donation?.id) return

    pollingRef.current = setInterval(async () => {
      try {
        const updated = await getDonationById(donation.id)
        if (updated.status === "PAID") {
          clearInterval(pollingRef.current)
          setDonation(updated)
          setPasso(3)
        }
      } catch { /* tenta no próximo tick */ }
    }, 5000)

    return () => clearInterval(pollingRef.current)
  }, [passo, metodo, donation?.id])

  async function handleAvancarPagamento() {
    if (!authUser) { setErroCriacao("Faça login para continuar com a doação."); return }
    if (!userId)   { setErroCriacao("Carregando seus dados, aguarde um momento."); return }
    // passo 1 só avança — método escolhido no passo 2
    setPasso(2)
  }

  async function handleConfirmarPix() {
    setCriando(true)
    setErroCriacao(null)
    try {
      const d = await createDonation(client, {
        user_id: userId,
        amount: Math.round(valorFinal * 100),
        campaign_id: campanhaId,
        payment_method: "PIX",
      })
      setDonation(d)
    } catch (err) {
      const raw = err?.response?.data?.error ?? ""
      const isCpfError = raw.toLowerCase().includes("cpf") || raw.toLowerCase().includes("cnpj")
      setErroCriacao({
        msg: isCpfError ? "CPF inválido ou ausente no seu perfil. Atualize seus dados pessoais antes de continuar." : raw || "Não foi possível iniciar a doação. Tente novamente.",
        isCpfError,
      })
    } finally {
      setCriando(false)
    }
  }

  async function handleConfirmarCartao() {
    if (!authUser || !userId) return
    setCriando(true)
    setErroCriacao(null)
    try {
      const [expiryMonth, expiryYear] = cartao.validade.split("/")
      const d = await createDonation(client, {
        user_id: userId,
        amount: Math.round(valorFinal * 100),
        campaign_id: campanhaId,
        payment_method: "CREDIT_CARD",
        credit_card: {
          holder_name:    cartao.nome,
          number:         cartao.numero,
          expiry_month:   expiryMonth,
          expiry_year:    `20${expiryYear}`,
          ccv:            cartao.cvv,
          postal_code:    cartao.cep.replace(/\D/g, ""),
          address_number: cartao.numero_end,
          phone:          userPhone.replace(/\D/g, ""),
        },
      })
      setDonation(d)
      setPasso(3)
    } catch (err) {
      const raw = err?.response?.data?.error ?? ""
      setErroCriacao({ msg: raw || "Não foi possível processar o cartão. Tente novamente.", isCpfError: false })
    } finally {
      setCriando(false)
    }
  }

  function handleVoltarParaValor() {
    setDonation(null)
    setErroCriacao(null)
    setPasso(1)
  }

  function handleCopiarPix() {
    navigator.clipboard.writeText(donation?.br_code ?? "")
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (loading) return <Loading full />

  if (notFound || !campanha) {
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
          <Link to={`/campanha/${campanha.id}`}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-semibold">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voltar para a campanha
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-line p-4">
          <p className="text-xs text-muted mb-1">Doando para</p>
          <p className="font-bold text-ink">{campanha.title}</p>
          <p className="text-xs text-muted mt-0.5">{institutionName}</p>
        </div>

        <Passo passo={passo} />

        {passo === 1 && (
          <PassoValor
            valor={valor} setValor={setValor}
            isCustom={isCustom} setIsCustom={setIsCustom}
            valorCustom={valorCustom} setValorCustom={setValorCustom}
            onNext={handleAvancarPagamento}
            loading={criando}
            erro={erroCriacao}
          />
        )}
        {passo === 2 && (
          <PassoPagamento
            metodo={metodo} setMetodo={setMetodo}
            cartao={cartao} setCartao={setCartao}
            copiado={copiado} onCopiarPix={handleCopiarPix}
            donation={donation} setDonation={setDonation}
            onBack={handleVoltarParaValor}
            onNext={() => setPasso(3)}
            onConfirmarPix={handleConfirmarPix}
            onConfirmarCartao={handleConfirmarCartao}
            aguardandoPagamento={metodo === "pix" && !!donation && donation.status !== "PAID"}
            criando={criando}
            erro={erroCriacao}
          />
        )}
        {passo === 3 && (
          <PassoConfirmacao
            campanha={campanha} institutionName={institutionName}
            valor={valorFinal} metodo={metodo} donation={donation}
          />
        )}
      </div>
    </div>
  )
}

function Passo({ passo }) {
  const passos = ["Valor", "Pagamento", "Confirmação"]
  return (
    <div className="flex items-center gap-2">
      {passos.map((label, i) => {
        const num = i + 1
        const ativo = num === passo
        const feito = num < passo
        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${feito || ativo ? "bg-primary text-white" : "bg-soft text-muted"}`}>
                {feito ? <CheckIcon style={{ fontSize: 14 }} /> : num}
              </div>
              <span className={`text-sm hidden sm:block font-medium ${ativo ? "text-ink" : "text-muted"}`}>{label}</span>
            </div>
            {i < passos.length - 1 && <div className="flex-1 h-px bg-line mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

function PassoValor({ valor, setValor, isCustom, setIsCustom, valorCustom, setValorCustom, onNext, loading, erro }) {
  function handlePreset(v) { setValor(v); setIsCustom(false); setValorCustom("") }
  const valorFinal = isCustom ? Number(valorCustom) || 0 : valor

  return (
    <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-6">
      <div>
        <p className="text-sm font-bold text-ink mb-3">Escolha um valor</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {VALORES_PRESET.map((v) => (
            <button key={v} onClick={() => handlePreset(v)}
              className={`py-2.5 rounded-lg text-sm font-bold border transition-colors ${!isCustom && valor === v ? "bg-primary text-white border-primary" : "bg-white text-muted border-line hover:border-primary hover:text-primary"}`}>
              {v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
            </button>
          ))}
          <button onClick={() => { setIsCustom(true); setValor(0) }}
            className={`py-2.5 rounded-lg text-sm font-bold border transition-colors col-span-2 sm:col-span-5 ${isCustom ? "bg-primary text-white border-primary" : "bg-white text-muted border-line hover:border-primary hover:text-primary"}`}>
            Outro valor
          </button>
        </div>
        {isCustom && (
          <div className="mt-3">
            <Input type="money" min="1" value={valorCustom} onChange={(e) => setValorCustom(e.target.value)} placeholder="0,00" autoFocus />
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

      <button onClick={onNext} disabled={valorFinal < 1 || loading}
        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg py-3 transition-colors">
        {loading ? "Aguarde..." : "Continuar →"}
      </button>
    </div>
  )
}

function PassoPagamento({ metodo, setMetodo, cartao, setCartao, copiado, onCopiarPix, donation, setDonation, onBack, onNext, onConfirmarPix, onConfirmarCartao, aguardandoPagamento, criando, erro }) {
  const [buscandoCep, setBuscandoCep] = useState(false)

  async function handleEscolherMetodo(value) {
    if (value === metodo) return
    setDonation(null)
    setMetodo(value)
    if (value === "pix") onConfirmarPix()
  }

  async function handleCartao(e) {
    const { name, value } = e.target
    if (name === "cep") {
      const v = value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2")
      setCartao((prev) => ({ ...prev, cep: v }))
      if (v.replace(/\D/g, "").length === 8) {
        setBuscandoCep(true)
        try {
          const res = await fetch(`https://viacep.com.br/ws/${v.replace(/\D/g, "")}/json/`)
          const data = await res.json()
          if (!data.erro) {
            const cidades = await fetchCidades(data.uf)
            setCartao((prev) => ({
              ...prev, cep: v,
              rua:    data.logradouro ?? prev.rua,
              bairro: data.bairro     ?? prev.bairro,
              cidade: data.localidade ?? prev.cidade,
              estado: data.uf         ?? prev.estado,
              cidadesDisponiveis: cidades,
            }))
          }
        } catch { /* ignora */ } finally { setBuscandoCep(false) }
      }
      return
    }
    if (name === "estado") {
      setCartao((prev) => ({ ...prev, estado: value, cidade: "", cidadesDisponiveis: [] }))
      const cidades = await fetchCidades(value)
      setCartao((prev) => ({ ...prev, cidadesDisponiveis: cidades }))
      return
    }
    if (name === "validade") {
      const v = value.replace(/\D/g, "").slice(0, 4)
      const masked = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v
      setCartao((prev) => ({ ...prev, validade: masked }))
      return
    }
    setCartao((prev) => ({ ...prev, [name]: value }))
  }

  const cartaoValido = (
    cartao.numero.length >= 16 &&
    cartao.nome &&
    cartao.validade.length === 5 &&
    cartao.cvv.length >= 3 &&
    cartao.cep.replace(/\D/g, "").length === 8 &&
    cartao.numero_end
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
            const ativo = metodo === value
            return (
              <button key={value} type="button"
                onClick={() => handleEscolherMetodo(value)}
                disabled={criando && metodo !== value}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                  ativo
                    ? "border-primary bg-primary-light"
                    : "border-line bg-white hover:border-primary/40"
                }`}>
                <span className={ativo ? "text-primary" : "text-muted"}>{icon}</span>
                <div>
                  <p className={`text-sm font-bold ${ativo ? "text-primary" : "text-ink"}`}>{label}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Estado: nenhum método escolhido */}
      {!metodo && (
        <p className="text-sm text-muted text-center py-2">Escolha uma forma de pagamento acima para continuar.</p>
      )}

      {/* PIX */}
      {metodo === "pix" && (
        <div className="flex flex-col items-center gap-4">
          {criando ? (
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
                {copiado ? "Copiado!" : "Copiar"}
              </button>
            </div>
          )}

          {donation && (
            aguardandoPagamento ? (
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
      {metodo === "cartao" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Dados do cartão</p>
            <CampoCartao label="Número do cartão" name="numero" value={cartao.numero} onChange={handleCartao} placeholder="0000 0000 0000 0000" maxLength={16} inputMode="numeric" />
            <CampoCartao label="Nome impresso no cartão" name="nome" value={cartao.nome} onChange={handleCartao} placeholder="Como aparece no cartão" />
            <div className="grid grid-cols-2 gap-3">
              <CampoCartao label="Validade" name="validade" value={cartao.validade} onChange={handleCartao} placeholder="MM/AA" maxLength={5} />
              <CampoCartao label="CVV" name="cvv" value={cartao.cvv} onChange={handleCartao} placeholder="000" maxLength={4} inputMode="numeric" />
            </div>
          </div>

          <div className="h-px bg-line" />

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Endereço de cobrança</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5 relative">
                <CampoCartao label="CEP" name="cep" value={cartao.cep} onChange={handleCartao} placeholder="00000-000" maxLength={9} inputMode="numeric" />
                {buscandoCep && <span className="absolute right-3 bottom-2.5 w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
              </div>
              <CampoCartao label="Número" name="numero_end" value={cartao.numero_end} onChange={handleCartao} placeholder="123" />
            </div>
            <CampoCartao label="Rua / Logradouro" name="rua" value={cartao.rua} onChange={handleCartao} placeholder="Rua, Avenida, Travessa..." />
            <CampoCartao label="Bairro" name="bairro" value={cartao.bairro} onChange={handleCartao} placeholder="Bairro" />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">Estado</label>
                <Select name="estado" value={cartao.estado} onChange={handleCartao} options={ESTADOS} placeholder="Selecione" searchable />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted">Cidade</label>
                {cartao.cidadesDisponiveis?.length > 0 ? (
                  <Select name="cidade" value={cartao.cidade} onChange={handleCartao} options={cartao.cidadesDisponiveis.map((c) => ({ value: c, label: c }))} placeholder="Selecione" searchable />
                ) : (
                  <Input name="cidade" value={cartao.cidade} onChange={handleCartao} placeholder="Cidade" />
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
        {metodo === "cartao" && (
          <button onClick={onConfirmarCartao} disabled={!cartaoValido || criando}
            className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 transition-colors">
            {criando ? "Processando..." : "Confirmar doação"}
          </button>
        )}
      </div>
    </div>
  )
}

async function fetchCidades(uf) {
  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
    const data = await res.json()
    return data.map((m) => m.nome)
  } catch { return [] }
}

function CampoCartao({ label, name, value, onChange, placeholder, maxLength, inputMode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted">{label}</label>
      <Input name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} inputMode={inputMode} />
    </div>
  )
}

function PassoConfirmacao({ campanha, institutionName, valor, metodo, donation }) {
  const metodoLabel = metodo === "pix" ? "PIX" : "Cartão de crédito"
  const valorFormatado = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

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
          <p className="text-3xl font-bold text-white">{valorFormatado}</p>
        </div>

        {/* Detalhes */}
        <div className="px-5 py-4 flex flex-col divide-y divide-line">
          <LinhaResumo label="Campanha" value={campanha.title} />
          <LinhaResumo label="Instituição" value={institutionName} />
          <LinhaResumo label="Forma de pagamento" value={metodoLabel} />
          {donation?.id && (
            <LinhaResumo label="Protocolo" value={`#${donation.id.slice(0, 8).toUpperCase()}`} mono />
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3 w-full">
        <Link to={`/campanha/${campanha.id}`}
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

function LinhaResumo({ label, value, mono }) {
  return (
    <div className="flex justify-between items-center gap-4 py-3 text-sm">
      <span className="text-muted shrink-0">{label}</span>
      <span className={`font-semibold text-right text-ink ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}
