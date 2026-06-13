import { useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useApiClient } from "../hooks/useApiClient"
import { createUser } from "../services/users"
import { createInstitution } from "../services/institutions"
import FormField from "../components/ui/FormField"
import Textarea from "../components/ui/Textarea"
import { maskCpf, maskCnpj, maskPhone } from "../utils/masks"

export default function CompleteRegistration() {

  const { user: auth0User, loginWithRedirect } = useAuth0()
  const client = useApiClient()

  const [profile, setProfile] = useState(null) // "donor" | "institution"
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const [donor, setDonor] = useState({ nome: auth0User?.name ?? "", email: auth0User?.email ?? "", cpf: "", terms: false })
  const [institution, setInstitution] = useState({ nome: "", legalName: "", cnpj: "", email: auth0User?.email ?? "", phone: "", address: "", description: "", terms: false })

  function handleDonor(e) {
    const { name, value, type, checked } = e.target
    setDonor((p) => ({ ...p, [name]: type === "checkbox" ? checked : name === "cpf" ? maskCpf(value) : value }))
  }

  function handleInstitution(e) {
    const { name, value, type, checked } = e.target
    setInstitution((p) => ({ ...p, [name]: type === "checkbox" ? checked : name === "cnpj" ? maskCnpj(value) : name === "phone" ? maskPhone(value) : value }))
  }

  async function submitDonor(e) {
    e.preventDefault()
    setError("")
    setSending(true)
    try {
      await createUser(client, {
        name:  donor.nome,
        email: donor.email,
        cpf:   donor.cpf.replace(/\D/g, ""),
        role:  "donor",
      })
      // Força novo token com o role setado
      await loginWithRedirect({ appState: { returnTo: "/area/doador" } })
    } catch (err) {
      setError(err?.response?.data?.error === "email already in use"
        ? "Este e-mail já está cadastrado."
        : "Erro ao criar conta. Tente novamente.")
      setSending(false)
    }
  }

  async function submitInstitution(e) {
    e.preventDefault()
    setError("")
    setSending(true)
    try {
      await createInstitution(client, {
        name:        institution.nome,
        legal_name:  institution.legalName,
        cnpj:        institution.cnpj.replace(/\D/g, ""),
        email:       institution.email,
        phone:       institution.phone.replace(/\D/g, ""),
        address:     institution.address,
        description: institution.description,
      })
      // Força novo token com o role setado
      await loginWithRedirect({ appState: { returnTo: "/area/instituicao" } })
    } catch (err) {
      setError(err?.response?.data?.error === "cnpj already in use"
        ? "Este CNPJ já está cadastrado."
        : "Erro ao cadastrar instituição. Tente novamente.")
      setSending(false)
    }
  }

  if (sending) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted text-sm">Criando seu perfil...</p>
      </div>
    )
  }

  // Step 1 — escolha de perfil
  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">Bem-vindo ao Faz a Boa!</h1>
            <p className="text-sm text-muted mt-2">Como você quer usar a plataforma?</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => setProfile("donor")}
              className="group flex flex-col items-center gap-4 rounded-xl border-2 border-line bg-white p-8 text-center transition hover:border-primary hover:bg-soft"
            >
              <span className="text-5xl">🤝</span>
              <div>
                <p className="font-bold text-ink text-lg group-hover:text-primary transition">Sou doador</p>
                <p className="text-sm text-muted mt-1">Quero apoiar causas e acompanhar minhas doações</p>
              </div>
            </button>

            <button
              onClick={() => setProfile("institution")}
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
  if (profile === "donor") {
    return (
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5 sm:p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-ink">Complete seu perfil</h1>
              <p className="text-sm text-muted mt-1">Só mais alguns dados para finalizar</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={submitDonor} className="flex flex-col gap-4">
              <FormField label="Nome completo" id="nome" name="nome" type="text"
                value={donor.nome} onChange={handleDonor} placeholder="Seu nome completo" />
              <FormField label="E-mail" id="email" name="email" type="email"
                value={donor.email} onChange={handleDonor} placeholder="seu@email.com" />
              <FormField label="CPF" id="cpf" name="cpf" type="text" inputMode="numeric"
                value={donor.cpf} onChange={handleDonor} placeholder="000.000.000-00" />

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" name="terms" checked={donor.terms}
                  onChange={handleDonor} required className="mt-0.5 accent-primary" />
                <span className="text-xs text-muted">
                  Concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e a <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                </span>
              </label>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setProfile(null); setError("") }}
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
    <div className="flex-1 flex items-start justify-center py-8 px-4 sm:py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink">Cadastrar instituição</h1>
            <p className="text-sm text-muted mt-1">Após o cadastro, sua conta será analisada pela nossa equipe</p>
          </div>

          <div className="bg-warning-light border border-warning/30 rounded-lg px-4 py-3 text-sm text-ink">
            Sua instituição só aparecerá publicamente após a verificação dos documentos pelo nosso time.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={submitInstitution} className="flex flex-col gap-4">
            <FormField label="Nome da instituição" id="nome" name="nome" type="text"
              value={institution.nome} onChange={handleInstitution} placeholder="Nome como é conhecida" />
            <FormField label="Razão social" id="legalName" name="legalName" type="text"
              value={institution.legalName} onChange={handleInstitution} placeholder="Nome jurídico completo" />
            <FormField label="CNPJ" id="cnpj" name="cnpj" type="text" inputMode="numeric"
              value={institution.cnpj} onChange={handleInstitution} placeholder="00.000.000/0000-00" />
            <FormField label="E-mail institucional" id="email" name="email" type="email"
              value={institution.email} onChange={handleInstitution} placeholder="contato@instituicao.org" />
            <FormField label="Telefone" id="phone" name="phone" type="tel"
              value={institution.phone} onChange={handleInstitution} placeholder="(00) 00000-0000" />
            <FormField label="Endereço" id="address" name="address" type="text"
              value={institution.address} onChange={handleInstitution} placeholder="Rua, número, cidade – UF" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink" htmlFor="description">Descrição</label>
              <Textarea id="description" name="description" required rows={3}
                value={institution.description} onChange={handleInstitution}
                placeholder="Descreva a missão e o trabalho da sua instituição" />
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" name="terms" checked={institution.terms}
                onChange={handleInstitution} required className="mt-0.5 accent-primary" />
              <span className="text-xs text-muted">
                Concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e a <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => { setProfile(null); setError("") }}
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
