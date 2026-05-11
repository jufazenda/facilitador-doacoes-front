import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import logo from "../assets/logo.png"
import CampaignCard from "../components/ui/CampaignCard"
import Loading from "../components/ui/Loading"
import { getCampaigns } from "../services/campaigns"
import { getInstitutions } from "../services/institutions"
import { steps } from "../utils/staticData"

export default function Home() {
  const [campanhas, setCampanhas] = useState([])
  const [instMap, setInstMap] = useState({})
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const hash = location.state?.scrollTo
    if (hash) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 100)
    }
  }, [location.state])

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }

  function slide(dir) {
    scrollRef.current?.scrollBy({ left: dir * 408, behavior: "smooth" })
  }

  useEffect(() => {
    Promise.all([getCampaigns(), getInstitutions()])
      .then(([camps, insts]) => {
        setCampanhas(camps ?? [])
        setInstMap(Object.fromEntries((insts ?? []).map((i) => [i.id, i.name])))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const preview = campanhas.slice(0, 6)

  return (
    <>
      <section id="home" className="overflow-hidden bg-linear-to-r from-page via-soft to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-xs font-extrabold text-purple-950 sm:px-4 sm:py-2 sm:text-sm">
              🛡️ Instituições verificadas, impacto real
            </span>

            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-purple-950 sm:text-4xl md:text-5xl lg:text-6xl">
              Doe com transparência.
              <br />
              Acompanhe o impacto.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Conectamos doadores com instituições que transformam o mundo.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
              <a
                href="#campaigns"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-linear-to-br from-purple-600 to-purple-800 px-7 py-4 font-extrabold text-white shadow-xl shadow-purple-400/40 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-400/50"
              >
                Ver campanhas
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-purple-200 bg-white px-7 py-4 font-extrabold text-purple-800 transition hover:-translate-y-1 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100"
              >
                Cadastre sua instituição
              </Link>
            </div>
          </div>

          <IllustracaoHero />
        </div>
      </section>

      <section id="campaigns" className="relative z-10 -mt-4 rounded-t-2xl bg-white py-12 sm:-mt-8 sm:rounded-t-4xl sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between sm:mb-8">
            <div>
              <span className="text-xl text-purple-600 sm:text-2xl">✦</span>
              <h2 className="text-2xl font-black text-purple-950 sm:text-3xl">Campanhas</h2>
            </div>
            <Link to="/campanhas" className="text-sm font-extrabold text-purple-700 transition hover:text-purple-900 hover:underline">
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : preview.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">Nenhuma campanha encontrada.</p>
          ) : (
            <div className="relative">
              {canScrollLeft && (
                <button
                  onClick={() => slide(-1)}
                  className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg shadow-purple-950/10 border border-purple-100 text-purple-700 transition hover:bg-purple-700 hover:text-white hover:border-purple-700"
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              <div
                ref={scrollRef}
                onScroll={updateArrows}
                className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex gap-6">
                  {preview.map((c) => (
                    <div key={c.id} className="w-96 shrink-0">
                      <CampaignCard campaign={c} institutionName={instMap[c.institution_id] ?? ""} />
                    </div>
                  ))}
                </div>
              </div>

              {canScrollRight && (
                <button
                  onClick={() => slide(1)}
                  className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg shadow-purple-950/10 border border-purple-100 text-purple-700 transition hover:bg-purple-700 hover:text-white hover:border-purple-700"
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="bg-white pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-black text-purple-950 sm:text-3xl">Como funciona</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.title} className="rounded-2xl bg-white p-4 sm:rounded-3xl sm:p-6">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-2xl text-purple-700 sm:h-16 sm:w-16 sm:text-3xl">
                  {step.icon}
                </span>
                <h3 className="mt-4 font-black text-purple-950 sm:mt-5">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function IllustracaoHero() {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72 sm:rounded-4xl lg:h-115 bg-linear-to-br from-purple-700 via-purple-800 to-purple-950 shadow-2xl shadow-purple-950/20">
      {/* Deep background blobs */}
      <div className="absolute -right-40 -top-40 h-128 w-lg rounded-full bg-purple-600/25" />
      <div className="absolute -bottom-40 -left-28 h-112 w-md rounded-full bg-purple-950/60" />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] bg-size-[28px_28px] opacity-[0.04]" />

      {/* Concentric rings around logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-104 w-104 rounded-full border border-white/4" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full border border-accent/10 sm:h-80 sm:w-80" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-44 w-44 rounded-full border border-accent/20 sm:h-56 sm:w-56" />
      </div>

      {/* Accent glow behind logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-48 w-48 rounded-full bg-accent/10 blur-[56px]" />
      </div>

      {/* Floating hearts — white */}
      <span className="absolute left-5 top-5 select-none text-6xl text-white/[0.07]">♡</span>
      <span className="absolute bottom-6 left-8 select-none text-5xl text-white/[0.07]">♡</span>
      <span className="absolute left-1/4 top-1/3 select-none text-2xl text-white/6">♡</span>

      {/* Floating hearts — accent */}
      <span className="absolute right-5 top-6 select-none text-4xl text-accent/45">♥</span>
      <span className="absolute bottom-8 right-8 select-none text-3xl text-accent/30">♡</span>
      <span className="absolute right-1/4 top-1/3 select-none text-xl text-accent/25">♥</span>

      {/* Sparkles */}
      <span className="absolute left-[22%] top-5 select-none text-sm text-accent/55">✦</span>
      <span className="absolute right-[22%] bottom-5 select-none text-sm text-accent/40">✦</span>
      <span className="absolute right-[30%] top-4 select-none text-xs text-white/25">✦</span>
      <span className="absolute left-[30%] bottom-4 select-none text-[10px] text-white/20">✦</span>

      {/* Logo — big and centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={logo}
          alt="Faz a Boa"
          className="h-32 w-auto object-contain drop-shadow-2xl sm:h-44 lg:h-64"
        />
      </div>

      {/* Accent dots floating */}
      <div className="absolute left-8 top-1/2 h-3.5 w-3.5 -translate-y-4 rounded-full bg-accent/55" />
      <div className="absolute right-8 top-1/2 h-3 w-3 translate-y-3 rounded-full bg-accent/45" />
      <div className="absolute bottom-7 left-1/4 h-2.5 w-2.5 rounded-full bg-white/20" />
      <div className="absolute right-1/4 top-7 h-2 w-2 rounded-full bg-white/20" />
      <div className="absolute right-8 top-1/2 h-5 w-5 -translate-y-8 rounded-full border border-accent/30" />
    </div>
  )
}
