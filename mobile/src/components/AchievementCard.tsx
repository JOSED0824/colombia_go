import React from 'react'
import { View, Image } from 'react-native'
import { Text } from './AppText'
import { Ionicons } from '@expo/vector-icons'
import { styles } from '../theme/styles'

// `badge` (imagen de la insignia) > `emoji` (los logros de la API pueden traer un emoji) > `icon` (Ionicons).
// Bloqueado: la insignia se ve apagada con un candado, para que se note qué falta por ganar.
export function AchievementCard({ badge, icon, emoji, title, desc, color, iconCol, locked }: any) {
  return (
    <View style={[styles.achieveCard, { backgroundColor: color }]}>
      <View style={styles.badgeBox}>
        {badge ? (
          <Image source={badge} style={[styles.badgeImg, locked && { opacity: 0.4 }]} resizeMode="contain" />
        ) : (
          <View style={[styles.hexagon, { marginBottom: 0 }, locked && { opacity: 0.4 }]}>
            {emoji ? <Text style={{ fontSize: 30 }}>{emoji}</Text> : <Ionicons name={icon} size={32} color={iconCol} />}
          </View>
        )}
        {locked && (
          <View style={styles.badgeLock}>
            <Ionicons name="lock-closed" size={12} color="#FFF" />
          </View>
        )}
      </View>
      <Text style={[styles.achieveTitle, locked && { opacity: 0.55 }]}>{title}</Text>
      <Text style={[styles.achieveDesc, locked && { opacity: 0.7 }]}>{desc}</Text>
    </View>
  )
}
