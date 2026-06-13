export async function buscarEnderecoPorCep(cep) {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`)
    const data = await res.json()
    return data.erro ? null : data
  } catch {
    return null
  }
}

export async function buscarCidadesPorUf(uf) {
  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
    const data = await res.json()
    return data.map((m) => m.nome)
  } catch {
    return []
  }
}
