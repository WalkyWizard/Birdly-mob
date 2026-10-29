import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'

interface TabBarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function TabBar({ activeTab, setActiveTab }: TabBarProps) {
  const tabs = [
    { id: 'image', label: 'Фотоаналіз' },
    { id: 'audio', label: 'Аудіоаналіз' },
    { id: 'multimodal', label: 'Мультимодальний аналіз' },
    { id: 'compare', label: 'Порівняння видів' },
    { id: 'history', label: 'Історія' }
  ]

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#cf222e',
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  scroll: {
    flexDirection: 'row',
    gap: 6
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: 'transparent'
  },
  activeTab: {
    backgroundColor: '#ffffff'
  },
  tabText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9
  },
  activeTabText: {
    color: '#cf222e',
    fontWeight: '600'
  }
})