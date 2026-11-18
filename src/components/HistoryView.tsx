import React from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useHistory } from '../hooks'

export function HistoryView() {
  const {
    records,
    loading,
    error,
    searchTerm,
    selectedFamily,
    setSearchTerm,
    loadHistory,
    search,
    deleteRecord
  } = useHistory()

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
            onSubmitEditing={search}
          />
          <TouchableOpacity style={styles.btnSecondary} onPress={search} activeOpacity={0.7}>
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
                  onPress={() => deleteRecord(r.id)}
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
    padding: 16,
    gap: 12
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
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
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnSecondaryText: {
    color: '#24292f',
    fontWeight: '500',
    fontSize: 13
  },
  errorText: {
    color: '#cf222e',
    fontSize: 13
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 10
  },
  loadingText: {
    color: '#57606a',
    fontSize: 13
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 30,
    alignItems: 'center'
  },
  emptyText: {
    color: '#57606a',
    fontSize: 14
  },
  list: {
    gap: 10
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 14,
    gap: 10
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
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
    gap: 4
  },
  recordSpecies: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0969da'
  },
  recordSci: {
    fontSize: 12,
    color: '#57606a',
    fontStyle: 'italic'
  },
  recordFile: {
    fontSize: 12,
    color: '#57606a'
  },
  recordConf: {
    fontSize: 12,
    color: '#1a7f37',
    fontWeight: '600'
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
    paddingTop: 8
  },
  btnDanger: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#ffebe9',
    borderWidth: 1,
    borderColor: '#ff8182'
  },
  btnDangerText: {
    color: '#cf222e',
    fontSize: 12,
    fontWeight: '500'
  }
})
