import api from "./api"

// Public
export const getInstitutions    = ()   => api.get("/api/v1/institutions").then(r => r.data)
export const getInstitutionById = (id) => api.get(`/api/v1/institutions/${id}`).then(r => r.data)

// Auth only (qualquer usuário autenticado)
export const createInstitution = (client, body) =>
  client.post("/api/v1/institutions", body).then(r => r.data)

export const updateInstitutionStatus = (client, id, status) =>
  client.patch(`/api/v1/institutions/${id}/status`, { status }).then(r => r.data)

// Institution auth (apenas a própria instituição)
export const getMyInstitution = (client) =>
  client.get("/api/v1/institutions/me").then(r => r.data)

export const updateInstitution = (client, id, body) =>
  client.put(`/api/v1/institutions/${id}`, body).then(r => r.data)

export const deleteInstitution = (client, id) =>
  client.delete(`/api/v1/institutions/${id}`).then(r => r.data)
