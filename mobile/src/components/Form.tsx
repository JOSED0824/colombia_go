import React from 'react'
import { View, Pressable, Image, ActivityIndicator, StyleSheet, type KeyboardTypeOptions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, TextInput } from './AppText'
import { COLORS } from '../theme/colors'
import { themed } from '../theme/themed'

// Piezas de formulario compartidas por los paneles de guía, negocio y administración.

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  multiline,
  keyboardType,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  hint?: string
  multiline?: boolean
  keyboardType?: KeyboardTypeOptions
}) {
  return (
    <View style={form.field}>
      <Text style={form.label}>{label}</Text>
      <TextInput
        style={[form.input, multiline && form.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.TEXT_MUTED}
        multiline={multiline}
        keyboardType={keyboardType}
      />
      {!!hint && <Text style={form.hint}>{hint}</Text>}
    </View>
  )
}

export function Chips<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: { value: T; label: string }[]
  selected: T[]
  onToggle: (value: T) => void
}) {
  return (
    <View style={form.field}>
      <Text style={form.label}>{label}</Text>
      <View style={form.chips}>
        {options.map((o) => {
          const on = selected.includes(o.value)
          return (
            <Pressable key={o.value} onPress={() => onToggle(o.value)} style={[form.chip, on && form.chipOn]}>
              <Text style={[form.chipText, on && form.chipTextOn]}>{o.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export type Status = 'pendiente' | 'aprobado' | 'rechazado' | 'archivado' | 'verificado'

const STATUS_COLORS: Record<Status, { bg: string; fg: string; icon: string }> = {
  pendiente: { bg: '#FFF4D6', fg: '#9A6B00', icon: 'time-outline' },
  aprobado: { bg: '#E3F6EC', fg: '#0F8A4B', icon: 'checkmark-circle' },
  verificado: { bg: '#E3F6EC', fg: '#0F8A4B', icon: 'checkmark-circle' },
  rechazado: { bg: '#FDE7E9', fg: '#C62828', icon: 'close-circle' },
  archivado: { bg: '#ECEFF3', fg: '#5B6B7F', icon: 'archive-outline' },
}

export function StatusPill({ status, label }: { status: Status; label: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pendiente
  return (
    <View style={[form.pill, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon as any} size={14} color={c.fg} />
      <Text style={[form.pillText, { color: c.fg }]}>{label}</Text>
    </View>
  )
}

export function PhotoPicker({
  label,
  url,
  uploading,
  onPick,
  actionLabel,
  round,
}: {
  label: string
  url: string | null
  uploading: boolean
  onPick: () => void
  actionLabel: string
  round?: boolean
}) {
  return (
    <View style={form.field}>
      <Text style={form.label}>{label}</Text>
      <Pressable style={[form.photo, round && form.photoRound]} onPress={onPick} disabled={uploading}>
        {url ? <Image source={{ uri: url }} style={[form.photoImg, round && form.photoRound]} /> : null}
        <View style={[form.photoOverlay, !url && form.photoEmpty]}>
          {uploading ? (
            <ActivityIndicator color={url ? '#FFF' : COLORS.BLUE} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={22} color={url ? '#FFF' : COLORS.BLUE} />
              <Text style={[form.photoText, url && { color: '#FFF' }]}>{actionLabel}</Text>
            </>
          )}
        </View>
      </Pressable>
    </View>
  )
}

export function SubmitButton({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
  return (
    <Pressable style={[form.submit, loading && { opacity: 0.7 }]} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color={COLORS.INK} /> : <Ionicons name="checkmark" size={20} color={COLORS.INK} />}
      <Text style={form.submitText}>{label}</Text>
    </Pressable>
  )
}

export const form = themed(() =>
  StyleSheet.create({
    field: { marginBottom: 16 },
    label: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: COLORS.BLUE, marginBottom: 6, marginLeft: 2 },
    input: { backgroundColor: COLORS.CARD, borderRadius: 16, borderWidth: 1, borderColor: COLORS.BORDER, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: 'Poppins_400Regular', color: COLORS.BLUE },
    inputMulti: { minHeight: 96, textAlignVertical: 'top' },
    hint: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: COLORS.TEXT_MUTED, marginTop: 4, marginLeft: 2 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: COLORS.CARD, borderWidth: 1, borderColor: COLORS.BORDER },
    chipOn: { backgroundColor: COLORS.YELLOW, borderColor: COLORS.YELLOW },
    chipText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: COLORS.TEXT_MUTED },
    chipTextOn: { color: COLORS.INK },
    pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    pillText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
    photo: { height: 160, borderRadius: 20, overflow: 'hidden', backgroundColor: COLORS.GRAY_LIGHT, borderWidth: 1, borderColor: COLORS.BORDER },
    photoRound: { width: 120, height: 120, borderRadius: 60 },
    photoImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    photoOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.35)' },
    photoEmpty: { top: 0, backgroundColor: 'transparent' },
    photoText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: COLORS.BLUE },
    submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.YELLOW, borderRadius: 18, paddingVertical: 15, marginTop: 8 },
    submitText: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: COLORS.INK },
    card: { backgroundColor: COLORS.CARD, borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.BORDER },
    banner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, padding: 14, marginBottom: 18 },
    bannerText: { flex: 1, fontSize: 13, fontFamily: 'Poppins_500Medium', lineHeight: 19 },
  }),
)
