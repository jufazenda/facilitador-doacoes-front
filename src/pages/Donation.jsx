import { useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { campanhas } from "../utils/mockData"

const VALORES_PRESET = [10, 25, 50, 100, 200]

export default function Donation() {
  const { campanhaId } = useParams()
  const [searchParams] = useSearchParams()
  const campanha = campanhas.find((c) => c.id === Number(campanhaId))

  const [passo, setPasso] = useState(1)
  const [valor, setValor] = useState(50)
  const [valorCustom, setValorCustom] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [tipo, setTipo] = useState(searchParams.get("tipo") === "recorrente" ? "recorrente" : "unica")
  const [intervalo, setIntervalo] = useState("mensal")
  const [metodo, setMetodo] = useState("pix")
  const [copiado, setCopiado] = useState(false)
  const [cartao, setCartao] = useState({ numero: "", nome: "", validade: "", cvv: "" })

  const valorFinal = isCustom ? Number(valorCustom) || 0 : valor

  if (!campanha) {
    return (
      <div className="py-20 text-center text-muted px-4">
        <p className="text-lg">Campanha não encontrada.</p>
        <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">← Voltar</Link>
      </div>
    )
  }

  function handleCopiarPix() {
    navigator.clipboard.writeText("facilitador@doacoes.org.br")
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-line p-4">
          <p className="text-xs text-muted mb-1">Doando para</p>
          <p className="font-bold text-ink">{campanha.titulo}</p>
          <p className="text-xs text-muted mt-0.5">{campanha.instituicao}</p>
        </div>

        <Passo passo={passo} />

        {passo === 1 && <PassoValor valor={valor} setValor={setValor} isCustom={isCustom} setIsCustom={setIsCustom} valorCustom={valorCustom} setValorCustom={setValorCustom} tipo={tipo} setTipo={setTipo} intervalo={intervalo} setIntervalo={setIntervalo} onNext={() => setPasso(2)} />}
        {passo === 2 && <PassoPagamento metodo={metodo} setMetodo={setMetodo} cartao={cartao} setCartao={setCartao} copiado={copiado} onCopiarPix={handleCopiarPix} onBack={() => setPasso(1)} onNext={() => setPasso(3)} />}
        {passo === 3 && <PassoConfirmacao campanha={campanha} valor={valorFinal} tipo={tipo} intervalo={intervalo} metodo={metodo} />}
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
                {feito ? "✓" : num}
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

function PassoValor({ valor, setValor, isCustom, setIsCustom, valorCustom, setValorCustom, tipo, setTipo, intervalo, setIntervalo, onNext }) {
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
          <div className="mt-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">R$</span>
            <input type="number" min="1" value={valorCustom} onChange={(e) => setValorCustom(e.target.value)} placeholder="0,00" autoFocus
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
          </div>
        )}
      </div>

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

      <button onClick={onNext} disabled={valorFinal < 1}
        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg py-3 transition-colors">
        Continuar →
      </button>
    </div>
  )
}

function PassoPagamento({ metodo, setMetodo, cartao, setCartao, copiado, onCopiarPix, onBack, onNext }) {
  function handleCartao(e) { setCartao((prev) => ({ ...prev, [e.target.name]: e.target.value })) }
  const cartaoValido = cartao.numero.length >= 16 && cartao.nome && cartao.validade && cartao.cvv.length >= 3

  return (
    <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-6">
      <div>
        <p className="text-sm font-bold text-ink mb-3">Forma de pagamento</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ value: "pix", label: "Pix" }, { value: "cartao", label: "Cartão de crédito" }].map(({ value, label }) => (
            <button key={value} onClick={() => setMetodo(value)}
              className={`py-2.5 rounded-lg text-sm font-bold border transition-colors ${metodo === value ? "bg-primary text-white border-primary" : "bg-white text-muted border-line hover:border-primary hover:text-primary"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {metodo === "pix" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-44 h-44 bg-soft rounded-xl border border-line flex items-center justify-center text-muted text-sm">QR Code</div>
          <div className="w-full flex items-center gap-2 bg-soft rounded-lg border border-line px-3 py-2.5">
            <span className="text-sm text-muted flex-1 truncate">facilitador@doacoes.org.br</span>
            <button onClick={onCopiarPix} className="text-xs font-bold text-primary hover:underline shrink-0">
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-muted text-center">Após o pagamento, sua doação será confirmada automaticamente.</p>
        </div>
      )}

      {metodo === "cartao" && (
        <div className="flex flex-col gap-3">
          <CampoCartao label="Número do cartão" name="numero" value={cartao.numero} onChange={handleCartao} placeholder="0000 0000 0000 0000" maxLength={16} />
          <CampoCartao label="Nome no cartão" name="nome" value={cartao.nome} onChange={handleCartao} placeholder="Como aparece no cartão" />
          <div className="grid grid-cols-2 gap-3">
            <CampoCartao label="Validade" name="validade" value={cartao.validade} onChange={handleCartao} placeholder="MM/AA" maxLength={5} />
            <CampoCartao label="CVV" name="cvv" value={cartao.cvv} onChange={handleCartao} placeholder="000" maxLength={4} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-line text-muted hover:border-ink rounded-lg py-3 text-sm font-semibold transition-colors">← Voltar</button>
        <button onClick={onNext} disabled={metodo === "cartao" && !cartaoValido}
          className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg py-3 transition-colors">
          {metodo === "pix" ? "Já paguei" : "Confirmar doação"}
        </button>
      </div>
    </div>
  )
}

function CampoCartao({ label, name, value, onChange, placeholder, maxLength }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
    </div>
  )
}

function PassoConfirmacao({ campanha, valor, tipo, intervalo, metodo }) {
  const metodoLabel = metodo === "pix" ? "Pix" : "Cartão de crédito"
  const tipoLabel = tipo === "unica" ? "Única" : `Recorrente ${intervalo === "mensal" ? "mensal" : "trimestral"}`

  return (
    <div className="bg-white rounded-xl border border-line p-6 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center text-3xl text-success">✓</div>
      <div>
        <h2 className="text-xl font-bold text-ink">Doação registrada!</h2>
        <p className="text-sm text-muted mt-1">Obrigado por fazer a diferença. Você receberá um comprovante por e-mail.</p>
      </div>

      <div className="w-full bg-soft rounded-xl p-4 flex flex-col gap-3 text-left">
        <LinhaResumo label="Campanha" value={campanha.titulo} />
        <LinhaResumo label="Instituição" value={campanha.instituicao} />
        <LinhaResumo label="Valor" value={valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
        <LinhaResumo label="Tipo" value={tipoLabel} />
        <LinhaResumo label="Pagamento" value={metodoLabel} />
        <LinhaResumo label="Status" value="Pendente" highlight />
      </div>

      <p className="text-xs text-muted">Status: <strong>Pendente → Processado → Confirmado → Aplicado</strong></p>

      <div className="flex flex-col gap-3 w-full">
        <Link to={`/campanha/${campanha.id}`}
          className="w-full text-center border border-line hover:border-primary text-muted text-sm font-semibold rounded-lg py-2.5 transition-colors hover:text-primary">
          Voltar para a campanha
        </Link>
        <Link to="/" className="w-full text-center bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors">
          Ver outras campanhas
        </Link>
      </div>
    </div>
  )
}

function LinhaResumo({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="text-muted shrink-0">{label}</span>
      <span className={`font-semibold text-right ${highlight ? "text-warning" : "text-ink"}`}>{value}</span>
    </div>
  )
}
