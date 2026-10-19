import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { styles } from '../theme/styles'

// `emoji` (los logros de la API traen un emoji como ícono) tiene prioridad sobre `icon` (Ionicons).
export function AchievementCard({ icon, emoji, title, desc, color, iconCol, locked }: any) {
  return (
    <View style={[styles.achieveCard, { backgroundColor: color }, locked && { opacity: 0.45 }]}>
      <View style={styles.hexagon}>
         {emoji
           ? <Text style={{ fontSize: 30 }}>{emoji}</Text>
           : <Ionicons name={icon} size={32} color={iconCol} />}
      </View>
      <Text style={styles.achieveTitle}>{title}</Text>
      <Text style={styles.achieveDesc}>{desc}</Text>
    </View>
  )
}
