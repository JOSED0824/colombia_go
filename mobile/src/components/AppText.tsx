import React from 'react'
import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from 'react-native'

// En iPhone/Android el usuario puede agrandar la letra del sistema (Tamaño de texto / Texto más grande). Sin límite,
// los textos de las tarjetas, la barra inferior y los botones se salen de su espacio. Se permite crecer hasta 1.2x:
// se respeta la accesibilidad pero el diseño sigue cuadrando.
export const MAX_FONT_SCALE = 1.2

export function Text(props: TextProps) {
  return <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />
}

export const TextInput = React.forwardRef<React.ComponentRef<typeof RNTextInput>, TextInputProps>((props, ref) => (
  <RNTextInput ref={ref} maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />
))
TextInput.displayName = 'TextInput'
