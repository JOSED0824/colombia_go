import React, { useState } from 'react'
import { View, TextInput, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'

export function AuthInput({ icon, placeholder, secure, value, onChangeText, ...rest }: any) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.authInputWrapper}>
      <Ionicons name={icon} size={20} color={COLORS.BLUE} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.TEXT_MUTED}
        secureTextEntry={secure && !showPassword}
        style={styles.authTextInput}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        {...rest}
      />
      {secure && (
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={COLORS.TEXT_MUTED}
          />
        </Pressable>
      )}
    </View>
  )
}
