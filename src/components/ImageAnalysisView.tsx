import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { analyzeImage } from '../services/api'
import type { ImageAnalysisResponse } from '../types'
import { BirdInfoCard } from './BirdInfoCard'

export function ImageAnalysisView() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImageAnalysisResponse | null>(null)

  async function handlePickImage() {
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

  async function handleTakePhoto() {
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

  async function handleAnalyze() {
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

  function handleReset() {
    setImageUri(null)
    setImageName(null)
    setResult(null)
    setError(null)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Фотоаналіз</Text>

      <View style={styles.card}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handlePickImage} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>Галерея</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleTakePhoto} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>Камера</Text>
          </TouchableOpacity>
        </View>

        {imageUri ? (
          <View style={styles.previewBox}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            <Text style={styles.fileName}>{imageName}</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, (!imageUri || loading) && styles.btnDisabled]}
            onPress={handleAnalyze}
            disabled={!imageUri || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Виконати аналіз</Text>
            )}
          </TouchableOpacity>

          {imageUri ? (
            <TouchableOpacity style={styles.btnSecondary} onPress={handleReset} activeOpacity={0.7}>
              <Text style={styles.btnSecondaryText}>Очистити</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {result ? (
        <View style={styles.resultSection}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Результат розпізнавання</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Визначений вид:</Text>
              <Text style={styles.speciesText}>{result.predicted_species}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Рівень упевненості:</Text>
              <Text style={styles.confidenceText}>{(result.confidence * 100).toFixed(2)}%</Text>
            </View>
            {result.record_id ? (
              <View style={styles.savedBadge}>
                <Text style={styles.savedText}>Збережено в базі даних (ID: {result.record_id})</Text>
              </View>
            ) : null}
          </View>

          {result.variants && result.variants.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Найбільш імовірні варіанти</Text>
              {result.variants.map((v, idx) => (
                <View key={idx} style={styles.variantRow}>
                  <Text style={styles.variantIdx}>{idx + 1}</Text>
                  <Text style={styles.variantSpecies}>{v.species}</Text>
                  <Text style={styles.variantConf}>{(v.confidence * 100).toFixed(2)}%</Text>
                </View>
              ))}
            </View>
          ) : null}

          <BirdInfoCard info={result.bird_info} />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 14
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#24292f'
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 14,
    gap: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292f'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#0969da',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnSecondaryText: {
    color: '#24292f',
    fontSize: 14,
    fontWeight: '500'
  },
  btnDisabled: {
    opacity: 0.5
  },
  previewBox: {
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 10
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 4
  },
  fileName: {
    fontSize: 12,
    color: '#57606a',
    marginTop: 6
  },
  errorText: {
    color: '#cf222e',
    fontSize: 13,
    backgroundColor: '#ffebe9',
    padding: 8,
    borderRadius: 4
  },
  resultSection: {
    gap: 14
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 14,
    color: '#57606a'
  },
  speciesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24292f'
  },
  confidenceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0969da'
  },
  savedBadge: {
    backgroundColor: '#dafbe1',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center'
  },
  savedText: {
    color: '#1a7f37',
    fontSize: 12,
    fontWeight: '500'
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  variantIdx: {
    width: 24,
    fontSize: 13,
    color: '#57606a'
  },
  variantSpecies: {
    flex: 1,
    fontSize: 13,
    color: '#24292f'
  },
  variantConf: {
    fontSize: 13,
    fontWeight: '600',
    color: '#24292f'
  }
})