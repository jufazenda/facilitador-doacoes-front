import api from "./api"

// Public
export const getCampaigns = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.keyword)  params.set("keyword", filters.keyword)
  if (filters.isUrgent !== undefined) params.set("is_urgent", String(filters.isUrgent))
  return api.get("/api/v1/campaigns", { params }).then(r => r.data)
}

export const getCampaignById           = (id)            => api.get(`/api/v1/campaigns/${id}`).then(r => r.data)
export const getCampaignsByInstitution = (institutionId) => api.get(`/api/v1/institutions/${institutionId}/campaigns`).then(r => r.data)

// Institution auth
export const createCampaign = (client, institutionId, body) =>
  client.post(`/api/v1/institutions/${institutionId}/campaigns`, body).then(r => r.data)

export const updateCampaign = (client, id, body) =>
  client.put(`/api/v1/campaigns/${id}`, body).then(r => r.data)

export const deleteCampaign = (client, id) =>
  client.delete(`/api/v1/campaigns/${id}`).then(r => r.data)

export const updateCampaignStatus = (client, id, status) =>
  client.patch(`/api/v1/campaigns/${id}/status`, { status }).then(r => r.data)
