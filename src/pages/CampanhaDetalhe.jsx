import { useParams, Link } from "react-router-dom"
import { campanhas } from "../utils/mockData"

export default function CampanhaDetalhe() {
  const { id } = useParams()
  const campanha = campanhas.find((c) => c.id === Number(id))

  if (!campanha) {
    return (
      <div className="py-20 text-center text-gray-400 px-4">
        <p className="text-lg">Campanha não encontrada.</p>
        <Link to="/" className="text-green-600 hover:underline text-sm mt-2 inline-block">
          ← Voltar para campanhas
        </Link>
      </div>
    )
  }

  const { titulo, instituicao, instituicaoId, categoria, descricao, meta, arrecadado, urgente } =
    campanha
  const percentual = Math.min(Math.round((arrecadado / meta) * 100), 100)
  const falta = meta - arrecadado

  return (
    <div className="py-8 px-4">
      <Link to="/" className="text-sm text-green-600 hover:underline inline-flex items-center gap-1 mb-6">
        ← Voltar para campanhas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              {categoria}
            </span>
            {urgente && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                Urgente
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{titulo}</h1>

          {/* Institution */}
          <p className="text-sm text-gray-500">
            por{" "}
            <Link
              to={`/instituicao/${instituicaoId}`}
              className="text-green-600 hover:underline font-medium"
            >
              {instituicao}
            </Link>
          </p>

          <hr className="border-gray-100" />

          {/* Description */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Sobre esta campanha</h2>
            <p className="text-gray-600 leading-relaxed">{descricao}</p>
          </div>

          {/* Mobile donation card — shown below description on small screens */}
          <div className="lg:hidden">
            <DoacaoCard
              arrecadado={arrecadado}
              meta={meta}
              falta={falta}
              percentual={percentual}
            />
          </div>
        </div>

        {/* Sticky donation card — desktop only */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <DoacaoCard
              arrecadado={arrecadado}
              meta={meta}
              falta={falta}
              percentual={percentual}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function DoacaoCard({ arrecadado, meta, falta, percentual }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xl font-bold text-gray-900">
            {arrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
          <span className="text-sm font-medium text-green-600">{percentual}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${percentual}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>arrecadados</span>
          <span>
            Meta: {meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>

      {/* Remaining */}
      <p className="text-sm text-gray-500">
        Faltam{" "}
        <span className="font-semibold text-gray-800">
          {falta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>{" "}
        para atingir a meta.
      </p>

      {/* CTAs */}
      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-3 transition-colors">
        Fazer uma doação
      </button>
      <button className="w-full border border-green-600 text-green-600 hover:bg-green-50 font-medium rounded-lg py-3 transition-colors text-sm">
        Doação recorrente
      </button>

      <p className="text-xs text-center text-gray-400">Pagamento seguro via Pix ou cartão</p>
    </div>
  )
}
