import React from 'react'
import { View, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

export function AuthInput({ icon, placeholder, secure, value, onChangeText, keyboardType, autoCapitalize = 'none' }: any) {
  return (
    <View style={styles.authInputWrapper}>
      <Ionicons name={icon} size={20} color={COLORS.BLUE} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.TEXT_MUTED}
        secureTextEntry={secure}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.authTextInput}
      />
    </View>
  )
}
