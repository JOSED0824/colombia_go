import React, { useCallback, useEffect, useState } from 'react'
import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { Text, TextInput } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { themed } from '../theme/themed'
import { styles } from '../theme/styles'
import { apiGet, apiSend } from '../lib/api'
import { apiErrorMessage } from '../lib/errors'
import { notify } from '../lib/notify'
import { formatCop } from '../i18n'
import { TravelGuideResultScreen } from './TravelGuideResultScreen'
import type {
  CiudadDto,
  Destination,
  GenerarGuiaViajeRequest,
  GuiaViajeDto,
  GuiaViajeResumenDto,
} from '../lib/types'

type Props = {
  onViewOnMap: (points: Destination[], title: string) => void
  onSaveStops: (ids: string[]) => Promise<boolean>
  onSelect: (destination: Destination) => void
}

const INTERESTS = ['food', 'culture', 'nature', 'nightlife'] as const
const MIN_DAYS = 1
const MAX_DAYS = 14

/**
 * Pestaña "Guía de viaje": formulario (ciudad + días + presupuesto + intereses) → la IA arma el
 * itinerario día por día con lugares reales. Debajo, las guías que el usuario ya creó.
 */
export function TravelGuideScreen({ onViewOnMap, onSaveStops, onSelect }: Props) {
  const { t, i18n } = useTranslation()
  const [cities, setCities] = useState<CiudadDto[] | null>(null)
  const [city, setCity] = useState('')
  const [days, setDays] = useState(3)
  const [budget, setBudget] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [guide, setGuide] = useState<GuiaViajeDto | null>(null)
  const [mine, setMine] = useState<GuiaViajeResumenDto[]>([])
  const [opening, setOpening] = useState<number | null>(null)

  const loadMine = useCallback(() => {
    apiGet<GuiaViajeResumenDto[]>('/api/v1/ia/guias-viaje').then(setMine).catch(() => {})
  }, [])

  useEffect(() => {
    apiGet<CiudadDto[]>('/api/v1/ia/ciudades')
      .then((list) => {
        setCities(list)
        // Medellín es el foco de la app; si no está, la primera ciudad con lugares.
        const preferred = list.find((c) => c.nombre.toLowerCase().startsWith('medell')) ?? list[0]
        if (preferred) setCity((current) => current || preferred.nombre)
      })
      .catch(() => setCities([]))
    loadMine()
  }, [loadMine])

  // Mensajes que rotan mientras la IA trabaja, para que la espera (unos segundos) no parezca un cuelgue.
  useEffect(() => {
    if (!loading) return
    setMessageIndex(0)
    const timer = setInterval(() => setMessageIndex((i) => i + 1), 2500)
    return () => clearInterval(timer)
  }, [loading])

  function toggleInterest(id: string) {
    setInterests((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))
  }

  async function generate() {
    const amount = Number(budget.replace(/[^0-9]/g, ''))
    if (!city) {
      notify(t('guide.pickCityTitle'), t('guide.pickCityMsg'))
      return
    }
    if (!amount || amount <= 0) {
      notify(t('guide.invalidBudgetTitle'), t('guide.invalidBudgetMsg'))
      return
    }

    setLoading(true)
    try {
      const body: GenerarGuiaViajeRequest = { ciudad: city, dias: days, presupuesto: amount, intereses: interests }
      const created = await apiSend<GuiaViajeDto>('/api/v1/ia/guia-viaje', 'POST', body)
      setGuide(created)
      loadMine()
    } catch (error: any) {
      notify(t('guide.failedTitle'), apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  async function openGuide(id: number) {
    setOpening(id)
    try {
      setGuide(await apiGet<GuiaViajeDto>(`/api/v1/ia/guias-viaje/${id}`))
    } catch (error: any) {
      notify(t('guide.failedTitle'), apiErrorMessage(error))
    } finally {
      setOpening(null)
    }
  }

  if (guide) {
    return (
      <TravelGuideResultScreen
        guia={guide}
        onBack={() => setGuide(null)}
        onViewOnMap={onViewOnMap}
        onSaveStops={onSaveStops}
        onSelect={onSelect}
      />
    )
  }

  const messages = t('guide.generating', { returnObjects: true }) as string[]
  const message = messages[messageIndex % messages.length]

  return (
    <View>
      <Text style={styles.pageTitle}>{t('guide.title')}</Text>
      <Text style={s.intro}>{t('guide.intro')}</Text>

      <Text style={styles.settingsSectionLabel}>{t('guide.city')}</Text>
      {cities === null ? (
        <Text style={styles.editSubText}>{t('guide.citiesLoading')}</Text>
      ) : cities.length === 0 ? (
        <Text style={styles.editSubText}>{t('guide.noCities')}</Text>
      ) : (
        <View style={s.chips}>
          {cities.map((c) => (
            <Pressable
              key={c.nombre}
              style={[styles.filterChip, { marginRight: 0 }, city === c.nombre && styles.filterChipActive]}
              onPress={() => setCity(c.nombre)}
            >
              <Text style={[styles.filterText, city === c.nombre && styles.filterTextActive]}>
                {c.nombre} · {t('guide.placesCount', { count: c.totalLugares })}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.settingsSectionLabel}>{t('guide.days')}</Text>
      <View style={s.stepper}>
        <Pressable style={[s.stepBtn, days <= MIN_DAYS && { opacity: 0.4 }]} disabled={days <= MIN_DAYS} onPress={() => setDays(days - 1)}>
          <Ionicons name="remove" size={22} color={COLORS.BLUE} />
        </Pressable>
        <Text style={s.stepValue}>{days}</Text>
        <Pressable style={[s.stepBtn, days >= MAX_DAYS && { opacity: 0.4 }]} disabled={days >= MAX_DAYS} onPress={() => setDays(days + 1)}>
          <Ionicons name="add" size={22} color={COLORS.BLUE} />
        </Pressable>
      </View>

      <Text style={styles.settingsSectionLabel}>{t('guide.budget')}</Text>
      <View style={styles.authInputWrapper}>
        <Ionicons name="cash-outline" size={20} color={COLORS.BLUE} />
        <TextInput
          style={styles.authTextInput}
          value={budget ? formatCop(Number(budget)) : ''}
          onChangeText={(text) => setBudget(text.replace(/[^0-9]/g, ''))}
          placeholder={t('guide.budgetPlaceholder')}
          placeholderTextColor={COLORS.TEXT_MUTED}
          keyboardType="number-pad"
        />
      </View>

      <Text style={styles.settingsSectionLabel}>{t('guide.interests')}</Text>
      <Text style={[styles.editSubText, { marginBottom: 10 }]}>{t('guide.interestsHint')}</Text>
      <View style={s.chips}>
        {INTERESTS.map((id) => {
          const on = interests.includes(id)
          return (
            <Pressable key={id} style={[styles.filterChip, { marginRight: 0 }, on && styles.filterChipActive]} onPress={() => toggleInterest(id)}>
              <Text style={[styles.filterText, on && styles.filterTextActive]}>{t(`categories.${id}`)}</Text>
            </Pressable>
          )
        })}
      </View>

      <Pressable style={[styles.authSubmit, { marginTop: 25 }, loading && { opacity: 0.7 }]} onPress={generate} disabled={loading}>
        <Text style={styles.authSubmitText}>{t('guide.generate')}</Text>
        {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="sparkles" size={18} color="#FFF" />}
      </Pressable>
      {loading && <Text style={s.loadingMsg}>{message}</Text>}

      <Text style={[styles.settingsSectionLabel, { marginTop: 30 }]}>{t('guide.myGuides')}</Text>
      {mine.length === 0 ? (
        <Text style={styles.editSubText}>{t('guide.noGuides')}</Text>
      ) : (
        mine.map((g) => (
          <Pressable key={g.id} style={s.mineRow} onPress={() => openGuide(g.id)} disabled={opening !== null}>
            <View style={{ flex: 1 }}>
              <Text style={s.mineTitle} numberOfLines={2}>{g.titulo}</Text>
              <Text style={s.mineMeta}>
                {g.ciudad} · {t('guide.days')}: {g.dias} · {formatCop(g.presupuesto)}
              </Text>
              <Text style={s.mineMeta}>{new Date(g.fechaCreacion).toLocaleDateString(i18n.language)}</Text>
            </View>
            {opening === g.id ? <ActivityIndicator size="small" color={COLORS.BLUE} /> : <Ionicons name="chevron-forward" size={20} color={COLORS.BLUE} />}
          </Pressable>
        ))
      )}
    </View>
  )
}

const s = themed(() => StyleSheet.create({
  intro: { fontFamily: 'Poppins_400Regular', fontSize: 14, lineHeight: 21, color: COLORS.TEXT_BODY, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 4 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.CARD, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
  stepValue: { fontFamily: 'Poppins_800ExtraBold', fontSize: 26, color: COLORS.BLUE, minWidth: 40, textAlign: 'center' },
  loadingMsg: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: COLORS.BLUE, textAlign: 'center', marginTop: 12 },
  mineRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.CARD, borderRadius: 18, padding: 14, marginTop: 10 },
  mineTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: COLORS.BLUE },
  mineMeta: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.TEXT_MUTED, marginTop: 2 },
}))
