import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, FlatList } from 'react-native'
import { useCompare } from '../hooks'

export function CompareView() {
  const {
    speciesList,
    bird1,
    bird2,
    loading,
    metaLoading,
    error,
    result,
    modalVisible,
    compare,
    openSelect,
    closeSelect,
    selectSpecies
  } = useCompare()

  const bird1Obj = speciesList.find((s) => s.key === bird1)
  const bird2Obj = speciesList.find((s) => s.key === bird2)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Порівняння видів</Text>

      <View style={styles.card}>
        {metaLoading ? (
          <Text style={styles.infoText}>Завантаження переліку видів</Text>
        ) : (
          <View style={styles.selectorGroup}>
            <View style={styles.selectorItem}>
              <Text style={styles.label}>Перший птах:</Text>
              <TouchableOpacity style={styles.selectorBtn} onPress={() => openSelect('bird1')} activeOpacity={0.7}>
                <Text style={styles.selectorBtnText} numberOfLines={1}>
                  {bird1Obj ? `${bird1Obj.ukr_name} (${bird1Obj.scientific_name})` : 'Обрати вид'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.selectorItem}>
              <Text style={styles.label}>Другий птах:</Text>
              <TouchableOpacity style={styles.selectorBtn} onPress={() => openSelect('bird2')} activeOpacity={0.7}>
                <Text style={styles.selectorBtnText} numberOfLines={1}>
                  {bird2Obj ? `${bird2Obj.ukr_name} (${bird2Obj.scientific_name})` : 'Обрати вид'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, (loading || !bird1 || !bird2) && styles.btnDisabled]}
              onPress={compare}
              disabled={loading || !bird1 || !bird2}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>Порівняти</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {result ? (
        <View style={styles.card}>
          <View style={styles.resultHeader}>
            <Text style={styles.cardTitle}>{result.bird1_name} та {result.bird2_name}</Text>
            <View style={[styles.badge, result.same_family ? styles.badgeSuccess : styles.badgeWarning]}>
              <Text style={styles.badgeText}>{result.same_family ? 'Одна родина' : 'Різні родини'}</Text>
            </View>
          </View>

          <View style={styles.table}>
            {result.comparison_rows.map((row, idx) => (
              <View key={idx} style={[styles.tableRow, row.is_identical && styles.rowMatch]}>
                <Text style={styles.paramLabel}>{row.parameter}</Text>
                <View style={styles.paramValues}>
                  <Text style={styles.val1} numberOfLines={3}>{row.bird1_value}</Text>
                  <Text style={styles.val2} numberOfLines={3}>{row.bird2_value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Оберіть вид птаха</Text>
              <TouchableOpacity onPress={closeSelect} activeOpacity={0.7}>
                <Text style={styles.closeBtn}>Закрити</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={speciesList}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectSpecies(item.key)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.itemTitle}>{item.ukr_name}</Text>
                  <Text style={styles.itemSub}>{item.scientific_name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  infoText: {
    fontSize: 14,
    color: '#57606a',
    textAlign: 'center',
    paddingVertical: 12
  },
  selectorGroup: {
    gap: 10
  },
  selectorItem: {
    gap: 4
  },
  label: {
    fontSize: 13,
    color: '#57606a'
  },
  selectorBtn: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    backgroundColor: '#f6f8fa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  selectorBtnText: {
    fontSize: 14,
    color: '#24292f'
  },
  btnPrimary: {
    backgroundColor: '#1f883d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14
  },
  btnDisabled: {
    opacity: 0.5
  },
  errorText: {
    color: '#cf222e',
    fontSize: 13
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24292f',
    flex: 1
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  badgeSuccess: {
    backgroundColor: '#dafbe1',
    borderWidth: 1,
    borderColor: '#4ac26b'
  },
  badgeWarning: {
    backgroundColor: '#fff8c5',
    borderWidth: 1,
    borderColor: '#d4a72c'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#24292f'
  },
  table: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    overflow: 'hidden'
  },
  tableRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
    gap: 4
  },
  rowMatch: {
    backgroundColor: '#f6f8fa'
  },
  paramLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#57606a'
  },
  paramValues: {
    flexDirection: 'row',
    gap: 8
  },
  val1: {
    flex: 1,
    fontSize: 13,
    color: '#0969da'
  },
  val2: {
    flex: 1,
    fontSize: 13,
    color: '#1a7f37'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    padding: 16
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292f'
  },
  closeBtn: {
    fontSize: 14,
    color: '#0969da',
    fontWeight: '600'
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5'
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#24292f'
  },
  itemSub: {
    fontSize: 12,
    color: '#57606a',
    marginTop: 2
  }
})
