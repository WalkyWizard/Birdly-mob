import { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import { analyzeAudio } from '../services/api'
import type { AudioAnalysisResponse } from '../types'

export function useAudioAnalysis() {
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioName, setAudioName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AudioAnalysisResponse | null>(null)

  async function pickAudio() {
    setError(null)
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true
      })

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0]
        setAudioUri(asset.uri)
        setAudioName(asset.name || 'sound.wav')
        setResult(null)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка вибору аудіофайлу')
      }
    }
  }

  async function analyze() {
    if (!audioUri) {
      setError('Будь ласка, оберіть аудіофайл')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeAudio(audioUri, audioName || 'sound.wav')
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка під час аналізу аудіо')
      }
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setAudioUri(null)
    setAudioName(null)
    setResult(null)
    setError(null)
  }

  return {
    audioUri,
    audioName,
    loading,
    error,
    result,
    pickAudio,
    analyze,
    reset
  }
}
