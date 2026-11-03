import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, Easing, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'

// Transiciones al estilo iOS con la API Animated de React Native (driver nativo: no bloquean el hilo de JS).
const IOS_EASE = Easing.bezier(0.2, 0.9, 0.25, 1)

/**
 * Contenedor de una pestaña. Al volverse la activa entra con un deslizamiento corto desde el lado de la pestaña de la
 * que se viene (derecha si avanzas en la barra, izquierda si retrocedes) y un fundido; las demás quedan ocultas.
 */
export function TabScene({
  active,
  direction,
  children,
}: {
  active: boolean
  /** 1 = la nueva pestaña está a la derecha de la anterior, -1 = a la izquierda, 0 = sin desplazamiento. */
  direction: number
  children: React.ReactNode
}) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current
  const wasActive = useRef(active)

  useEffect(() => {
    if (active && !wasActive.current) {
      progress.setValue(0)
      Animated.timing(progress, { toValue: 1, duration: 320, easing: IOS_EASE, useNativeDriver: true }).start()
    }
    wasActive.current = active
  }, [active, progress])

  return (
    <Animated.View
      style={{
        flex: 1,
        display: active ? 'flex' : 'none',
        opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
        transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [28 * direction, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  )
}

/**
 * Pantalla que se "empuja" encima (detalle, mapa, configuración…): entra desde la derecha como en iOS.
 * Se remonta con un `key` distinto en cada pantalla, así cada una anima su entrada.
 */
export function PushScene({ children }: { children: React.ReactNode }) {
  const x = useRef(new Animated.Value(1)).current
  useEffect(() => {
    Animated.timing(x, { toValue: 0, duration: 340, easing: IOS_EASE, useNativeDriver: true }).start()
  }, [x])
  const width = Dimensions.get('window').width
  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }],
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 18,
        shadowOffset: { width: -6, height: 0 },
      }}
    >
      {children}
    </Animated.View>
  )
}

/**
 * Al volver de una pantalla empujada, las pestañas reaparecen con el leve movimiento de "regreso" de iOS
 * (vienen un poco desde la izquierda y se aclaran).
 */
export function ReturnScene({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const p = useRef(new Animated.Value(1)).current
  const wasVisible = useRef(visible)
  useEffect(() => {
    if (visible && !wasVisible.current) {
      p.setValue(0)
      Animated.timing(p, { toValue: 1, duration: 320, easing: IOS_EASE, useNativeDriver: true }).start()
    }
    wasVisible.current = visible
  }, [visible, p])
  return (
    <Animated.View
      style={{
        flex: 1,
        display: visible ? 'flex' : 'none',
        opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
        transform: [{ translateX: p.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  )
}

/** Pressable que se hunde un poco al tocarlo (como las tarjetas de iOS). */
export function PressableScale({
  style,
  children,
  scaleTo = 0.96,
  ...props
}: PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number; children?: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current
  const to = (v: number) => Animated.spring(scale, { toValue: v, speed: 40, bounciness: v === 1 ? 6 : 0, useNativeDriver: true }).start()
  return (
    <Pressable {...props} onPressIn={(e) => { to(scaleTo); props.onPressIn?.(e) }} onPressOut={(e) => { to(1); props.onPressOut?.(e) }}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  )
}
