import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { styles } from '../theme/styles'

export function AchievementCard({ icon, title, desc, color, iconCol }: any) {
  return (
    <View style={[styles.achieveCard, { backgroundColor: color }]}>
      <View style={styles.hexagon}>
         <Ionicons name={icon} size={32} color={iconCol} />
      </View>
      <Text style={styles.achieveTitle}>{title}</Text>
      <Text style={styles.achieveDesc}>{desc}</Text>
    </View>
  )
}
