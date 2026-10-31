import React, { useRef } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text, TextInput } from './AppText'
import { COLORS } from '../theme/colors'
import { themed } from '../theme/themed'

type Props = {
  value: string
  onChange: (value: string) => void
  length?: number
  autoFocus?: boolean
  onComplete?: (value: string) => void
}

/**
 * Código de N dígitos en casillas. Debajo hay un único TextInput real (así funcionan el teclado
 * numérico, pegar el código y el autocompletado de SMS/correo del sistema); las casillas solo lo muestran.
 */
export function CodeInput({ value, onChange, length = 6, autoFocus, onComplete }: Props) {
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null)

  function handleChange(text: string) {
    const digits = text.replace(/[^0-9]/g, '').slice(0, length)
    onChange(digits)
    if (digits.length === length) onComplete?.(digits)
  }

  return (
    <Pressable style={s.wrapper} onPress={() => inputRef.current?.focus()}>
      <View style={s.row} pointerEvents="none">
        {Array.from({ length }).map((_, i) => {
          const char = value[i] ?? ''
          const active = i === Math.min(value.length, length - 1)
          return (
            <View key={i} style={[s.box, active && s.boxActive, !!char && s.boxFilled]}>
              <Text style={s.char}>{char}</Text>
            </View>
          )
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        style={s.hiddenInput}
        accessibilityLabel={`${length}-digit code`}
      />
    </Pressable>
  )
}

const s = themed(() => StyleSheet.create({
  wrapper: { width: '100%', marginVertical: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    backgroundColor: COLORS.CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: COLORS.BLUE },
  boxFilled: { backgroundColor: COLORS.SURFACE2 },
  char: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: COLORS.BLUE },
  // Cubre las casillas y es casi invisible: recibe los toques y el foco.
  hiddenInput: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.01, fontSize: 24 },
}))
