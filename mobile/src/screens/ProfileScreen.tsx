import React, { useEffect, useState } from 'react'
import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { AchievementCard } from '../components/AchievementCard'
import { MenuRow } from '../components/MenuRow'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../lib/api'
import type { LogroDto, PerfilDto } from '../lib/types'

// Color de fondo de cada logro según el "tone" que guarda la base.
const TONOS: Record<string, string> = {
  green: '#E8F5E9',
  yellow: '#FFF9E1',
  blue: '#E3F2FD',
  red: '#FFEBEE',
  purple: '#F3E5F5',
}

export function ProfileScreen({ favorites, profileName, profileBio, profilePhoto, onNavigate }: any) {
  const { t, i18n } = useTranslation()
  const [perfil, setPerfil] = useState<PerfilDto | null>(null)
  const [logros, setLogros] = useState<LogroDto[]>([])

  // Se recarga cada vez que se abre la pestaña (o cambian los favoritos), así las estadísticas están al día.
  useEffect(() => {
    apiGet<PerfilDto>('/api/v1/perfil').then(setPerfil).catch(() => {})
    apiGet<LogroDto[]>('/api/v1/perfil/logros').then(setLogros).catch(() => {})
  }, [favorites?.length, i18n.language])

  const nivel = perfil?.level.match(/\d+/)?.[0]
  const levelLabel = nivel ? t('profile.level', { n: nivel }) : t('profile.traveler')

  return (
    <View>
      <View style={styles.profileHero}>
        <Image source={require('../../assets/normalized/fondo.jpg')} style={styles.profileArt} />
        <View style={styles.profileHeaderContent}>
          <Text style={styles.profileHeaderTitle}>{t('profile.title')}</Text>
          <Pressable style={styles.settingsBtn} onPress={() => onNavigate('Configuración')}>
            <Ionicons name="settings-outline" size={24} color={COLORS.BLUE} />
          </Pressable>
        </View>

        <View style={styles.profilePhotoContainer}>
          <Image source={profilePhoto ? { uri: profilePhoto } : require('../../assets/normalized/Camilo.jpg')} style={styles.profileImage} />
          <View style={styles.badgeProfile}><Ionicons name="star" size={16} color={COLORS.BLUE} /></View>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{profileName}</Text>
        <Text style={styles.profileBio} numberOfLines={2}>{profileBio || t('profile.bio')}</Text>
        <Text style={styles.profileLevel}><Ionicons name="ribbon-outline" size={16} color="#6B4CFF" /> {levelLabel}</Text>

        <View style={styles.statsPanel}>
          <View style={styles.statBox}><Text style={styles.statVal}>{perfil?.places ?? '–'}</Text><View style={styles.statLabelRow}><Ionicons name="location" size={12} color="#10B981" /><Text style={styles.statLabelText}>{t('profile.places')}</Text></View></View>
          <View style={styles.dividerV} />
          <View style={styles.statBox}><Text style={styles.statVal}>{perfil?.guides ?? '–'}</Text><View style={styles.statLabelRow}><Ionicons name="book" size={12} color="#3B82F6" /><Text style={styles.statLabelText}>{t('profile.guides')}</Text></View></View>
          <View style={styles.dividerV} />
          <View style={styles.statBox}><Text style={styles.statVal}>{perfil?.reviews ?? '–'}</Text><View style={styles.statLabelRow}><Ionicons name="star" size={12} color="#F59E0B" /><Text style={styles.statLabelText}>{t('profile.reviews')}</Text></View></View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('profile.achievements')}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievements}>
          {logros.map((logro) => (
            <AchievementCard
              key={logro.id}
              emoji={logro.icon}
              title={t(`achievements.${logro.id}.title`, { defaultValue: logro.title })}
              desc={t(`achievements.${logro.id}.text`, { defaultValue: logro.text })}
              color={TONOS[logro.tone] ?? '#F5F5F5'}
              locked={!logro.unlocked}
            />
          ))}
        </ScrollView>

        <View style={styles.profileMenu}>
          <MenuRow icon="heart" label={t('profile.favorites')} sub={t('profile.favoritesSub')} color="#FFEBEE" iconCol="#E63946" onPress={() => onNavigate('Favoritos')} />
          <MenuRow icon="map" label={t('profile.routes')} sub={t('profile.routesSub')} color="#E3F2FD" iconCol="#2196F3" onPress={() => onNavigate('Viajes')} />
          <MenuRow icon="settings" label={t('profile.settings')} sub={t('profile.settingsSub')} color="#F3E5F5" iconCol="#9C27B0" onPress={() => onNavigate('Configuración')} />
        </View>
      </View>
    </View>
  )
}
