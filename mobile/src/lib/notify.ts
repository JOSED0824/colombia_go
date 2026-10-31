import { Alert, Platform } from 'react-native'

/** Alerta que funciona en iOS/Android y también en web (donde Alert.alert de React Native no hace nada). */
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title)
    return
  }
  Alert.alert(title, message)
}
