import axios from 'axios'

export const API_BASE_URL = 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

export function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || fallbackMessage
}
