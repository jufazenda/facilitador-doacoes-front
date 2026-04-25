import logo from "../assets/logo.png"
import imgVictor from "../assets/images/us/victor.png"
import imgCaio   from "../assets/images/us/caio.png"
import imgNiner  from "../assets/images/us/niner.png"
import imgJubs   from "../assets/images/us/jubs.png"
import imgFarm   from "../assets/images/us/farm.png"
import imgMa     from "../assets/images/us/ma.png"
import imgBeka   from "../assets/images/us/beka.png"
import logoUfcspa       from "../assets/images/ufcspa.png"
import logoInfoBiomedica from "../assets/images/informatica-biomedica.png"

const TEAM = [
  { name: "Caio Foti",          photo: imgCaio,   linkedin: "https://www.linkedin.com/in/caiofoti/" },
  { name: "Janiner Severo",     photo: imgNiner,  linkedin: "https://www.linkedin.com/in/janiner-severo/" },
  { name: "Júlia Fazenda",      photo: imgFarm,   linkedin: "https://www.linkedin.com/in/julia-fazenda-ruiz/" },
  { name: "Júlia Flach",        photo: imgJubs,   linkedin: "https://www.linkedin.com/in/juliacamillyflach/" },
  { name: "Maria Antonia Maia", photo: imgMa,     linkedin: "https://www.linkedin.com/in/mariaantoniamaia/" },
  { name: "Rebeca Kepler",      photo: imgBeka,   linkedin: "https://www.linkedin.com/in/rebeca-kepler/" },
  { name: "Victor Octávio",     photo: imgVictor, linkedin: "https://www.linkedin.com/in/victor-octavio/?locale=pt" },
]

export default function AboutUs() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-linear-to-br from-purple-50 via-white to-purple-100 px-4 py-10 text-center sm:py-14">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
          <img src={logo} alt="Faz a Boa" className="h-20 w-auto drop-shadow-md sm:h-24" />
          <h1 className="text-4xl font-black text-purple-950 sm:text-5xl">Sobre Nós</h1>
        </div>
      </section>

      {/* ── O Projeto ── */}
      <section className="bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">

          <div className="flex flex-col gap-4">
            <p className="leading-relaxed text-muted">
              O <strong className="text-ink">Faz a Boa</strong> é uma plataforma de facilitação de
              doações desenvolvida por estudantes do curso de{" "}
              <strong className="text-ink">Informática Biomédica da UFCSPA</strong> como projeto da
              disciplina de <strong className="text-ink">Práticas Extensionistas</strong>.
            </p>
            <p className="leading-relaxed text-muted">
              A ideia surgiu de um problema real: instituições sociais têm dificuldade em manter a
              recorrência das doações e em divulgar suas necessidades, que mudam constantemente. Sem
              visibilidade e sem ferramentas adequadas, o processo acaba sendo informal e pouco
              transparente para quem doa.
            </p>
            <p className="leading-relaxed text-muted">
              Para mudar isso, criamos uma plataforma onde instituições verificadas podem cadastrar
              campanhas com metas e prazos, marcar necessidades urgentes e prestar contas
              publicamente. Doadores conseguem contribuir de forma única ou recorrente via Pix e
              Cartão de Crédito, acompanhar o impacto das suas doações e receber atualizações
              automáticas sobre as campanhas que apoiam.
            </p>
          </div>

          <blockquote className="rounded-3xl bg-linear-to-br from-purple-700 to-purple-950 px-8 py-8 text-center text-lg font-bold italic leading-relaxed text-white shadow-2xl shadow-purple-950/25">
            "Nossa missão é formalizar a cultura da doação, ampliar a visibilidade das instituições
            e construir confiança por meio da transparência."
          </blockquote>
        </div>
      </section>

      {/* ── Equipe ── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-10">
          <div className="text-center">
            <h2 className="text-3xl font-black text-purple-950 sm:text-4xl">Equipe</h2>
            <p className="mt-2 text-muted">Os estudantes por trás do Faz a Boa</p>
          </div>

          <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {TEAM.map((member) => (
              <a
                key={member.name}
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex cursor-pointer flex-col items-center gap-3 rounded-3xl border border-purple-100 bg-white px-4 py-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg"
              >
                {/* Photo circle */}
                <div className="relative">
                  <div
                    className="h-20 w-20 rounded-full ring-4 ring-white shadow-md"
                    style={{ backgroundImage: `url(${member.photo})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  >
                    {/* LinkedIn overlay on hover */}
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0A66C2]/80 opacity-0 transition-opacity group-hover:opacity-100">
                      <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-extrabold leading-snug text-purple-950 transition-colors group-hover:text-purple-600">
                  {member.name}
                </p>
              </a>
            ))}
          </div>

          <div className="w-full rounded-2xl border border-purple-100 bg-white px-6 py-4 text-center text-sm text-muted shadow-sm">
            Orientado pelo <strong className="text-ink">Prof. Muriel Franco</strong>
            {" · "}
            <strong className="text-ink">Informática Biomédica</strong>
            {" · "}
            <strong className="text-ink">UFCSPA · 2026</strong>
          </div>
        </div>
      </section>

      {/* ── Logos institucionais ── */}
      <section className="border-t border-purple-100 bg-white px-4 py-12">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Desenvolvido no âmbito de
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <img src={logoUfcspa}        alt="UFCSPA"               className="h-16 w-auto opacity-90 sm:h-20" />
            <img src={logoInfoBiomedica} alt="Informática Biomédica" className="h-16 w-auto opacity-90 sm:h-20" />
          </div>
        </div>
      </section>

    </div>
  )
}
