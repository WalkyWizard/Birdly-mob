import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, FlatList } from 'react-native'
import { getBirdsMetadata, compareBirds } from '../services/api'
import type { BirdsMetadata, CompareResponse, SpeciesOption } from '../types'

export function CompareView() {
  const [speciesList, setSpeciesList] = useState<SpeciesOption[]>([])
  const [bird1, setBird1] = useState<string>('')
  const [bird2, setBird2] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [metaLoading, setMetaLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompareResponse | null>(null)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [selectingTarget, setSelectingTarget] = useState<'bird1' | 'bird2'>('bird1')

  useEffect(() => {
    async function init() {
      try {
        const data: BirdsMetadata = await getBirdsMetadata()
        const list = data.species || []
        setSpeciesList(list)
        if (list.length >= 2) {
          setBird1(list[0].key)
          setBird2(list[1].key)
        }
      } catch {
        setError('Помилка завантаження списку видів')
      } finally {
        setMetaLoading(false)
      }
    }
    init()
  }, [])

  async function handleCompare() {
    if (!bird1 || !bird2) {
      setError('Оберіть двох птахів для порівняння')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await compareBirds(bird1, bird2)
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Помилка порівняння видів')
      }
    } finally {
      setLoading(false)
    }
  }

  function openSelect(target: 'bird1' | 'bird2') {
    setSelectingTarget(target)
    setModalVisible(true)
  }

  function handleSelectSpecies(key: string) {
    if (selectingTarget === 'bird1') {
      setBird1(key)
    } else {
      setBird2(key)
    }
    setModalVisible(false)
  }

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
              onPress={handleCompare}
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
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.closeBtn}>Закрити</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={speciesList}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectSpecies(item.key)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.itemUkr}>{item.ukr_name}</Text>
                  <Text style={styles.itemSci}>{item.scientific_name}</Text>
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
    padding: 14,
    gap: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24292f',
    flex: 1
  },
  infoText: {
    fontSize: 13,
    color: '#57606a'
  },
  selectorGroup: {
    gap: 10
  },
  selectorItem: {
    gap: 4
  },
  label: {
    fontSize: 13,
    color: '#57606a',
    fontWeight: '500'
  },
  selectorBtn: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  selectorBtnText: {
    color: '#24292f',
    fontSize: 13
  },
  btnPrimary: {
    backgroundColor: '#0969da',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  btnDisabled: {
    opacity: 0.5
  },
  errorText: {
    color: '#cf222e',
    fontSize: 13,
    backgroundColor: '#ffebe9',
    padding: 8,
    borderRadius: 4
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  badgeSuccess: {
    backgroundColor: '#dafbe1'
  },
  badgeWarning: {
    backgroundColor: '#fff8c5'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#24292f'
  },
  table: {
    gap: 8
  },
  tableRow: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f6f8fa',
    gap: 4
  },
  rowMatch: {
    backgroundColor: '#dafbe1'
  },
  paramLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#57606a'
  },
  paramValues: {
    flexDirection: 'row',
    gap: 8
  },
  val1: {
    flex: 1,
    fontSize: 13,
    color: '#24292f'
  },
  val2: {
    flex: 1,
    fontSize: 13,
    color: '#24292f'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '75%',
    padding: 16
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de',
    marginBottom: 8
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#24292f'
  },
  closeBtn: {
    fontSize: 14,
    color: '#0969da',
    fontWeight: '600'
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f6f8fa'
  },
  itemUkr: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f'
  },
  itemSci: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#57606a'
  }
})