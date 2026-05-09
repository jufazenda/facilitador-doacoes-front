import api from "./api"

// Public
export const getUsers   = ()   => api.get("/api/v1/users").then(r => r.data)
export const getUserById = (id) => api.get(`/api/v1/users/${id}`).then(r => r.data)

// Authenticated — pass the auth-aware client returned by useApiClient()
export const createUser  = (client, body) => client.post("/api/v1/users", body).then(r => r.data)
export const getMe       = (client)       => client.get("/api/v1/users/me").then(r => r.data)
export const updateUser  = (client, id, body) => client.put(`/api/v1/users/${id}`, body).then(r => r.data)
export const deleteUser  = (client, id)   => client.delete(`/api/v1/users/${id}`).then(r => r.data)
export const uploadAvatar = (client, id, file) => {
  const form = new FormData()
  form.append("avatar", file)
  return client.post(`/api/v1/users/${id}/avatar`, form).then(r => r.data)
}
