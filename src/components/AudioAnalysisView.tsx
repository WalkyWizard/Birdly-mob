import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { analyzeAudio } from '../services/api'
import type { AudioAnalysisResponse } from '../types'
import { BirdInfoCard } from './BirdInfoCard'

export function AudioAnalysisView() {
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioName, setAudioName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AudioAnalysisResponse | null>(null)

  async function handlePickAudio() {
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

  async function handleAnalyze() {
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

  function handleReset() {
    setAudioUri(null)
    setAudioName(null)
    setResult(null)
    setError(null)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Аудіоаналіз</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.btnSecondary} onPress={handlePickAudio} activeOpacity={0.7}>
          <Text style={styles.btnSecondaryText}>Обрати аудіофайл</Text>
        </TouchableOpacity>

        {audioUri ? (
          <View style={styles.audioInfo}>
            <Text style={styles.label}>Обраний файл:</Text>
            <Text style={styles.fileName}>{audioName}</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, (!audioUri || loading) && styles.btnDisabled]}
            onPress={handleAnalyze}
            disabled={!audioUri || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.btnPrimaryText}>Класифікувати звук</Text>
            )}
          </TouchableOpacity>

          {audioUri ? (
            <TouchableOpacity style={styles.btnSecondary} onPress={handleReset} activeOpacity={0.7}>
              <Text style={styles.btnSecondaryText}>Очистити</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {result ? (
        <View style={styles.resultSection}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Результат акустичного аналізу</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Визначений вид:</Text>
              <Text style={styles.speciesText}>{result.predicted_species}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Рівень упевненості:</Text>
              <Text style={styles.confidenceText}>{(result.confidence * 100).toFixed(2)}%</Text>
            </View>

            <View style={[styles.statusBox, result.is_reliable ? styles.statusSuccess : styles.statusWarning]}>
              <Text style={styles.statusLabel}>Статус достовірності:</Text>
              <Text style={styles.statusText}>{result.status_description}</Text>
            </View>

            {result.record_id ? (
              <View style={styles.savedBadge}>
                <Text style={styles.savedText}>Збережено в базі даних (ID: {result.record_id})</Text>
              </View>
            ) : null}
          </View>

          {result.variants && result.variants.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ймовірні класи звуків</Text>
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
  audioInfo: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 10,
    gap: 2
  },
  fileName: {
    fontSize: 14,
    color: '#24292f',
    fontWeight: '500'
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
    fontSize: 13,
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
  statusBox: {
    padding: 10,
    borderRadius: 6,
    gap: 2
  },
  statusSuccess: {
    backgroundColor: '#dafbe1',
    borderWidth: 1,
    borderColor: '#4ac26b'
  },
  statusWarning: {
    backgroundColor: '#fff8c5',
    borderWidth: 1,
    borderColor: '#d4a72c'
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#24292f'
  },
  statusText: {
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