import api from "./api"

// Public
export const getNecessitiesByInstitution = (institutionId) =>
  api.get(`/api/v1/institutions/${institutionId}/necessities`).then(r => r.data)

export const getNecessityById = (id) =>
  api.get(`/api/v1/necessities/${id}`).then(r => r.data)

// Institution auth
export const createNecessity = (client, institutionId, body) =>
  client.post(`/api/v1/institutions/${institutionId}/necessities`, body).then(r => r.data)

export const updateNecessity = (client, id, body) =>
  client.put(`/api/v1/necessities/${id}`, body).then(r => r.data)

export const deleteNecessity = (client, id) =>
  client.delete(`/api/v1/necessities/${id}`).then(r => r.data)

export const updateNecessityStatus = (client, id, status) =>
  client.patch(`/api/v1/necessities/${id}/status`, { status }).then(r => r.data)
