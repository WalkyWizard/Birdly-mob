import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { analyzeImage } from '../services/api'
import type { ImageAnalysisResponse } from '../types'

export function useImageAnalysis() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null)

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
      setImageName(asset.fileName || 'bird_photo.jpg')
      setResult(null)
    }
  }

  async function takePhoto() {
    setError(null)
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      setError('Необхідно надати дозвіл на доступ до камери')
      return
    }

    const shot = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8
    })

    if (!shot.canceled && shot.assets && shot.assets.length > 0) {
      const asset = shot.assets[0]
      setImageUri(asset.uri)
      setImageName(asset.fileName || 'camera_photo.jpg')
      setResult(null)
    }
  }

  async function analyze() {
    if (!imageUri) {
      setError('Будь ласка, оберіть фотографію')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeImage(imageUri, imageName || 'photo.jpg')
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка під час аналізу фотографії')
      }
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setImageUri(null)
    setImageName(null)
    setResult(null)
    setError(null)
  }

  return {
    imageUri,
    imageName,
    loading,
    error,
    result,
    pickImage,
    takePhoto,
    analyze,
    reset
  }
}
