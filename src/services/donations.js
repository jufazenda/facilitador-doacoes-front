import api from "./api"
export const getDonations   = ()   => api.get("/api/v1/donations").then(r => r.data)
export const getDonationById = (id) => api.get(`/api/v1/donations/${id}`).then(r => r.data)

/**
 * Cria uma doação e retorna o objeto com o link de pagamento AbacatePay.
 * @param {{ user_id: string, amount: number, institution_id?: string, campaign_id?: string }} body
 */
export const createDonation = (client, body) => client.post("/api/v1/donations", body).then(r => r.data)
