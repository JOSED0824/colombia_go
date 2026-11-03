import React, { useCallback, useEffect, useState } from 'react'
import { View, Pressable, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text, TextInput } from '../components/AppText'
import { KeyboardScroll } from '../components/KeyboardScroll'
import { form } from '../components/Form'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { apiGet, apiSend } from '../lib/api'
import { notify } from '../lib/notify'
import type { CalificacionPendienteDto, GuiaDto, LugarPendienteDto, PagedResult } from '../lib/types'

type Tab = 'places' | 'guides' | 'reviews'

/** Panel de administración: aprobar lugares de negocios, verificar guías y moderar reseñas. */
export function AdminScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('places')
  const [places, setPlaces] = useState<LugarPendienteDto[] | null>(null)
  const [guides, setGuides] = useState<GuiaDto[] | null>(null)
  const [reviews, setReviews] = useState<CalificacionPendienteDto[] | null>(null)
  const [rejecting, setRejecting] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    apiGet<PagedResult<LugarPendienteDto>>('/api/v1/admin/lugares/pendientes?pageSize=50', { force: true }).then((p) => setPlaces(p.items)).catch(() => setPlaces([]))
    apiGet<GuiaDto[]>('/api/v1/admin/guias/pendientes', { force: true }).then(setGuides).catch(() => setGuides([]))
    apiGet<PagedResult<CalificacionPendienteDto>>('/api/v1/admin/calificaciones/pendientes?pageSize=50', { force: true }).then((p) => setReviews(p.items)).catch(() => setReviews([]))
  }, [])
  useEffect(load, [load])

  async function run(key: string, action: () => Promise<unknown>, after: () => void) {
    setBusy(key)
    try {
      await action()
      after()
    } catch {
      notify(t('admin.failed'))
    } finally {
      setBusy(null)
    }
  }

  const moderatePlace = (id: number, aprobar: boolean) =>
    run(`p${id}`, () => apiSend(`/api/v1/admin/lugares/${id}/moderar`, 'PATCH', { aprobar, motivoRechazo: aprobar ? null : reason.trim() || null }), () => {
      setPlaces((cur) => cur?.filter((p) => p.id !== id) ?? null)
      setRejecting(null)
      setReason('')
    })
  const verifyGuide = (id: number) =>
    run(`g${id}`, () => apiSend(`/api/v1/admin/guias/${id}/verificar`, 'PATCH', { verificado: true }), () =>
      setGuides((cur) => cur?.filter((g) => g.id !== id) ?? null),
    )
  const moderateReview = (id: number, aprobar: boolean) =>
    run(`r${id}`, () => apiSend(`/api/v1/admin/calificaciones/${id}/moderar`, 'PATCH', { aprobar }), () =>
      setReviews((cur) => cur?.filter((r) => r.id !== id) ?? null),
    )

  const counts: Record<Tab, number | undefined> = { places: places?.length, guides: guides?.length, reviews: reviews?.length }
  const list = tab === 'places' ? places : tab === 'guides' ? guides : reviews

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.backBtnSmall} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        </Pressable>
        <Text style={styles.settingsHeaderTitle}>{t('admin.title')}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {(['places', 'guides', 'reviews'] as Tab[]).map((k) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[styles.filterChip, { marginRight: 0, flex: 1, alignItems: 'center', paddingHorizontal: 6 }, tab === k && styles.filterChipActive]}>
            <Text style={[styles.filterText, tab === k && styles.filterTextActive]} numberOfLines={1}>
              {t(`admin.tab_${k}`)}{counts[k] ? ` (${counts[k]})` : ''}
            </Text>
          </Pressable>
        ))}
      </View>

      <KeyboardScroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {list === null ? (
          <ActivityIndicator color={COLORS.BLUE} style={{ marginTop: 30 }} />
        ) : list.length === 0 ? (
          <Text style={{ textAlign: 'center', color: COLORS.TEXT_MUTED, marginTop: 30 }}>{t(`admin.empty_${tab}`)}</Text>
        ) : tab === 'places' ? (
          places!.map((p) => (
            <View key={p.id} style={form.card}>
              {!!p.imagenUrl && <Image source={{ uri: p.imagenUrl }} style={{ height: 140, borderRadius: 14, marginBottom: 10 }} />}
              <Text style={{ fontSize: 16, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE }}>{p.nombre}</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Poppins_500Medium', color: COLORS.TEXT_MUTED }}>{p.categoria} · {p.ciudad}</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: COLORS.TEXT_MUTED, marginTop: 2 }}>{p.direccion}</Text>
              {!!p.registradoPorNombre && (
                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: COLORS.TEXT_MUTED, marginTop: 2 }}>
                  {t('admin.by', { name: `${p.registradoPorNombre}${p.registradoPorEmail ? ` (${p.registradoPorEmail})` : ''}` })}
                </Text>
              )}
              <Text style={{ fontSize: 13, fontFamily: 'Poppins_400Regular', color: COLORS.BLUE, marginTop: 8 }} numberOfLines={6}>{p.descripcion}</Text>
              {rejecting === p.id ? (
                <>
                  <TextInput
                    style={[form.input, { marginTop: 12 }]}
                    value={reason}
                    onChangeText={setReason}
                    placeholder={t('admin.rejectReasonPh')}
                    placeholderTextColor={COLORS.TEXT_MUTED}
                    multiline
                  />
                  <Actions
                    busy={busy === `p${p.id}`}
                    primary={{ label: t('admin.confirmReject'), danger: true, onPress: () => moderatePlace(p.id, false) }}
                    secondary={{ label: t('common.cancel'), onPress: () => setRejecting(null) }}
                  />
                </>
              ) : (
                <Actions
                  busy={busy === `p${p.id}`}
                  primary={{ label: t('admin.approve'), onPress: () => moderatePlace(p.id, true) }}
                  secondary={{ label: t('admin.reject'), onPress: () => { setRejecting(p.id); setReason('') } }}
                />
              )}
            </View>
          ))
        ) : tab === 'guides' ? (
          guides!.map((g) => (
            <View key={g.id} style={form.card}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                {g.image && /^https?:/.test(g.image) ? (
                  <Image source={{ uri: g.image }} style={{ width: 54, height: 54, borderRadius: 27 }} />
                ) : (
                  <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.GRAY_LIGHT, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="person-outline" size={24} color={COLORS.TEXT_MUTED} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE }}>{g.name}</Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Poppins_500Medium', color: COLORS.TEXT_MUTED }}>{g.specialty} · {g.place} · {g.price}</Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Poppins_500Medium', color: COLORS.TEXT_MUTED }}>{g.languages.join(' · ')}</Text>
                </View>
              </View>
              {!!g.bio && <Text style={{ fontSize: 13, fontFamily: 'Poppins_400Regular', color: COLORS.BLUE, marginTop: 8 }}>{g.bio}</Text>}
              <Actions busy={busy === `g${g.id}`} primary={{ label: t('admin.verify'), onPress: () => verifyGuide(g.id) }} />
            </View>
          ))
        ) : (
          reviews!.map((r) => (
            <View key={r.id} style={form.card}>
              <Text style={{ fontSize: 15, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE }}>{r.lugarNombre}</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Poppins_500Medium', color: COLORS.TEXT_MUTED }}>
                {r.usuarioNombre} · {'★'.repeat(r.puntuacion)}{'☆'.repeat(5 - r.puntuacion)}
              </Text>
              {!!r.comentario && <Text style={{ fontSize: 13, fontFamily: 'Poppins_400Regular', color: COLORS.BLUE, marginTop: 8 }}>{r.comentario}</Text>}
              <Actions
                busy={busy === `r${r.id}`}
                primary={{ label: t('admin.approve'), onPress: () => moderateReview(r.id, true) }}
                secondary={{ label: t('admin.reject'), onPress: () => moderateReview(r.id, false) }}
              />
            </View>
          ))
        )}
      </KeyboardScroll>
    </View>
  )
}

function Actions({
  busy,
  primary,
  secondary,
}: {
  busy: boolean
  primary: { label: string; onPress: () => void; danger?: boolean }
  secondary?: { label: string; onPress: () => void }
}) {
  if (busy) return <ActivityIndicator color={COLORS.BLUE} style={{ marginTop: 14 }} />
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
      {secondary && (
        <Pressable onPress={secondary.onPress} style={{ flex: 1, height: 44, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.BORDER, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: COLORS.TEXT_MUTED }}>{secondary.label}</Text>
        </Pressable>
      )}
      <Pressable
        onPress={primary.onPress}
        style={{ flex: 1.4, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: primary.danger ? COLORS.RED : COLORS.YELLOW }}
      >
        <Text style={{ fontSize: 14, fontFamily: 'Poppins_700Bold', color: primary.danger ? '#FFF' : COLORS.INK }}>{primary.label}</Text>
      </Pressable>
    </View>
  )
}
