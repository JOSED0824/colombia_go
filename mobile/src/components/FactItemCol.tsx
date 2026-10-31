import React from 'react'
import { View } from 'react-native'
import { Text } from './AppText'
import { Ionicons } from '@expo/vector-icons'
import { styles } from '../theme/styles'

export function FactItemCol({ icon, label, value, color }: any) {
  return (
    <View style={styles.factItemCol}>
      <View style={[styles.factIconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ marginLeft: 8 }}>
        <Text style={styles.factLabelCol}>{label}</Text>
        <Text style={styles.factValueCol}>{value}</Text>
      </View>
    </View>
  )
}
