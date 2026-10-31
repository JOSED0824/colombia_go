import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { LANGUAGES, getLanguage, setLanguage } from '../i18n'
import { apiSend } from '../lib/api'
import { notify } from '../lib/notify'

type Props = {
  /** Se llama al terminar (skipped = false, luego App muestra el recorrido sobre la barra) o al saltar (true). */
  onFinish: (skipped: boolean) => void
}

const TOUR_ICONS: { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }[] = [
  { icon: 'compass', bg: COLORS.YELLOW, fg: COLORS.BLUE },
  { icon: 'heart', bg: '#FFEBEE', fg: COLORS.RED },
  { icon: 'map', bg: '#E3F2FD', fg: '#2196F3' },
  { icon: 'sparkles', bg: '#F3E5F5', fg: '#9C27B0' },
  { icon: 'people', bg: '#E8F5E9', fg: '#2E7D32' },
]

const INTERESTS: { id: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { id: 'food', icon: 'restaurant', color: '#FFD100' },
  { id: 'culture', icon: 'home', color: '#003B7D' },
  { id: 'nature', icon: 'leaf', color: '#4CAF50' },
  { id: 'nightlife', icon: 'musical-notes', color: '#E63946' },
]

/**
 * Bienvenida después de crear la cuenta: (0) idioma, (1-5) tour de la app, (6) intereses.
 * Todo el texto sale de i18n, así que cambiar el idioma en el paso 0 traduce el resto al instante.
 */
export function OnboardingScreen({ onFinish }: Props) {
  const { t } = useTranslation()
  const tour = t('onboarding.tour', { returnObjects: true }) as { title: string; text: string }[]
  const lastStep = tour.length + 1 // 0 = idioma, 1..tour.length = tour, tour.length+1 = intereses

  const [step, setStep] = useState(0)
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const current = getLanguage()

  function toggleInterest(id: string) {
    setInterests((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))
  }

  async function finish() {
    if (interests.length > 0) {
      setSaving(true)
      try {
        await apiSend('/api/v1/perfil/preferencias', 'PUT', { categorias: interests })
      } catch {
        notify(t('onboarding.saveFailed'))
      } finally {
        setSaving(false)
      }
    }
    onFinish(false)
  }

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.topRow}>
        <View style={s.dots}>
          {Array.from({ length: lastStep + 1 }).map((_, i) => (
            <View key={i} style={[s.dot, i === step && s.dotActive]} />
          ))}
        </View>
        {step < lastStep && (
          <Pressable onPress={() => onFinish(true)} hitSlop={12}>
            <Text style={s.skip}>{t('common.skip')}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <>
            <View style={[s.iconCircle, { backgroundColor: COLORS.YELLOW }]}>
              <Ionicons name="language" size={48} color={COLORS.BLUE} />
            </View>
            <Text style={s.title}>{t('onboarding.welcomeTitle')}</Text>
            <Text style={s.text}>{t('onboarding.welcomeSub')}</Text>
            <View style={{ width: '100%', marginTop: 10 }}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={[s.langRow, lang.code === current && s.langRowActive]}
                  onPress={() => setLanguage(lang.code)}
                >
                  <Text style={s.flag}>{lang.flag}</Text>
                  <Text style={[s.langName, lang.code === current && { fontFamily: 'Poppins_700Bold' }]}>{lang.native}</Text>
                  {lang.code === current && <Ionicons name="checkmark-circle" size={22} color={COLORS.BLUE} />}
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step >= 1 && step <= tour.length && (
          <>
            <View style={[s.iconCircle, { backgroundColor: TOUR_ICONS[step - 1].bg }]}>
              <Ionicons name={TOUR_ICONS[step - 1].icon} size={52} color={TOUR_ICONS[step - 1].fg} />
            </View>
            <Text style={s.title}>{tour[step - 1].title}</Text>
            <Text style={s.text}>{tour[step - 1].text}</Text>
          </>
        )}

        {step === lastStep && (
          <>
            <Text style={s.title}>{t('onboarding.interestsTitle')}</Text>
            <Text style={s.text}>{t('onboarding.interestsSub')}</Text>
            <View style={s.interestGrid}>
              {INTERESTS.map((item) => {
                const on = interests.includes(item.id)
                return (
                  <Pressable key={item.id} style={[s.interest, on && s.interestOn]} onPress={() => toggleInterest(item.id)}>
                    <View style={[s.interestIcon, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon} size={26} color={item.color === '#FFD100' ? COLORS.BLUE : '#FFF'} />
                    </View>
                    <Text style={s.interestLabel}>{t(`categories.${item.id}`)}</Text>
                    {on && <Ionicons name="checkmark-circle" size={20} color={COLORS.BLUE} style={s.interestCheck} />}
                  </Pressable>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={s.footer}>
        {step > 0 ? (
          <Pressable style={s.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="chevron-back" size={22} color={COLORS.BLUE} />
          </Pressable>
        ) : (
          <View style={{ width: 48 }} />
        )}
        <Pressable
          style={[s.nextBtn, saving && { opacity: 0.7 }]}
          disabled={saving}
          onPress={() => (step === lastStep ? finish() : setStep(step + 1))}
        >
          <Text style={s.nextText}>{step === lastStep ? t('common.start') : t('common.next')}</Text>
          {saving ? <ActivityIndicator size="small" color={COLORS.BLUE} /> : <Ionicons name="arrow-forward" size={18} color={COLORS.BLUE} />}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.CREAM },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D9E2EC' },
  dotActive: { width: 22, backgroundColor: COLORS.BLUE },
  skip: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.TEXT_MUTED },
  body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 20 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  title: { fontFamily: 'Poppins_800ExtraBold', fontSize: 26, color: COLORS.BLUE, textAlign: 'center', marginBottom: 12 },
  text: { fontFamily: 'Poppins_400Regular', fontSize: 15, lineHeight: 23, color: '#4A6580', textAlign: 'center', marginBottom: 14 },
  langRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  langRowActive: { borderColor: COLORS.BLUE },
  flag: { fontSize: 24, marginRight: 14 },
  langName: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 16, color: COLORS.BLUE },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 },
  interest: { width: '46%', backgroundColor: '#FFF', borderRadius: 20, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  interestOn: { borderColor: COLORS.BLUE },
  interestIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  interestLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.BLUE, textAlign: 'center' },
  interestCheck: { position: 'absolute', top: 10, right: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 20, paddingTop: 8 },
  backBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.YELLOW, borderRadius: 26, paddingVertical: 14, paddingHorizontal: 30 },
  nextText: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: COLORS.BLUE },
})
