import heroImage from "../assets/hero.png";
import CampaignCard from "../components/ui/CampaignCard";
import {
  campaigns,
  campaignFilters,
  platformMetrics,
  steps,
} from "../utils/mockData";

export default function Home() {
  return (
    <>
      <section
        id="home"
        className="overflow-hidden bg-gradient-to-r from-[#FCFAFF] via-[#F5F0FF] to-white"
      >
        <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EEE4FF] px-4 py-2 text-sm font-extrabold text-purple-950">
              🛡️ Instituições verificadas, impacto real
            </span>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight text-purple-950 md:text-6xl">
              Doe com transparência.
              <br />
              Acompanhe o impacto.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Conectamos doadores com instituições que transformam o mundo.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#campaigns"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-700 px-7 py-4 font-extrabold text-white shadow-xl shadow-purple-300 transition hover:-translate-y-0.5 hover:bg-purple-800"
              >
                Ver campanhas
              </a>

              <a
                href="#register-institution"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-700 bg-white px-7 py-4 font-extrabold text-purple-800 transition hover:-translate-y-0.5 hover:bg-purple-50"
              >
                Cadastre instituições
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-6 z-10 text-7xl text-purple-300/60">
              ♡
            </div>

            <div className="absolute bottom-12 left-0 z-10 h-24 w-24 bg-[radial-gradient(#6F3DD9_2px,transparent_2px)] [background-size:16px_16px] opacity-30" />

            <img
              src={heroImage}
              alt="Children smiling in an inclusive care environment"
              className="h-[460px] w-full rounded-[2rem] object-cover shadow-2xl shadow-purple-950/10"
            />

            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-[#FCFAFF]/70 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section
        id="campaigns"
        className="relative z-10 -mt-8 rounded-t-[2rem] bg-white py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-2xl text-purple-600">✦</span>
              <h2 className="text-3xl font-black text-purple-950">Campanhas</h2>
            </div>

            <a href="#all-campaigns" className="font-extrabold text-purple-700">
              Ver todas as campanhas →
            </a>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {campaignFilters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`rounded-full border px-5 py-2.5 text-sm font-extrabold transition ${
                  index === 0
                    ? "border-purple-700 bg-purple-700 text-white"
                    : "border-purple-100 bg-[#F8F3FF] text-purple-950 hover:bg-purple-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 rounded-3xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-950 p-8 text-white shadow-2xl shadow-purple-950/20 md:grid-cols-3">
            {platformMetrics.map((metric) => (
              <div key={metric.label} className="flex items-center gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-3xl">
                  {metric.icon}
                </span>

                <div>
                  <strong className="block text-3xl font-black">
                    {metric.value}
                  </strong>
                  <span className="block font-extrabold">{metric.label}</span>
                  <small className="text-white/70">{metric.description}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white pb-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-black text-purple-950">How it works</h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.title} className="rounded-3xl bg-white p-6">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEE4FF] text-3xl text-purple-700">
                  {step.icon}
                </span>

                <h3 className="mt-5 font-black text-purple-950">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
