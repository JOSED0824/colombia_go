import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

export function SettingToggle({ icon, label, value, onToggle }: any) {
  return (
    <View style={styles.settingToggleRow}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={20} color={COLORS.BLUE} />
      </View>
      <Text style={styles.settingLabelText}>{label}</Text>
      <Pressable
        onPress={onToggle}
        style={[styles.toggleTrack, value ? styles.toggleTrackActive : styles.toggleTrackInactive]}
      >
        <View style={[styles.toggleKnob, value ? styles.toggleKnobActive : styles.toggleKnobInactive]} />
      </Pressable>
    </View>
  )
}
