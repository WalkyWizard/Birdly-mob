import React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { useMultimodalAnalysis } from '../hooks'
import { BirdInfoCard } from './BirdInfoCard'

export function MultimodalView() {
  const {
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
  } = useMultimodalAnalysis()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мультимодальний аналіз</Text>

      <View style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.label}>1. Фотографія птаха (JPG, PNG):</Text>
          <TouchableOpacity style={styles.btnSecondary} onPress={pickImage} activeOpacity={0.7}>
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
          <Text style={styles.label}>2. Аудіозапис співу (WAV, MP3, M4A, FLAC, OGG):</Text>
          <TouchableOpacity style={styles.btnSecondary} onPress={pickAudio} activeOpacity={0.7}>
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
            onPress={analyze}
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
            <TouchableOpacity style={styles.btnSecondary} onPress={reset} activeOpacity={0.7}>
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
    padding: 16,
    gap: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24292f'
  },
  section: {
    gap: 6
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
  previewBox: {
    alignItems: 'center',
    gap: 6,
    marginTop: 6
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    backgroundColor: '#eaeef2'
  },
  audioBox: {
    padding: 10,
    backgroundColor: '#f6f8fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d0d7de',
    marginTop: 6
  },
  fileName: {
    fontSize: 12,
    color: '#57606a'
  },
  errorText: {
    color: '#cf222e',
    fontSize: 13
  },
  resultSection: {
    gap: 12
  },
  verdictBox: {
    padding: 12,
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
    gap: 4
  },
  noteLabel: {
    fontSize: 12,
    color: '#57606a',
    fontWeight: '500'
  },
  noteText: {
    fontSize: 13,
    color: '#24292f'
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
  valText: {
    fontSize: 14,
    fontWeight: '600',
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
  }
})
