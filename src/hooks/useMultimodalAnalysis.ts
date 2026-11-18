import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { analyzeMultimodal } from '../services/api'
import type { MultimodalAnalysisResponse } from '../types'

export function useMultimodalAnalysis() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string | null>(null)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioName, setAudioName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MultimodalAnalysisResponse | null>(null)

  async function pickImage() {
    setError(null)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('Необхідно надати дозвіл на доступ до галереї')
      return
    }

    const pick = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8
    })

    if (!pick.canceled && pick.assets && pick.assets.length > 0) {
      const asset = pick.assets[0]
      setImageUri(asset.uri)
      setImageName(asset.fileName || 'photo.jpg')
      setResult(null)
    }
  }

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
    if (!imageUri || !audioUri) {
      setError('Необхідно обрати обидва файли: фотографію та аудіозапис')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeMultimodal(
        imageUri,
        imageName || 'photo.jpg',
        audioUri,
        audioName || 'sound.wav'
      )
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка виконання мультимодального аналізу')
      }
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setImageUri(null)
    setImageName(null)
    setAudioUri(null)
    setAudioName(null)
    setResult(null)
    setError(null)
  }

  return {
    imageUri,
    imageName,
    audioUri,
    audioName,
    loading,
    error,
    result,
    pickImage,
    pickAudio,
    analyze,
    reset
  }
}
