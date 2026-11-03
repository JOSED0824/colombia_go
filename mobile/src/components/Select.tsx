import React, { useMemo, useState } from 'react'
import { View, Pressable, Modal, FlatList, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Text, TextInput } from './AppText'
import { form } from './Form'
import { COLORS } from '../theme/colors'
import { themed } from '../theme/themed'

/**
 * Lista desplegable con buscador (se abre como hoja desde abajo). Con `allowOther`, la última opción deja escribir un
 * valor que no está en la lista (por ejemplo, un municipio pequeño).
 */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder,
  allowOther,
  disabled,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  allowOther?: boolean
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [typing, setTyping] = useState(false)

  const filtered = useMemo(() => {
    const q = normalize(query)
    return q ? options.filter((o) => normalize(o).includes(q)) : options
  }, [options, query])

  function close() {
    setOpen(false)
    setQuery('')
    setTyping(false)
  }

  return (
    <View style={form.field}>
      <Text style={form.label}>{label}</Text>
      <Pressable style={[form.input, local.trigger, disabled && { opacity: 0.5 }]} onPress={() => !disabled && setOpen(true)}>
        <Text style={[local.value, !value && { color: COLORS.TEXT_MUTED }]} numberOfLines={1}>
          {value || placeholder || t('select.placeholder')}
        </Text>
        <Ionicons name="chevron-down" size={18} color={COLORS.TEXT_MUTED} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={local.backdrop} onPress={close} />
        <View style={[local.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={local.handle} />
          <Text style={local.title}>{label}</Text>
          <View style={local.search}>
            <Ionicons name={typing ? 'create-outline' : 'search-outline'} size={18} color={COLORS.TEXT_MUTED} />
            <TextInput
              style={local.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={typing ? t('select.typeOther') : t('select.search')}
              placeholderTextColor={COLORS.TEXT_MUTED}
              autoFocus={typing}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (typing && query.trim()) {
                  onChange(query.trim())
                  close()
                }
              }}
            />
          </View>

          {typing ? (
            <Pressable
              style={[form.submit, !query.trim() && { opacity: 0.5 }]}
              disabled={!query.trim()}
              onPress={() => {
                onChange(query.trim())
                close()
              }}
            >
              <Ionicons name="checkmark" size={20} color={COLORS.INK} />
              <Text style={form.submitText}>{t('common.save')}</Text>
            </Pressable>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(o) => o}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 380 }}
              ListEmptyComponent={<Text style={local.empty}>{t('select.none')}</Text>}
              ListFooterComponent={
                allowOther ? (
                  <Pressable style={local.option} onPress={() => setTyping(true)}>
                    <Text style={[local.optionText, { color: COLORS.BLUE, fontFamily: 'Poppins_600SemiBold' }]}>{t('select.other')}</Text>
                    <Ionicons name="create-outline" size={18} color={COLORS.BLUE} />
                  </Pressable>
                ) : undefined
              }
              renderItem={({ item }) => (
                <Pressable
                  style={local.option}
                  onPress={() => {
                    onChange(item)
                    close()
                  }}
                >
                  <Text style={[local.optionText, item === value && { color: COLORS.BLUE, fontFamily: 'Poppins_700Bold' }]}>{item}</Text>
                  {item === value && <Ionicons name="checkmark" size={18} color={COLORS.BLUE} />}
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  )
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

const local = themed(() =>
  StyleSheet.create({
    trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    value: { flex: 1, fontSize: 14, fontFamily: 'Poppins_400Regular', color: COLORS.BLUE },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
    sheet: { backgroundColor: COLORS.CREAM, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10 },
    handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.BORDER, marginBottom: 12 },
    title: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE, marginBottom: 10 },
    search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.CARD, borderRadius: 16, borderWidth: 1, borderColor: COLORS.BORDER, paddingHorizontal: 12, marginBottom: 8 },
    searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, fontFamily: 'Poppins_400Regular', color: COLORS.BLUE },
    option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
    optionText: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: COLORS.BLUE },
    empty: { textAlign: 'center', color: COLORS.TEXT_MUTED, paddingVertical: 20, fontFamily: 'Poppins_400Regular' },
  }),
)
