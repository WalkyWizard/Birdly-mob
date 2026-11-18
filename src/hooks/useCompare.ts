import { useState, useEffect } from 'react'
import { getBirdsMetadata, compareBirds } from '../services/api'
import type { BirdsMetadata, CompareResponse, SpeciesOption } from '../types'

export function useCompare() {
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

  async function compare() {
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

  function closeSelect() {
    setModalVisible(false)
  }

  function selectSpecies(key: string) {
    if (selectingTarget === 'bird1') {
      setBird1(key)
    } else {
      setBird2(key)
    }
    setModalVisible(false)
  }

  return {
    speciesList,
    bird1,
    bird2,
    loading,
    metaLoading,
    error,
    result,
    modalVisible,
    selectingTarget,
    setBird1,
    setBird2,
    compare,
    openSelect,
    closeSelect,
    selectSpecies
  }
}
