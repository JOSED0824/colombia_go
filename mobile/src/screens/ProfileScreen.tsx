import React, { useCallback, useEffect, useState } from 'react'
import { View, Pressable } from 'react-native'
import { Image } from '../components/Img'
import { Text } from '../components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, getThemeMode } from '../theme/colors'
import { styles } from '../theme/styles'
import { MenuRow } from '../components/MenuRow'
import { PressableScale } from '../components/Transitions'
import { useTranslation } from 'react-i18next'
import { apiGet, onApiMutation } from '../lib/api'
import { badgeImage } from '../lib/badges'
import { notify } from '../lib/notify'
import type { LogroDto, PerfilDto } from '../lib/types'

const ROLE_ICON: Record<string, string> = { guia: 'person-circle', negocio: 'storefront', admin: 'shield-checkmark' }

// Color de fondo de cada insignia según el "tone" que guarda la base (versión clara y oscura).
const TONOS_CLARO: Record<string, string> = { green: '#E8F5E9', yellow: '#FFF9E1', blue: '#E3F2FD', red: '#FFEBEE', purple: '#F3E5F5' }
const TONOS_OSCURO: Record<string, string> = { green: '#1B3A2C', yellow: '#3B3518', blue: '#1B2F4A', red: '#3D2027', purple: '#2E2342' }

export function ProfileScreen({ favorites, routesCount, profileName, profileBio, profilePhoto, onNavigate }: any) {
  const { t, i18n } = useTranslation()
  const [perfil, setPerfil] = useState<PerfilDto | null>(null)
  const [logros, setLogros] = useState<LogroDto[]>([])

  const load = useCallback((force = false) => {
    apiGet<PerfilDto>('/api/v1/perfil', { force }).then(setPerfil).catch(() => {})
    apiGet<LogroDto[]>('/api/v1/perfil/logros', { force }).then(setLogros).catch(() => {})
  }, [])

  // La pestaña queda abierta en segundo plano: se vuelve a pedir tras cada acción (favorito, ruta, reseña, guía IA…),
  // así los números y las insignias recién ganadas se ven al entrar, sin esperar a reabrir la app.
  useEffect(() => load(), [load, favorites?.length, i18n.language])
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = onApiMutation(() => {
      clearTimeout(timer)
      timer = setTimeout(() => load(true), 1300)
    })
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [load])

  const isTourist = !perfil?.role || perfil.role === 'turista'
  const nivel = perfil?.level.match(/\d+/)?.[0]
  const levelLabel = nivel ? t('profile.level', { n: nivel }) : t('profile.traveler')
  const earned = logros.filter((l) => l.unlocked).length
  const tones = getThemeMode() === 'dark' ? TONOS_OSCURO : TONOS_CLARO

  return (
    <View>
      <View style={styles.profileHero}>
        <Image source={require('../../assets/normalized/fondo.jpg')} style={styles.profileArt} />
        {getThemeMode() === 'dark' && <View style={styles.profileArtDim} />}
        <View style={styles.profileHeaderContent}>
          <Text style={styles.profileHeaderTitle}>{t('profile.title')}</Text>
          <Pressable style={styles.settingsBtn} onPress={() => onNavigate('Configuración')}>
            <Ionicons name="settings-outline" size={24} color={COLORS.BLUE} />
          </Pressable>
        </View>
        <View style={styles.profilePhotoContainer}>
          <Image source={profilePhoto ? { uri: profilePhoto } : require('../../assets/normalized/Camilo.jpg')} style={styles.profileImage} />
          <View style={styles.badgeProfile}><Ionicons name="star" size={16} color={COLORS.INK} /></View>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{profileName}</Text>
        <Text style={styles.profileBio} numberOfLines={2}>{profileBio || t('profile.bio')}</Text>
        <View style={styles.profileChips}>
          {isTourist && (
            <View style={[styles.profileChip, { backgroundColor: '#EEE8FF' }]}>
              <Ionicons name="ribbon" size={14} color="#6B4CFF" />
              <Text style={[styles.profileChipText, { color: '#6B4CFF' }]}>{levelLabel}</Text>
            </View>
          )}
          {!!perfil?.role && perfil.role !== 'turista' && (
            <View style={[styles.profileChip, { backgroundColor: COLORS.YELLOW }]}>
              <Ionicons name={ROLE_ICON[perfil.role] as any} size={14} color={COLORS.INK} />
              <Text style={[styles.profileChipText, { color: COLORS.INK }]}>{t(`roles.${perfil.role}`)}</Text>
            </View>
          )}
        </View>

        {isTourist && (
          <>
            {/* Números del viajero: favoritos, paradas en su ruta y reseñas. */}
            <View style={styles.statsPanel}>
              <Stat icon="heart" color="#E63946" value={perfil?.places} label={t('profile.statFavorites')} />
              <View style={styles.dividerV} />
              <Stat icon="map" color="#2196F3" value={routesCount} label={t('profile.statRoute')} />
              <View style={styles.dividerV} />
              <Stat icon="star" color="#F59E0B" value={perfil?.reviews} label={t('profile.reviews')} />
            </View>

            {/* Insignias: progreso y cuadrícula (ganadas primero). Tocar una explica cómo se gana. */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('profile.achievements')}</Text>
              {logros.length > 0 && <Text style={styles.seeAllText}>{t('profile.badgesCount', { done: earned, total: logros.length })}</Text>}
            </View>
            {logros.length > 0 && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round((earned / logros.length) * 100)}%` }]} />
              </View>
            )}
            <View style={styles.badgeGrid}>
              {[...logros]
                .sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
                .map((logro) => {
                  const title = t(`achievements.${logro.id}.title`, { defaultValue: logro.title })
                  const text = t(`achievements.${logro.id}.text`, { defaultValue: logro.text })
                  const badge = badgeImage(logro.icon)
                  return (
                    <PressableScale
                      key={logro.id}
                      style={[styles.badgeTile, { backgroundColor: logro.unlocked ? tones[logro.tone] ?? COLORS.GRAY_LIGHT : COLORS.CARD }]}
                      onPress={() => notify(title, logro.unlocked ? text : t('profile.lockedHint', { text }))}
                    >
                      <View>
                        {badge ? (
                          <Image source={badge} style={[styles.badgeTileImg, !logro.unlocked && { opacity: 0.3 }]} resizeMode="contain" />
                        ) : (
                          <Text style={{ fontSize: 34, opacity: logro.unlocked ? 1 : 0.3 }}>{logro.icon}</Text>
                        )}
                        {!logro.unlocked && (
                          <View style={styles.badgeLock}>
                            <Ionicons name="lock-closed" size={11} color="#FFF" />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.badgeTileTitle, !logro.unlocked && { color: COLORS.TEXT_MUTED }]} numberOfLines={2}>
                        {title}
                      </Text>
                    </PressableScale>
                  )
                })}
            </View>
          </>
        )}

        <View style={styles.menuCard}>
          {perfil?.role === 'guia' && (
            <MenuRow icon="person-circle" label={t('profile.guidePanel')} sub={t('profile.guidePanelSub')} color="#E8F5E9" iconCol="#10B981" onPress={() => onNavigate('MiGuia')} />
          )}
          {perfil?.role === 'negocio' && (
            <MenuRow icon="storefront" label={t('profile.business')} sub={t('profile.businessSub')} color="#FFF8E1" iconCol="#F59E0B" onPress={() => onNavigate('MiNegocio')} />
          )}
          {perfil?.role === 'admin' && (
            <MenuRow icon="shield-checkmark" label={t('profile.admin')} sub={t('profile.adminSub')} color="#E3F2FD" iconCol="#003B7D" onPress={() => onNavigate('Moderar')} />
          )}
          {isTourist && <MenuRow icon="heart" label={t('profile.favorites')} sub={t('profile.favoritesSub')} color="#FFEBEE" iconCol="#E63946" onPress={() => onNavigate('Favoritos')} />}
          {isTourist && <MenuRow icon="map" label={t('profile.routes')} sub={t('profile.routesSub')} color="#E3F2FD" iconCol="#2196F3" onPress={() => onNavigate('Viajes')} />}
          <MenuRow icon="notifications" label={t('profile.notifications')} sub={t('profile.notificationsSub')} color="#FFF4D6" iconCol="#F59E0B" onPress={() => onNavigate('Notificaciones')} />
          <MenuRow icon="settings" label={t('profile.settings')} sub={t('profile.settingsSub')} color="#F3E5F5" iconCol="#9C27B0" onPress={() => onNavigate('Configuración')} />
        </View>
      </View>
    </View>
  )
}

function Stat({ icon, color, value, label }: { icon: string; color: string; value: number | undefined; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal}>{value ?? '–'}</Text>
      <View style={styles.statLabelRow}>
        <Ionicons name={icon as any} size={12} color={color} />
        <Text style={styles.statLabelText} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  )
}
