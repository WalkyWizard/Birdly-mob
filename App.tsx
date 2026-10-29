import React, { useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Header } from './src/components/Header'
import { TabBar } from './src/components/TabBar'
import { ImageAnalysisView } from './src/components/ImageAnalysisView'
import { AudioAnalysisView } from './src/components/AudioAnalysisView'
import { MultimodalView } from './src/components/MultimodalView'
import { CompareView } from './src/components/CompareView'
import { HistoryView } from './src/components/HistoryView'

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('image')

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {activeTab === 'image' && <ImageAnalysisView />}
        {activeTab === 'audio' && <AudioAnalysisView />}
        {activeTab === 'multimodal' && <MultimodalView />}
        {activeTab === 'compare' && <CompareView />}
        {activeTab === 'history' && <HistoryView />}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#cf222e'
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f6f8fa'
  },
  content: {
    padding: 16,
    paddingBottom: 40
  }
})