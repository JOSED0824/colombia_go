import React from 'react'
import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { AchievementCard } from '../components/AchievementCard'
import { MenuRow } from '../components/MenuRow'

export function ProfileScreen({ favorites, profileName, profileBio, profilePhoto, onNavigate }: any) {
  return (
    <View>
      <View style={styles.profileHero}>
        <Image source={require('../../assets/normalized/fondo.jpg')} style={styles.profileArt} />
        <View style={styles.profileHeaderContent}>
          <Text style={styles.profileHeaderTitle}>Mi Perfil</Text>
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
        <Text style={styles.profileBio} numberOfLines={2}>{profileBio}</Text>
        <Text style={styles.profileLevel}><Ionicons name="ribbon-outline" size={16} color="#6B4CFF" /> Viajero Nivel 5</Text>

        <View style={styles.statsPanel}>
          <View style={styles.statBox}><Text style={styles.statVal}>15</Text><View style={styles.statLabelRow}><Ionicons name="location" size={12} color="#10B981" /><Text style={styles.statLabelText}>Lugares</Text></View></View>
          <View style={styles.dividerV} />
          <View style={styles.statBox}><Text style={styles.statVal}>8</Text><View style={styles.statLabelRow}><Ionicons name="book" size={12} color="#3B82F6" /><Text style={styles.statLabelText}>Guías</Text></View></View>
          <View style={styles.dividerV} />
          <View style={styles.statBox}><Text style={styles.statVal}>12</Text><View style={styles.statLabelRow}><Ionicons name="star" size={12} color="#F59E0B" /><Text style={styles.statLabelText}>Reseñas</Text></View></View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis Logros</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievements}>
          <AchievementCard icon="landscape-outline" title="Cazador de Miradores" desc="Descubriste 10+ miradores increíbles" color="#E8F5E9" iconCol="#4CAF50" />
          <AchievementCard icon="restaurant-outline" title="Experto en Arepas" desc="Probaste 10 tipos de arepas" color="#FFF9E1" iconCol="#FBC02D" />
          <AchievementCard icon="bus-outline" title="Amigo del Metrocable" desc="Usaste 5 líneas del Metrocable" color="#E3F2FD" iconCol="#2196F3" />
        </ScrollView>

        <View style={styles.profileMenu}>
          <MenuRow icon="heart" label="Mis Favoritos" sub="Lugares y experiencias que amar" color="#FFEBEE" iconCol="#E63946" onPress={() => onNavigate('Favoritos')} />
          <MenuRow icon="map" label="Rutas Guardadas" sub="Tus rutas y recorridos personalizados" color="#E3F2FD" iconCol="#2196F3" onPress={() => onNavigate('Viajes')} />
          <MenuRow icon="settings" label="Configuración" sub="Cuenta, notificaciones y más" color="#F3E5F5" iconCol="#9C27B0" onPress={() => onNavigate('Configuración')} />
        </View>
      </View>
    </View>
  )
}
