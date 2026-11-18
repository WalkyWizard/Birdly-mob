import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useAudioAnalysis } from '../hooks'
import { BirdInfoCard } from './BirdInfoCard'

export function AudioAnalysisView() {
  const {
    audioUri,
    audioName,
    loading,
    error,
    result,
    pickAudio,
    analyze,
    reset
  } = useAudioAnalysis()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Аудіоаналіз</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.btnSecondary} onPress={pickAudio} activeOpacity={0.7}>
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
            onPress={analyze}
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
            <TouchableOpacity style={styles.btnSecondary} onPress={reset} activeOpacity={0.7}>
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
    padding: 16,
    gap: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24292f'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8
  },
  btnPrimary: {
    backgroundColor: '#1f883d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14
  },
  btnSecondary: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnSecondaryText: {
    color: '#24292f',
    fontWeight: '500',
    fontSize: 14
  },
  btnDisabled: {
    opacity: 0.5
  },
  audioInfo: {
    gap: 4
  },
  label: {
    fontSize: 13,
    color: '#57606a'
  },
  fileName: {
    fontSize: 13,
    color: '#24292f',
    fontWeight: '500'
  },
  errorText: {
    color: '#cf222e',
    fontSize: 13
  },
  resultSection: {
    gap: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  speciesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0969da'
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a7f37'
  },
  statusBox: {
    padding: 10,
    borderRadius: 6,
    gap: 4
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
    borderWidth: 1,
    borderColor: '#4ac26b',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start'
  },
  savedText: {
    fontSize: 12,
    color: '#1a7f37',
    fontWeight: '500'
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5'
  },
  variantIdx: {
    width: 24,
    fontSize: 12,
    color: '#57606a',
    fontWeight: '600'
  },
  variantSpecies: {
    flex: 1,
    fontSize: 13,
    color: '#24292f'
  },
  variantConf: {
    fontSize: 12,
    color: '#1a7f37',
    fontWeight: '600'
  }
})
