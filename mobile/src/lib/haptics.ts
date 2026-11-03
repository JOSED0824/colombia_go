import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'

// Vibraciones cortas al estilo iOS. En web no existen: ahí no hacen nada.
const enabled = Platform.OS === 'ios' || Platform.OS === 'android'

/** Toque leve al cambiar de pestaña o elegir una opción. */
export function tapFeedback() {
  if (enabled) Haptics.selectionAsync().catch(() => {})
}

/** Vibración de "logrado" para cuando se desbloquea una insignia. */
export function successFeedback() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}
