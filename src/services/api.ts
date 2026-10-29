import type {
  ImageAnalysisResponse,
  AudioAnalysisResponse,
  MultimodalAnalysisResponse,
  HistoryRecord,
  BirdsMetadata,
  CompareResponse
} from '../types'

const API_HOST = process.env.EXPO_PUBLIC_API_URL || ['http:', '', '192.168.0.107:8000', 'api'].join('/')

export async function analyzeImage(fileUri: string, fileName: string): Promise<ImageAnalysisResponse> {
  const formData = new FormData()
  formData.append('file', {
    uri: fileUri,
    name: fileName || 'photo.jpg',
    type: 'image/jpeg'
  } as any)

  const response = await fetch(`${API_HOST}/analyze/image`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Помилка аналізу зображення')
  }

  return response.json()
}

export async function analyzeAudio(fileUri: string, fileName: string): Promise<AudioAnalysisResponse> {
  const formData = new FormData()
  formData.append('file', {
    uri: fileUri,
    name: fileName || 'sound.wav',
    type: 'audio/wav'
  } as any)

  const response = await fetch(`${API_HOST}/analyze/audio`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Помилка аналізу аудіо')
  }

  return response.json()
}

export async function analyzeMultimodal(
  imageUri: string,
  imageName: string,
  audioUri: string,
  audioName: string
): Promise<MultimodalAnalysisResponse> {
  const formData = new FormData()
  formData.append('image_file', {
    uri: imageUri,
    name: imageName || 'photo.jpg',
    type: 'image/jpeg'
  } as any)
  formData.append('audio_file', {
    uri: audioUri,
    name: audioName || 'sound.wav',
    type: 'audio/wav'
  } as any)

  const response = await fetch(`${API_HOST}/analyze/multimodal`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Помилка мультимодального аналізу')
  }

  return response.json()
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
  const response = await fetch(`${API_HOST}/history${queryStr}`, {
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
  const response = await fetch(`${API_HOST}/history/${id}`, {
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
  const response = await fetch(`${API_HOST}/birds`, {
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
  const response = await fetch(`${API_HOST}/birds/compare/${encA}/${encB}`, {
    headers: {
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Помилка порівняння видів')
  }

  return response.json()
}