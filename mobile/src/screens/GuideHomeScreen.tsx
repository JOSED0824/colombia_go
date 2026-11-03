import React, { useEffect, useState } from 'react'
import { View, Pressable, ActivityIndicator } from 'react-native'
import { Image } from '../components/Img'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '../components/AppText'
import { form } from '../components/Form'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { apiGet } from '../lib/api'
import { toGuia } from '../lib/guides'
import type { GuiaDto } from '../lib/types'

/**
 * Inicio de la cuenta de guía (pestaña "Mi perfil"): estado de verificación, cómo lo ven los turistas y sus números.
 * `refreshKey` cambia cuando guarda el perfil, para volver a pedirlo.
 */
export function GuideHomeScreen({ name, refreshKey, onEdit }: { name: string; refreshKey: number; onEdit: () => void }) {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<GuiaDto | null | undefined>(undefined)

  useEffect(() => {
    apiGet<GuiaDto>('/api/v1/guias/mi-perfil', { force: true })
      .then(setProfile)
      .catch(() => setProfile(null)) // 404 = aún no ha creado su perfil
  }, [refreshKey])

  const guide = profile ? toGuia(profile) : null

  return (
    <View>
      <Text style={styles.pageTitle}>{t('guideHome.hello', { name: name.split(' ')[0] })}</Text>
      <Text style={[form.hint, { fontSize: 13, marginTop: -6, marginBottom: 18 }]}>{t('guideHome.subtitle')}</Text>

      {profile === undefined ? (
        <ActivityIndicator color={COLORS.BLUE} style={{ marginTop: 40 }} />
      ) : !guide ? (
        <View style={[form.card, { alignItems: 'center', paddingVertical: 28 }]}>
          <Ionicons name="id-card-outline" size={48} color={COLORS.BLUE} />
          <Text style={{ fontSize: 17, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE, marginTop: 10, textAlign: 'center' }}>{t('guideHome.noProfileTitle')}</Text>
          <Text style={[form.hint, { textAlign: 'center', fontSize: 13, marginTop: 6 }]}>{t('guidePanel.empty')}</Text>
          <Pressable style={[form.submit, { alignSelf: 'stretch', marginTop: 18 }]} onPress={onEdit}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.INK} />
            <Text style={form.submitText}>{t('guideHome.create')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={[form.banner, { backgroundColor: guide.verified ? '#E3F6EC' : '#FFF4D6' }]}>
            <Ionicons name={guide.verified ? 'checkmark-circle' : 'time-outline'} size={22} color={guide.verified ? '#0F8A4B' : '#9A6B00'} />
            <Text style={[form.bannerText, { color: guide.verified ? '#0F8A4B' : '#9A6B00' }]}>
              {guide.verified ? t('guidePanel.verified') : t('guidePanel.pending')}
            </Text>
          </View>

          <Text style={[styles.settingsSectionLabel, { marginTop: 0 }]}>{t('guideHome.preview')}</Text>
          <View style={styles.guideRowCard}>
            <Image source={guide.image} style={styles.guideRowImg} />
            <View style={styles.guideRowContent}>
              <Text style={styles.guideRowName}>{guide.name}, {guide.specialty}</Text>
              <View style={styles.langRow}>
                {guide.tags.map((l) => <Text key={l} style={styles.langTag}>{l}</Text>)}
              </View>
              <View style={styles.ratingRowSmall}>
                <Ionicons name="star" size={12} color={COLORS.YELLOW} />
                <Text style={styles.ratingValueSmall} numberOfLines={1}>{guide.rating} ({t('guides.reviews', { count: Number(guide.reviews) })})</Text>
              </View>
            </View>
            <View style={styles.guidePriceArea}>
              <Text style={styles.guidePriceVal}>{guide.price}</Text>
              <Text style={styles.guidePriceSub}>{t('guides.perHour')}</Text>
            </View>
          </View>

          <View style={styles.guideStatsRow}>
            <View style={styles.guideStatBox}>
              <Text style={styles.guideStatVal}>{guide.rating}</Text>
              <Text style={styles.guideStatLabel}>{t('guides.statRating')}</Text>
            </View>
            <View style={styles.guideStatDivider} />
            <View style={styles.guideStatBox}>
              <Text style={styles.guideStatVal}>{guide.reviews}</Text>
              <Text style={styles.guideStatLabel}>{t('guideHome.reviews')}</Text>
            </View>
            <View style={styles.guideStatDivider} />
            <View style={styles.guideStatBox}>
              <Text style={styles.guideStatVal}>{guide.toursCount}</Text>
              <Text style={styles.guideStatLabel}>{t('guides.statTours')}</Text>
            </View>
          </View>

          <Pressable style={[form.submit, { marginTop: 20 }]} onPress={onEdit}>
            <Ionicons name="create-outline" size={20} color={COLORS.INK} />
            <Text style={form.submitText}>{t('guideHome.edit')}</Text>
          </Pressable>
        </>
      )}
    </View>
  )
}
