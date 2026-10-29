import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { BirdInfo } from '../types'

interface BirdInfoCardProps {
  info?: BirdInfo
  title?: string
}

export function BirdInfoCard({ info, title = 'Інформаційна довідка про птаха' }: BirdInfoCardProps) {
  if (!info) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.emptyText}>Інформація відсутня або не завантажена</Text>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>Українська назва:</Text>
          <Text style={[styles.value, styles.highlight]}>{info.ukr_name || 'Невідомо'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Наукова назва:</Text>
          <Text style={[styles.value, styles.italic]}>{info.scientific_name || 'Невідомо'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Родина:</Text>
          <Text style={styles.value}>{info.family || 'Дані відсутні'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Середовище існування:</Text>
          <Text style={styles.value}>{info.habitat || 'Дані відсутні'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Географічне поширення:</Text>
          <Text style={styles.value}>{info.region || 'Дані відсутні'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Тип живлення:</Text>
          <Text style={styles.value}>{info.diet || 'Дані відсутні'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Середні розміри:</Text>
          <Text style={styles.value}>{info.size || 'Дані відсутні'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Природоохоронний статус:</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{info.conservation_status || 'Дані відсутні'}</Text>
          </View>
        </View>
      </View>
      {info.interesting_facts ? (
        <View style={styles.facts}>
          <Text style={styles.label}>Цікаві факти:</Text>
          <Text style={styles.factsText}>{info.interesting_facts}</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 14,
    gap: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292f'
  },
  emptyText: {
    fontSize: 13,
    color: '#57606a'
  },
  grid: {
    gap: 8
  },
  item: {
    flexDirection: 'column',
    gap: 2
  },
  label: {
    fontSize: 12,
    color: '#57606a',
    fontWeight: '500'
  },
  value: {
    fontSize: 14,
    color: '#24292f'
  },
  highlight: {
    color: '#0969da',
    fontWeight: '600'
  },
  italic: {
    fontStyle: 'italic',
    color: '#57606a'
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dafbe1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2
  },
  badgeText: {
    fontSize: 12,
    color: '#1a7f37',
    fontWeight: '500'
  },
  facts: {
    marginTop: 4,
    gap: 2
  },
  factsText: {
    fontSize: 13,
    color: '#57606a',
    lineHeight: 18
  }
})