import React from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import { Image } from '../components/Img'
import { Text } from '../components/AppText'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { notify } from '../lib/notify'
import type { Guia } from '../lib/guides'

/** Perfil completo de un guía local. Todo viene de la lista de guías (ya con caché), así que abre al instante. */
export function GuideDetailScreen({ guide, onBack }: { guide: Guia; onBack: () => void }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
      <StatusBar style="light" />
      {/* paddingBottom: la barra inferior es absoluta (90 de alto); sin este espacio el botón final queda tapado. */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={styles.detailHero}>
          <Image source={guide.image} style={styles.detailImage} />
          <View style={[styles.detailHeaderAbs, { top: insets.top + 8 }]}>
            <Pressable style={styles.fabBack} onPress={onBack}>
              <Ionicons name="chevron-back" size={24} color={COLORS.BLUE} />
            </Pressable>
          </View>
        </View>

        <View style={styles.detailContainer}>
          <View style={styles.handle} />

          <Text style={styles.detailName}>{guide.name}</Text>
          <View style={styles.guideDetailPills}>
            <View style={styles.guideRowPill}>
              <Text style={styles.guideRowPillText}>{guide.specialty}</Text>
            </View>
            {guide.verified && (
              <View style={styles.guideVerified}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.guideVerifiedText}>{t('guides.verified')}</Text>
              </View>
            )}
          </View>
          <View style={styles.guideDetailLoc}>
            <Ionicons name="location" size={16} color={COLORS.TEXT_MUTED} />
            <Text style={styles.guideDetailLocText}>{guide.place}</Text>
          </View>

          <View style={styles.guideStatsRow}>
            <View style={styles.guideStatBox}>
              <View style={styles.guideStatValRow}>
                <Ionicons name="star" size={16} color={COLORS.YELLOW} />
                <Text style={styles.guideStatVal}>{guide.rating}</Text>
              </View>
              <Text style={styles.guideStatLabel} numberOfLines={2}>
                {t('guides.reviews', { count: Number(guide.reviews) })}
              </Text>
            </View>
            <View style={styles.guideStatDivider} />
            <View style={styles.guideStatBox}>
              <Text style={styles.guideStatVal} numberOfLines={1}>
                {t('guides.yearsValue', { count: guide.experienceYears })}
              </Text>
              <Text style={styles.guideStatLabel} numberOfLines={2}>{t('guides.statExperience')}</Text>
            </View>
            <View style={styles.guideStatDivider} />
            <View style={styles.guideStatBox}>
              <Text style={styles.guideStatVal} numberOfLines={1}>{guide.toursCount}</Text>
              <Text style={styles.guideStatLabel} numberOfLines={2}>{t('guides.statTours')}</Text>
            </View>
          </View>

          <Text style={styles.guideDetailSection}>{t('guides.about')}</Text>
          <Text style={styles.detailDesc}>{guide.bio || t('guides.noBio')}</Text>

          <Text style={styles.guideDetailSection}>{t('guides.languages')}</Text>
          <View style={styles.guideLangWrap}>
            {guide.tags.map((lang) => (
              <View key={lang} style={styles.guideLangChip}>
                <Ionicons name="language-outline" size={14} color={COLORS.BLUE} />
                <Text style={styles.guideLangChipText}>{lang}</Text>
              </View>
            ))}
          </View>

          <View style={styles.guideRateCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.guideRateLabel}>{t('guides.rate')}</Text>
              <Text style={styles.guideRateVal}>
                {guide.price} <Text style={styles.guideRateSub}>{t('guides.perHour')}</Text>
              </Text>
            </View>
            <Ionicons name="cash-outline" size={28} color={COLORS.BLUE} />
          </View>

          <Pressable style={styles.primaryBtnLarge} onPress={() => notify(t('guides.reserveSoon', { name: guide.name }))}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.INK} />
            <Text style={[styles.primaryBtnText, { marginLeft: 10 }]}>{t('guides.reserve')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
