import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
})

export const uploadDocument = async (file, sessionId, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(`/documents?session_id=${sessionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
  return response.data
}

export const deleteDocument = async (documentId) => {
  await api.delete(`/documents/${documentId}`)
}

export const askQuestion = async (query, sessionId) => {
  const response = await api.post(`/queries/ask?session_id=${sessionId}&query=${encodeURIComponent(query)}`)
  return response.data
}

export const searchChunks = async (query, sessionId) => {
  const response = await api.post(`/queries/search?session_id=${sessionId}&query=${encodeURIComponent(query)}`)
  return response.data
}