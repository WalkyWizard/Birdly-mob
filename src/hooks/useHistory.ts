import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { getHistory, deleteHistoryRecord, getBirdsMetadata } from '../services/api'
import type { HistoryRecord, BirdsMetadata } from '../types'

export function useHistory() {
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

  function search() {
    loadHistory(searchTerm, selectedFamily)
  }

  async function deleteRecord(id: number) {
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

  return {
    records,
    loading,
    error,
    searchTerm,
    selectedFamily,
    families,
    setSearchTerm,
    setSelectedFamily,
    loadHistory,
    search,
    deleteRecord
  }
}
