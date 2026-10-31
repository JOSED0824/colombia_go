import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { LANGUAGES, getLanguage, type LanguageCode } from '../i18n'

type Props = {
  visible: boolean
  onClose: () => void
  onSelect: (code: LanguageCode) => void
}

/** Modal "Selecciona idioma" con los 5 idiomas — se abre desde el botón de bandera del login. */
export function LanguageModal({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation()
  const current = getLanguage()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <Text style={s.title}>{t('language.select')}</Text>
          {LANGUAGES.map((lang) => {
            const active = lang.code === current
            return (
              <Pressable
                key={lang.code}
                style={[s.row, active && s.rowActive]}
                onPress={() => {
                  onSelect(lang.code)
                  onClose()
                }}
                accessibilityRole="button"
                accessibilityLabel={lang.native}
              >
                <Text style={s.flag}>{lang.flag}</Text>
                <Text style={[s.name, active && s.nameActive]}>{lang.native}</Text>
                {active && <Ionicons name="checkmark-circle" size={22} color={COLORS.BLUE} />}
              </Pressable>
            )
          })}
          <Text style={s.hint}>{t('language.hint')}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

/** Botón compacto (bandera + código) para poner en la esquina de una pantalla. */
export function LanguageButton({ onPress }: { onPress: () => void }) {
  const current = LANGUAGES.find((l) => l.code === getLanguage()) ?? LANGUAGES[0]
  return (
    <Pressable style={s.button} onPress={onPress} accessibilityRole="button" accessibilityLabel="Language">
      <Text style={s.buttonFlag}>{current.flag}</Text>
      <Text style={s.buttonCode}>{current.code.toUpperCase()}</Text>
      <Ionicons name="chevron-down" size={14} color={COLORS.BLUE} />
    </Pressable>
  )
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,28,61,0.55)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: COLORS.WHITE, borderRadius: 24, padding: 20 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: COLORS.BLUE, marginBottom: 14, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, marginBottom: 6 },
  rowActive: { backgroundColor: COLORS.GRAY_LIGHT },
  flag: { fontSize: 24, marginRight: 14 },
  name: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 16, color: COLORS.BLUE },
  nameActive: { fontFamily: 'Poppins_700Bold' },
  hint: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.TEXT_MUTED, textAlign: 'center', marginTop: 10 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  buttonFlag: { fontSize: 16 },
  buttonCode: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.BLUE },
})
