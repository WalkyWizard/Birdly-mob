import type {
  ImageAnalysisResponse,
  AudioAnalysisResponse,
  MultimodalAnalysisResponse,
  HistoryRecord,
  BirdsMetadata,
  CompareResponse
} from '../types'

const API_HOST = process.env.EXPO_PUBLIC_API_URL || ['http:', '', '192.168.0.105:8000', 'api'].join('/')

const REQUEST_TIMEOUT = 30000
const NETWORK_ERROR_MSG = 'Сервер недоступний. Перевірте, чи телефон підключений до тієї ж Wi-Fi мережі, що й комп\'ютер'

function getMimeType(fileName: string, fallback: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    wav: 'audio/wav',
    flac: 'audio/flac',
    ogg: 'audio/ogg',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac'
  }
  return (ext && map[ext]) || fallback
}

function uploadViaXHR<T>(
  url: string,
  files: { field: string; uri: string; name: string; type: string }[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      xhr.abort()
      reject(new Error(NETWORK_ERROR_MSG))
    }, REQUEST_TIMEOUT)

    xhr.open('POST', url)
    xhr.setRequestHeader('Accept', 'application/json')

    xhr.onload = () => {
      if (timedOut) return
      clearTimeout(timer)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          resolve(xhr.responseText as unknown as T)
        }
      } else {
        let detail = ''
        try {
          const parsed = JSON.parse(xhr.responseText)
          detail = parsed.detail || ''
        } catch {
          detail = xhr.responseText
        }
        reject(new Error(detail || `Помилка сервера (${xhr.status})`))
      }
    }

    xhr.onerror = () => {
      if (timedOut) return
      clearTimeout(timer)
      reject(new Error(NETWORK_ERROR_MSG))
    }

    xhr.ontimeout = () => {
      if (timedOut) return
      clearTimeout(timer)
      reject(new Error(NETWORK_ERROR_MSG))
    }

    const formData = new FormData()
    for (const f of files) {
      formData.append(f.field, {
        uri: f.uri,
        name: f.name,
        type: f.type
      } as unknown as Blob)
    }

    xhr.send(formData)
  })
}

async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(NETWORK_ERROR_MSG)), REQUEST_TIMEOUT)
  })
  try {
    const response = await Promise.race([
      fetch(url, init),
      timeoutPromise
    ])
    return response
  } catch (err: unknown) {
    if (err instanceof TypeError) {
      throw new Error(NETWORK_ERROR_MSG)
    }
    throw err
  }
}

export async function analyzeImage(fileUri: string, fileName: string): Promise<ImageAnalysisResponse> {
  const mime = getMimeType(fileName || 'photo.jpg', 'image/jpeg')
  return uploadViaXHR<ImageAnalysisResponse>(`${API_HOST}/analyze/image`, [
    { field: 'file', uri: fileUri, name: fileName || 'photo.jpg', type: mime }
  ])
}

export async function analyzeAudio(fileUri: string, fileName: string): Promise<AudioAnalysisResponse> {
  const mime = getMimeType(fileName || 'sound.wav', 'audio/wav')
  return uploadViaXHR<AudioAnalysisResponse>(`${API_HOST}/analyze/audio`, [
    { field: 'file', uri: fileUri, name: fileName || 'sound.wav', type: mime }
  ])
}

export async function analyzeMultimodal(
  imageUri: string,
  imageName: string,
  audioUri: string,
  audioName: string
): Promise<MultimodalAnalysisResponse> {
  const imgMime = getMimeType(imageName || 'photo.jpg', 'image/jpeg')
  const audMime = getMimeType(audioName || 'sound.wav', 'audio/wav')
  return uploadViaXHR<MultimodalAnalysisResponse>(`${API_HOST}/analyze/multimodal`, [
    { field: 'image_file', uri: imageUri, name: imageName || 'photo.jpg', type: imgMime },
    { field: 'audio_file', uri: audioUri, name: audioName || 'sound.wav', type: audMime }
  ])
}

export async function getHistory(
  search?: string,
  family?: string,
  habitat?: string
): Promise<HistoryRecord[]> {
  const params = new URLSearchParams()
  if (search && search.trim() !== '') {
    params.append('search', search.trim())
  }
  if (family && family !== 'Усі') {
    params.append('family', family)
  }
  if (habitat && habitat.trim() !== '') {
    params.append('habitat', habitat.trim())
  }

  const queryStr = params.toString() ? `?${params.toString()}` : ''
  const response = await apiFetch(`${API_HOST}/history${queryStr}`, {
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Помилка завантаження історії')
  }

  return response.json()
}

export async function deleteHistoryRecord(id: number): Promise<{ success: boolean; deleted_id: number }> {
  const response = await apiFetch(`${API_HOST}/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Помилка видалення запису')
  }

  return response.json()
}

export async function getBirdsMetadata(): Promise<BirdsMetadata> {
  const response = await apiFetch(`${API_HOST}/birds`, {
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Помилка завантаження довідника')
  }

  return response.json()
}

export async function compareBirds(speciesA: string, speciesB: string): Promise<CompareResponse> {
  const encA = encodeURIComponent(speciesA)
  const encB = encodeURIComponent(speciesB)
  const response = await apiFetch(`${API_HOST}/birds/compare/${encA}/${encB}`, {
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Помилка порівняння видів')
  }

  return response.json()
}
