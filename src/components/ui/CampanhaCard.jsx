import { Link } from "react-router-dom"

export default function CampanhaCard({ campanha }) {
  const { id, titulo, instituicao, categoria, descricao, meta, arrecadado, urgente } = campanha
  const percentual = Math.min(Math.round((arrecadado / meta) * 100), 100)

  return (
    <Link to={`/campanha/${id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 h-full group-hover:shadow-md transition-shadow">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            {categoria}
          </span>
          {urgente && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              Urgente
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
          {titulo}
        </h3>

        {/* Institution */}
        <p className="text-sm text-gray-500">{instituicao}</p>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 flex-1">{descricao}</p>

        {/* Progress */}
        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${percentual}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              <span className="font-semibold text-gray-800">
                {arrecadado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>{" "}
              arrecadados
            </span>
            <span>{percentual}%</span>
          </div>
          <p className="text-xs text-gray-400">
            Meta: {meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>

        {/* CTA */}
        <button className="mt-1 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg py-2 transition-colors">
          Doar agora
        </button>
      </div>
    </Link>
  )
}
