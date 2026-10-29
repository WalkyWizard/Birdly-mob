import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { analyzeMultimodal } from '../services/api'
import type { MultimodalAnalysisResponse } from '../types'
import { BirdInfoCard } from './BirdInfoCard'

export function MultimodalView() {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string | null>(null)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioName, setAudioName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MultimodalAnalysisResponse | null>(null)

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
      setImageName(asset.fileName || 'photo.jpg')
      setResult(null)
    }
  }

  async function handlePickAudio() {
    setError(null)
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [['audio', '*'].join('/')],
        copyToCacheDirectory: true
      })

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0]
        setAudioUri(asset.uri)
        setAudioName(asset.name || 'sound.wav')
        setResult(null)
      }
    } catch {
      setError('Помилка вибору аудіофайлу')
    }
  }

  async function handleAnalyze() {
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

  function handleReset() {
    setImageUri(null)
    setImageName(null)
    setAudioUri(null)
    setAudioName(null)
    setResult(null)
    setError(null)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мультимодальний аналіз</Text>

      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.label}>1. Фотографія птаха (JPG, PNG):</Text>
          <TouchableOpacity style={styles.btnSecondary} onPress={handlePickImage} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>{imageUri ? 'Змінити фото' : 'Обрати фотографію'}</Text>
          </TouchableOpacity>
          {imageUri ? (
            <View style={styles.previewBox}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
              <Text style={styles.fileName}>{imageName}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>2. Аудіозапис співу (WAV, FLAC, OGG):</Text>
          <TouchableOpacity style={styles.btnSecondary} onPress={handlePickAudio} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>{audioUri ? 'Змінити аудіо' : 'Обрати аудіофайл'}</Text>
          </TouchableOpacity>
          {audioUri ? (
            <View style={styles.audioBox}>
              <Text style={styles.fileName}>{audioName}</Text>
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, (!imageUri || !audioUri || loading) && styles.btnDisabled]}
            onPress={handleAnalyze}
            disabled={!imageUri || !audioUri || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Виконати аналіз</Text>
            )}
          </TouchableOpacity>

          {imageUri || audioUri ? (
            <TouchableOpacity style={styles.btnSecondary} onPress={handleReset} activeOpacity={0.7}>
              <Text style={styles.btnSecondaryText}>Очистити</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {result ? (
        <View style={styles.resultSection}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Вердикт зіставлення двох моделей</Text>
            <View style={[styles.verdictBox, result.is_match ? styles.verdictSuccess : styles.verdictWarning]}>
              <Text style={styles.verdictText}>{result.verdict}</Text>
            </View>
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Зауваження щодо достовірності:</Text>
              <Text style={styles.noteText}>{result.reliability_note}</Text>
            </View>
            {result.record_id ? (
              <View style={styles.savedBadge}>
                <Text style={styles.savedText}>Збережено в базі даних (ID: {result.record_id})</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Візуальна модель (Фото)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Вид:</Text>
              <Text style={styles.valText}>{result.image_result.predicted_species}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Упевненість:</Text>
              <Text style={styles.valText}>{(result.image_result.confidence * 100).toFixed(2)}%</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Акустична модель (Спів)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Вид:</Text>
              <Text style={styles.valText}>{result.audio_result.predicted_species}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Упевненість:</Text>
              <Text style={styles.valText}>{(result.audio_result.confidence * 100).toFixed(2)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Статус:</Text>
              <Text style={styles.valText}>{result.audio_result.status_description}</Text>
            </View>
          </View>

          <BirdInfoCard info={result.image_result.bird_info} title="Інформація про вид за фотографією" />
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
  section: {
    gap: 6
  },
  label: {
    fontSize: 13,
    color: '#57606a',
    fontWeight: '500'
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
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingVertical: 9,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  previewBox: {
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 8
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 4
  },
  audioBox: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 8
  },
  fileName: {
    fontSize: 12,
    color: '#57606a'
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
  verdictBox: {
    padding: 10,
    borderRadius: 6
  },
  verdictSuccess: {
    backgroundColor: '#dafbe1',
    borderWidth: 1,
    borderColor: '#4ac26b'
  },
  verdictWarning: {
    backgroundColor: '#fff8c5',
    borderWidth: 1,
    borderColor: '#d4a72c'
  },
  verdictText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f'
  },
  noteBox: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    padding: 10,
    borderRadius: 6,
    gap: 2
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#57606a'
  },
  noteText: {
    fontSize: 13,
    color: '#24292f'
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2
  },
  valText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f'
  }
})