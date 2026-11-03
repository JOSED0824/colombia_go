import * as ImagePicker from 'expo-image-picker'
import { supabase } from './supabase'

/**
 * Abre la galería, sube la foto elegida al bucket público "fotos" de Supabase (carpeta del usuario: solo él puede
 * escribir ahí) y devuelve su URL pública. null si la persona canceló. Lanza error si la subida falla.
 */
export async function pickAndUploadPhoto(aspect: [number, number] = [4, 3]): Promise<string | null> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.7,
  })
  if (picked.canceled) return null

  const asset = picked.assets[0]
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('sin sesión')

  const contentType = asset.mimeType ?? 'image/jpeg'
  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const body = await (await fetch(asset.uri)).arrayBuffer()

  const { error } = await supabase.storage.from('fotos').upload(path, body, { contentType, upsert: false })
  if (error) throw error

  return supabase.storage.from('fotos').getPublicUrl(path).data.publicUrl
}
