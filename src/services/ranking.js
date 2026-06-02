import api from "./api"

export const getRanking = (limit = 10) =>
  api.get(`/api/v1/ranking?limit=${limit}`).then((r) => r.data)
