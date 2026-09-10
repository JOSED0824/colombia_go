import React from 'react'
import { Pressable, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

export function MenuRow({ icon, label, sub, color, iconCol, onPress }: any) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={[styles.menuIconBox, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color={iconCol} />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.menuTitle}>{label}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_MUTED} />
    </Pressable>
  )
}
