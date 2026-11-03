import React from 'react'
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native'
import { Image as ExpoImage, type ImageContentFit } from 'expo-image'

/**
 * Imagen con caché en memoria y en disco (expo-image). Con el Image de React Native cada pantalla que se vuelve a abrir
 * descargaba y decodificaba otra vez la foto (en Expo Go las fotos llegan por la red desde Metro), y se veía cómo se
 * "volvían a cargar". Con esta, una foto ya vista aparece al instante; la primera vez entra con un fundido corto.
 * Acepta las mismas props que se usaban (source, style, resizeMode).
 */
export function Image({
  source,
  style,
  resizeMode,
  ...rest
}: {
  source: any
  style?: StyleProp<ImageStyle>
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
} & Record<string, any>) {
  const flat = (StyleSheet.flatten(style) ?? {}) as ImageStyle
  const mode = resizeMode ?? (flat.resizeMode as string | undefined) ?? 'cover'
  const contentFit: ImageContentFit = mode === 'stretch' ? 'fill' : mode === 'center' ? 'none' : (mode as ImageContentFit)
  return <ExpoImage source={source} style={style} contentFit={contentFit} cachePolicy="memory-disk" transition={150} {...rest} />
}
