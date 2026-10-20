import React, { useState } from 'react'
import { View, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

export function AuthInput({
  icon,
  placeholder,
  secure,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize = 'none',
}: any) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.authInputWrapper}>
      <Ionicons name={icon} size={20} color={COLORS.BLUE} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.TEXT_MUTED}
        secureTextEntry={secure && !showPassword}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.authTextInput}
      />
      {secure && (
        <Pressable onPress={() => setShowPassword((v) => !v)}>
          <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.TEXT_MUTED} />
        </Pressable>
      )}
    </View>
  )
}
