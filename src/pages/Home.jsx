import { useState, useMemo } from "react"
import CampaignCard from "../components/ui/CampaignCard"
import { campanhas, categorias } from "../utils/mockData"

export default function Home() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas")
  const [apenasUrgentes, setApenasUrgentes] = useState(false)

  const campanhasFiltradas = useMemo(() => {
    return campanhas.filter((c) => {
      const passaCategoria = categoriaAtiva === "Todas" || c.categoria === categoriaAtiva
      const passaUrgente = !apenasUrgentes || c.urgente
      return passaCategoria && passaUrgente
    })
  }, [categoriaAtiva, apenasUrgentes])

  return (
    <div className="flex flex-col gap-8 py-8 px-4">
      <section className="text-center py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3">
          Doe com propósito, transforme vidas
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Conectamos doadores a instituições verificadas que precisam de ajuda agora.
        </p>
      </section>

      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["Todas", ...categorias].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`text-sm px-3 py-1.5 rounded-full border font-semibold transition-colors ${
                categoriaAtiva === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted border-line hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
          <div
            onClick={() => setApenasUrgentes((v) => !v)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              apenasUrgentes ? "bg-accent" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                apenasUrgentes ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-sm text-muted font-medium">Apenas urgentes</span>
        </label>
      </section>

      <section>
        {campanhasFiltradas.length === 0 ? (
          <p className="text-center text-muted py-16">
            Nenhuma campanha encontrada para este filtro.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campanhasFiltradas.map((c) => (
              <CampaignCard key={c.id} campanha={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
