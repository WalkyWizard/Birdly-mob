import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native'
import { getHistory, deleteHistoryRecord, getBirdsMetadata } from '../services/api'
import type { HistoryRecord, BirdsMetadata } from '../types'

export function HistoryView() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedFamily, setSelectedFamily] = useState<string>('Усі')
  const [families, setFamilies] = useState<string[]>([])

  useEffect(() => {
    loadMetadata()
    loadHistory()
  }, [])

  async function loadMetadata() {
    try {
      const meta: BirdsMetadata = await getBirdsMetadata()
      setFamilies(['Усі', ...(meta.families || [])])
    } catch {
      setFamilies(['Усі'])
    }
  }

  async function loadHistory(searchVal?: string, familyVal?: string) {
    setLoading(true)
    setError(null)
    try {
      const s = searchVal !== undefined ? searchVal : searchTerm
      const f = familyVal !== undefined ? familyVal : selectedFamily
      const data = await getHistory(s, f)
      setRecords(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка завантаження історії')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSearchSubmit() {
    loadHistory(searchTerm, selectedFamily)
  }

  async function handleDelete(id: number) {
    Alert.alert(
      'Підтвердження',
      `Ви дійсно бажаєте видалити запис ID ${id}?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHistoryRecord(id)
              setRecords((prev) => prev.filter((r) => r.id !== id))
            } catch (err: unknown) {
              Alert.alert('Помилка', err instanceof Error ? err.message : 'Помилка видалення')
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Історія</Text>

      <View style={styles.card}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Пошук за назвою або описом"
            placeholderTextColor="#57606a"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearchSubmit}
          />
          <TouchableOpacity style={styles.btnSecondary} onPress={handleSearchSubmit} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>Пошук</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => loadHistory(searchTerm, selectedFamily)}
            activeOpacity={0.7}
          >
            <Text style={styles.btnSecondaryText}>Оновити</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#0969da" size="large" />
          <Text style={styles.loadingText}>Завантаження записів</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Записів не знайдено</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {records.map((r) => (
            <View key={r.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={[styles.typeBadge, r.analysis_type === 'image' ? styles.typeImage : r.analysis_type === 'audio' ? styles.typeAudio : styles.typeMulti]}>
                  <Text style={styles.typeText}>
                    {r.analysis_type === 'image' ? 'Фото' : r.analysis_type === 'audio' ? 'Аудіо' : 'Мульти'}
                  </Text>
                </View>
                <Text style={styles.recordDate}>{r.analysis_date}</Text>
              </View>

              <View style={styles.recordBody}>
                <Text style={styles.recordSpecies}>{r.predicted_species}</Text>
                {r.scientific_name ? (
                  <Text style={styles.recordSci}>{r.scientific_name}</Text>
                ) : null}
                <Text style={styles.recordFile}>Файл: {r.image_name || r.audio_name || 'Не вказано'}</Text>
                <Text style={styles.recordConf}>Упевненість: {(r.confidence * 100).toFixed(1)}%</Text>
              </View>

              <View style={styles.recordFooter}>
                <TouchableOpacity
                  style={styles.btnDanger}
                  onPress={() => handleDelete(r.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnDangerText}>Видалити</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
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
    padding: 12,
    gap: 10
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#24292f'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  btnSecondary: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnSecondaryText: {
    color: '#24292f',
    fontSize: 13,
    fontWeight: '500'
  },
  btnDanger: {
    backgroundColor: '#cf222e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  btnDangerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  errorText: {
    color: '#cf222e',
    fontSize: 13,
    backgroundColor: '#ffebe9',
    padding: 8,
    borderRadius: 4
  },
  loadingBox: {
    alignItems: 'center',
    padding: 30,
    gap: 8
  },
  loadingText: {
    fontSize: 13,
    color: '#57606a'
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 24,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: '#57606a'
  },
  list: {
    gap: 10
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 12,
    gap: 8
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  typeImage: {
    backgroundColor: '#ddf4ff'
  },
  typeAudio: {
    backgroundColor: '#fff8c5'
  },
  typeMulti: {
    backgroundColor: '#fbefff'
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#24292f'
  },
  recordDate: {
    fontSize: 11,
    color: '#57606a'
  },
  recordBody: {
    gap: 2
  },
  recordSpecies: {
    fontSize: 15,
    fontWeight: '700',
    color: '#24292f'
  },
  recordSci: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#57606a'
  },
  recordFile: {
    fontSize: 12,
    color: '#57606a',
    marginTop: 2
  },
  recordConf: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0969da'
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4
  }
})