import React, { useCallback, useEffect, useRef } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TextInput as RNTextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from 'react-native'
import { onAnyInputFocus } from './AppText'

/**
 * ScrollView que nunca deja el campo que se está escribiendo debajo del teclado.
 *  1. KeyboardAvoidingView (padding) encoge el área visible hasta el borde superior del teclado.
 *  2. Al abrirse el teclado o al pasar a otro campo, se desplaza el contenido para que el campo enfocado quede a la vista.
 * `automaticallyAdjustKeyboardInsets` solo funciona en iOS y falla dentro de contenedores anidados, por eso no se usa.
 */
export function KeyboardScroll({ children, onScroll, style, ...props }: ScrollViewProps) {
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null)
  const scrollY = useRef(0)

  const reveal = useCallback(() => {
    const input = RNTextInput.State.currentlyFocusedInput()
    const scroll = ref.current
    if (!input || !scroll) return
    input.measureInWindow((_x, y, _w, h) => {
      scroll.measureInWindow((_sx, sy, _sw, sh) => {
        const margin = 24
        const hidden = y + h + margin - (sy + sh) // cuánto del campo (más margen) queda bajo el borde visible
        if (hidden > 0) {
          scroll.scrollTo({ y: scrollY.current + hidden, animated: true })
        } else if (y - margin < sy) {
          scroll.scrollTo({ y: Math.max(0, scrollY.current - (sy - (y - margin))), animated: true })
        }
      })
    })
  }, [])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (ms: number) => timers.push(setTimeout(reveal, ms))
    const subKeyboard = Keyboard.addListener('keyboardDidShow', () => later(50))
    // El área visible se encoge un instante después de abrirse el teclado: se reintenta cuando ya terminó.
    const unsubFocus = onAnyInputFocus(() => {
      later(50)
      later(350)
    })
    return () => {
      subKeyboard.remove()
      unsubFocus()
      timers.forEach(clearTimeout)
    }
  }, [reveal])

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollY.current = e.nativeEvent.contentOffset.y
    onScroll?.(e)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        ref={ref}
        style={style}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
