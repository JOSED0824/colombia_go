import React from 'react'
import { Pressable, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

export function SettingLink({ icon, label, onPress }: any) {
  return (
    <Pressable style={styles.settingToggleRow} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={20} color={COLORS.BLUE} />
      </View>
      <Text style={styles.settingLabelText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_MUTED} />
    </Pressable>
  )
}
