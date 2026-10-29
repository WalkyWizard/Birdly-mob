import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Birdly</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#24292f',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5
  }
})