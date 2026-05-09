import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useApiClient } from "../hooks/useApiClient"
import { createUser } from "../services/users"
import { createInstitution } from "../services/institutions"

function mascararCpf(v) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function mascararCnpj(v) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
}

export default function CompleteRegistration() {
  const { user: auth0User, loginWithRedirect } = useAuth0()
  const client = useApiClient()

  const [perfil, setPerfil] = useState(null) // "donor" | "institution"
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")

  const [doador, setDoador] = useState({ nome: auth0User?.name ?? "", email: auth0User?.email ?? "", cpf: "", termos: false })
  const [instituicao, setInstituicao] = useState({ nome: "", razaoSocial: "", cnpj: "", email: auth0User?.email ?? "", telefone: "", endereco: "", descricao: "", termos: false })

  function handleDoador(e) {
    const { name, value, type, checked } = e.target
    setDoador((p) => ({ ...p, [name]: type === "checkbox" ? checked : name === "cpf" ? mascararCpf(value) : value }))
  }

  function handleInstituicao(e) {
    const { name, value, type, checked } = e.target
    setInstituicao((p) => ({ ...p, [name]: type === "checkbox" ? checked : name === "cnpj" ? mascararCnpj(value) : value }))
  }

  async function submitDoador(e) {
    e.preventDefault()
    setErro("")
    setEnviando(true)
    try {
      await createUser(client, {
        name:  doador.nome,
        email: doador.email,
        cpf:   doador.cpf.replace(/\D/g, ""),
        role:  "donor",
      })
      // Força novo token com o role setado
      await loginWithRedirect({ appState: { returnTo: "/area/doador" } })
    } catch (err) {
      setErro(err?.response?.data?.error === "email already in use"
        ? "Este e-mail já está cadastrado."
        : "Erro ao criar conta. Tente novamente.")
      setEnviando(false)
    }
  }

  async function submitInstituicao(e) {
    e.preventDefault()
    setErro("")
    setEnviando(true)
    try {
      await createInstitution(client, {
        name:        instituicao.nome,
        legal_name:  instituicao.razaoSocial,
        cnpj:        instituicao.cnpj.replace(/\D/g, ""),
        email:       instituicao.email,
        phone:       instituicao.telefone,
        address:     instituicao.endereco,
        description: instituicao.descricao,
      })
      // Força novo token com o role setado
      await loginWithRedirect({ appState: { returnTo: "/area/instituicao" } })
    } catch (err) {
      setErro(err?.response?.data?.error === "cnpj already in use"
        ? "Este CNPJ já está cadastrado."
        : "Erro ao cadastrar instituição. Tente novamente.")
      setEnviando(false)
    }
  }

  if (enviando) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-muted text-sm">Criando seu perfil...</p>
      </div>
    )
  }

  // Step 1 — escolha de perfil
  if (!perfil) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">Bem-vindo ao Faz a Boa!</h1>
            <p className="text-sm text-muted mt-2">Como você quer usar a plataforma?</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => setPerfil("donor")}
              className="group flex flex-col items-center gap-4 rounded-xl border-2 border-line bg-white p-8 text-center transition hover:border-primary hover:bg-soft"
            >
              <span className="text-5xl">🤝</span>
              <div>
                <p className="font-bold text-ink text-lg group-hover:text-primary transition">Sou doador</p>
                <p className="text-sm text-muted mt-1">Quero apoiar causas e acompanhar minhas doações</p>
              </div>
            </button>

            <button
              onClick={() => setPerfil("institution")}
              className="group flex flex-col items-center gap-4 rounded-xl border-2 border-line bg-white p-8 text-center transition hover:border-primary hover:bg-soft"
            >
              <span className="text-5xl">🏛️</span>
              <div>
                <p className="font-bold text-ink text-lg group-hover:text-primary transition">Sou uma instituição</p>
                <p className="text-sm text-muted mt-1">Quero cadastrar minha ONG e receber doações</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2a — formulário doador
  if (perfil === "donor") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5 sm:p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-ink">Complete seu perfil</h1>
              <p className="text-sm text-muted mt-1">Só mais alguns dados para finalizar</p>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{erro}</div>
            )}

            <form onSubmit={submitDoador} className="flex flex-col gap-4">
              <Campo label="Nome completo" id="nome" name="nome" type="text"
                value={doador.nome} onChange={handleDoador} placeholder="Seu nome completo" />
              <Campo label="E-mail" id="email" name="email" type="email"
                value={doador.email} onChange={handleDoador} placeholder="seu@email.com" />
              <Campo label="CPF" id="cpf" name="cpf" type="text" inputMode="numeric"
                value={doador.cpf} onChange={handleDoador} placeholder="000.000.000-00" />

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" name="termos" checked={doador.termos}
                  onChange={handleDoador} required className="mt-0.5 accent-primary" />
                <span className="text-xs text-muted">
                  Concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e a <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                </span>
              </label>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setPerfil(null); setErro("") }}
                  className="flex-1 border border-line rounded-lg py-3 text-sm font-semibold text-ink hover:bg-soft transition">
                  Voltar
                </button>
                <button type="submit"
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors">
                  Finalizar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Step 2b — formulário instituição
  return (
    <div className="flex items-start justify-center py-8 px-4 sm:py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink">Cadastrar instituição</h1>
            <p className="text-sm text-muted mt-1">Após o cadastro, sua conta será analisada pela nossa equipe</p>
          </div>

          <div className="bg-warning-light border border-warning/30 rounded-lg px-4 py-3 text-sm text-ink">
            Sua instituição só aparecerá publicamente após a verificação dos documentos pelo nosso time.
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{erro}</div>
          )}

          <form onSubmit={submitInstituicao} className="flex flex-col gap-4">
            <Campo label="Nome da instituição" id="nome" name="nome" type="text"
              value={instituicao.nome} onChange={handleInstituicao} placeholder="Nome como é conhecida" />
            <Campo label="Razão social" id="razaoSocial" name="razaoSocial" type="text"
              value={instituicao.razaoSocial} onChange={handleInstituicao} placeholder="Nome jurídico completo" />
            <Campo label="CNPJ" id="cnpj" name="cnpj" type="text" inputMode="numeric"
              value={instituicao.cnpj} onChange={handleInstituicao} placeholder="00.000.000/0000-00" />
            <Campo label="E-mail institucional" id="email" name="email" type="email"
              value={instituicao.email} onChange={handleInstituicao} placeholder="contato@instituicao.org" />
            <Campo label="Telefone" id="telefone" name="telefone" type="tel"
              value={instituicao.telefone} onChange={handleInstituicao} placeholder="(00) 00000-0000" />
            <Campo label="Endereço" id="endereco" name="endereco" type="text"
              value={instituicao.endereco} onChange={handleInstituicao} placeholder="Rua, número, cidade – UF" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink" htmlFor="descricao">Descrição</label>
              <textarea id="descricao" name="descricao" required rows={3}
                value={instituicao.descricao} onChange={handleInstituicao}
                placeholder="Descreva a missão e o trabalho da sua instituição"
                className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none" />
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" name="termos" checked={instituicao.termos}
                onChange={handleInstituicao} required className="mt-0.5 accent-primary" />
              <span className="text-xs text-muted">
                Concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e a <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => { setPerfil(null); setErro("") }}
                className="flex-1 border border-line rounded-lg py-3 text-sm font-semibold text-ink hover:bg-soft transition">
                Voltar
              </button>
              <button type="submit"
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg py-3 transition-colors">
                Enviar para verificação
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Campo({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink" htmlFor={id}>{label}</label>
      <input id={id} required {...props}
        className="rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition" />
    </div>
  )
}
