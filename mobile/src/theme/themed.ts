import { StyleSheet } from 'react-native'

// Estilos que se pueden "repintar" al cambiar de tema. `themed(() => StyleSheet.create({...}))` devuelve un
// objeto que las pantallas leen igual que un StyleSheet normal (styles.card), pero que se vuelve a construir
// con la paleta nueva cada vez que se llama rebuildThemedStyles().
const builders = new Set<() => void>()

export function themed<T>(factory: () => T): T {
  const target = {} as T
  const build = () => {
    Object.assign(target as object, factory() as object)
  }
  build()
  builders.add(build)
  return target
}

export function rebuildThemedStyles() {
  builders.forEach((build) => build())
}

// Re-export para que los archivos que ya importan StyleSheet puedan usarlo junto a themed.
export { StyleSheet }
