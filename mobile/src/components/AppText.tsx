import React from 'react'
import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from 'react-native'

// En iPhone/Android el usuario puede agrandar la letra del sistema (Tamaño de texto / Texto más grande). Sin límite,
// los textos de las tarjetas, la barra inferior y los botones se salen de su espacio. Se permite crecer hasta 1.2x:
// se respeta la accesibilidad pero el diseño sigue cuadrando.
export const MAX_FONT_SCALE = 1.2

export function Text(props: TextProps) {
  return <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />
}

// Avisa a KeyboardScroll cuando algún campo recibe el foco, para que lo suba por encima del teclado
// (también al pasar de un campo a otro con el teclado ya abierto, caso en el que el teclado no emite eventos).
const focusListeners = new Set<() => void>()
export function onAnyInputFocus(listener: () => void) {
  focusListeners.add(listener)
  return () => {
    focusListeners.delete(listener)
  }
}

export const TextInput = React.forwardRef<React.ComponentRef<typeof RNTextInput>, TextInputProps>(({ onFocus, ...props }, ref) => (
  <RNTextInput
    ref={ref}
    maxFontSizeMultiplier={MAX_FONT_SCALE}
    onFocus={(e) => {
      onFocus?.(e)
      focusListeners.forEach((l) => l())
    }}
    {...props}
  />
))
TextInput.displayName = 'TextInput'
