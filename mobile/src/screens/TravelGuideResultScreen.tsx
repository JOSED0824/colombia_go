import React, { useState } from 'react'
import { View, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS, getThemeMode } from '../theme/colors'
import { themed } from '../theme/themed'
import { formatCop } from '../i18n'
import { toDestination } from '../lib/mappers'
import type { Destination, GuiaViajeDto } from '../lib/types'

type Props = {
  guia: GuiaViajeDto
  onBack: () => void
  onViewOnMap: (points: Destination[], title: string) => void
  onSaveStops: (ids: string[]) => Promise<boolean>
  onSelect: (destination: Destination) => void
}

/** Guía generada: resumen, presupuesto (gastado vs. restante), acordeón por día, consejos y qué llevar. */
export function TravelGuideResultScreen({ guia, onBack, onViewOnMap, onSaveStops, onSelect }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number[]>([guia.planDiario[0]?.dia ?? 1])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const usedPct = guia.presupuesto > 0 ? Math.min(100, Math.round((guia.costoTotalEstimado / guia.presupuesto) * 100)) : 0

  function toggleDay(dia: number) {
    setOpen((list) => (list.includes(dia) ? list.filter((d) => d !== dia) : [...list, dia]))
  }

  async function saveAll() {
    const ids = [...new Set(guia.planDiario.flatMap((d) => d.paradas.map((p) => p.lugar.id)))]
    setSaving(true)
    const ok = await onSaveStops(ids)
    setSaving(false)
    if (ok) setSaved(true)
  }

  return (
    <View>
      <Pressable style={s.back} onPress={onBack} hitSlop={10}>
        <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        <Text style={s.backText}>{t('guide.back')}</Text>
      </Pressable>

      <Text style={s.title}>{guia.titulo}</Text>
      <Text style={s.meta}>
        {guia.ciudad} · {t('guide.days')}: {guia.dias}
      </Text>

      <View style={s.card}>
        <Text style={s.cardLabel}>{t('guide.summary')}</Text>
        <Text style={s.bodyText}>{guia.resumen}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>{t('guide.budgetTitle')}</Text>
        <Text style={s.bodyText}>
          {t('guide.estimated', { cost: formatCop(guia.costoTotalEstimado), budget: formatCop(guia.presupuesto) })}
        </Text>
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${usedPct}%`, backgroundColor: guia.excedePresupuesto ? COLORS.RED : '#2E7D32' }]} />
        </View>
        <Text style={[s.budgetStatus, { color: guia.excedePresupuesto ? COLORS.RED : '#2E7D32' }]}>
          {guia.excedePresupuesto
            ? t('guide.over', { cost: formatCop(Math.abs(guia.presupuestoRestante)) })
            : t('guide.left', { cost: formatCop(guia.presupuestoRestante) })}
        </Text>
      </View>

      {guia.planDiario.map((dia) => {
        const isOpen = open.includes(dia.dia)
        return (
          <View key={dia.dia} style={s.dayCard}>
            <Pressable style={s.dayHeader} onPress={() => toggleDay(dia.dia)}>
              <View style={s.dayBadge}>
                <Text style={s.dayBadgeText}>{dia.dia}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.dayTitle}>{t('guide.day', { day: dia.dia })}</Text>
                <Text style={s.dayTheme} numberOfLines={isOpen ? undefined : 1}>{dia.tema}</Text>
              </View>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.BLUE} />
            </Pressable>

            {isOpen && (
              <View style={s.dayBody}>
                {dia.paradas.map((parada, index) => {
                  const destino = toDestination(parada.lugar)
                  return (
                    <Pressable key={`${parada.lugar.id}-${index}`} style={s.stop} onPress={() => onSelect(destino)}>
                      <View style={s.timeCol}>
                        <Text style={s.time}>{parada.hora}</Text>
                        <Text style={s.duration}>{t('guide.minutes', { minutes: parada.duracionMin })}</Text>
                      </View>
                      <View style={s.stopBody}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {destino.image ? <Image source={destino.image} style={s.stopImg} /> : null}
                          <View style={{ flex: 1 }}>
                            <Text style={s.stopName}>{parada.lugar.name}</Text>
                            <Text style={s.stopCost}>{t('guide.approxCost', { cost: formatCop(parada.costoAprox) })}</Text>
                          </View>
                        </View>
                        {!!parada.consejo && (
                          <View style={s.tipBox}>
                            <Ionicons name="bulb-outline" size={14} color={COLORS.BLUE} />
                            <Text style={s.tipText}>{parada.consejo}</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  )
                })}

                <Pressable
                  style={s.mapBtn}
                  onPress={() =>
                    onViewOnMap(
                      dia.paradas.map((p) => toDestination(p.lugar)),
                      `${guia.ciudad} · ${t('guide.day', { day: dia.dia })}`,
                    )
                  }
                >
                  <Ionicons name="map-outline" size={16} color={COLORS.BLUE} />
                  <Text style={s.mapBtnText}>{t('guide.viewDayOnMap')}</Text>
                </Pressable>
              </View>
            )}
          </View>
        )
      })}

      {guia.consejosGenerales.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardLabel}>{t('guide.generalTips')}</Text>
          {guia.consejosGenerales.map((tip, i) => (
            <View key={i} style={s.bullet}>
              <Text style={s.bulletDot}>•</Text>
              <Text style={[s.bodyText, { flex: 1 }]}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {guia.queLlevar.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardLabel}>{t('guide.pack')}</Text>
          <View style={s.chips}>
            {guia.queLlevar.map((item, i) => (
              <View key={i} style={s.chip}>
                <Text style={s.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Pressable style={[s.saveBtn, (saving || saved) && { opacity: 0.7 }]} onPress={saveAll} disabled={saving || saved}>
        {saving ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Ionicons name={saved ? 'checkmark-circle' : 'bookmark-outline'} size={18} color="#FFF" />
        )}
        <Text style={s.saveBtnText}>{saved ? t('guide.stopsSaved') : t('guide.saveStops')}</Text>
      </Pressable>
    </View>
  )
}

const s = themed(() => StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, alignSelf: 'flex-start' },
  backText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.BLUE },
  title: { fontFamily: 'Poppins_800ExtraBold', fontSize: 24, color: COLORS.BLUE, lineHeight: 32 },
  meta: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: COLORS.TEXT_MUTED, marginBottom: 16 },
  card: { backgroundColor: COLORS.CARD, borderRadius: 20, padding: 16, marginBottom: 14 },
  cardLabel: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: COLORS.BLUE, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  bodyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, lineHeight: 21, color: COLORS.TEXT_BODY },
  barTrack: { height: 10, borderRadius: 5, backgroundColor: COLORS.SURFACE2, marginTop: 12, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  budgetStatus: { fontFamily: 'Poppins_700Bold', fontSize: 13, marginTop: 8 },
  dayCard: { backgroundColor: COLORS.CARD, borderRadius: 20, marginBottom: 12, overflow: 'hidden' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  dayBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.YELLOW, alignItems: 'center', justifyContent: 'center' },
  dayBadgeText: { fontFamily: 'Poppins_800ExtraBold', fontSize: 16, color: COLORS.INK },
  dayTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: COLORS.BLUE },
  dayTheme: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.TEXT_MUTED },
  dayBody: { paddingHorizontal: 14, paddingBottom: 14 },
  stop: { flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.BORDER },
  timeCol: { width: 58 },
  time: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: COLORS.BLUE },
  duration: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: COLORS.TEXT_MUTED },
  stopBody: { flex: 1 },
  stopImg: { width: 46, height: 46, borderRadius: 12, marginRight: 10 },
  stopName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.BLUE },
  stopCost: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.TEXT_MUTED },
  tipBox: { flexDirection: 'row', gap: 6, backgroundColor: getThemeMode() === 'dark' ? 'rgba(255,209,0,0.14)' : '#FFF8DC', borderRadius: 12, padding: 8, marginTop: 8 },
  tipText: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 18, color: COLORS.TEXT_BODY },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, paddingVertical: 10, borderRadius: 16, backgroundColor: COLORS.SURFACE2 },
  mapBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.BLUE },
  bullet: { flexDirection: 'row', gap: 8, marginTop: 4 },
  bulletDot: { fontFamily: 'Poppins_700Bold', color: COLORS.BLUE },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: COLORS.SURFACE2, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: COLORS.BLUE },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.PRIMARY, borderRadius: 26, paddingVertical: 14, marginTop: 6, marginBottom: 20 },
  saveBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#FFF' },
}))
