import React, { useEffect, useState } from 'react'
import { View, Text, Image, Pressable, TextInput, ScrollView, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { apiGet } from '../lib/api'
import { toDestination } from '../lib/mappers'
import type { Destination, LugarResumenDto, PagedResult } from '../lib/types'

const { width } = Dimensions.get('window')

export function HomeScreen({ profileName, profilePhoto, onExplore, onSelect }: any) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [featured, setFeatured] = useState<Destination[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    apiGet<LugarResumenDto[]>('/api/v1/lugares/destacados?take=3')
      .then((dtos) => setFeatured(dtos.map(toDestination)))
      .catch(() => setError(true))

    apiGet<PagedResult<LugarResumenDto>>(`/api/v1/lugares?ciudad=${encodeURIComponent('Medellín')}&pageSize=6`)
      .then((page) => setDestinations(page.items.map(toDestination)))
      .catch(() => setError(true))
  }, [])

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / (width - 40))
    setActiveSlide(slide)
  }

  return (
    <View>
      <View style={styles.homeHeader}>
        <View style={styles.userSection}>
          <Image source={profilePhoto ? { uri: profilePhoto } : require('../../assets/normalized/Camilo.jpg')} style={styles.avatarHeader} />
          <Text style={styles.greetingText}>¡Hola, {profileName.split(' ')[0]}! 🇨🇴</Text>
        </View>
        <Pressable style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.BLUE} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.TEXT_MUTED} />
        <TextInput placeholder="¿Qué quieres descubrir hoy?" placeholderTextColor={COLORS.TEXT_MUTED} style={styles.searchInput} />
      </View>

      <View style={styles.heroContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {featured.map((item) => (
            <View key={item.id} style={styles.heroCard}>
              <Image source={item.image} style={styles.heroImage} />
              <View style={styles.heroOverlay}>
                <View style={styles.heroPanel}>
                  <View style={styles.heroCityRow}>
                    <Text style={styles.heroCity}>{item.city.toUpperCase()}</Text>
                    <Ionicons name="location" size={10} color={COLORS.YELLOW} style={{ marginLeft: 5 }} />
                  </View>
                  <Text style={styles.heroTitle}>{item.name}</Text>
                  <Text style={styles.heroSubtitle}>{item.tagline}</Text>
                  <Pressable style={styles.heroButton} onPress={() => onSelect(item)}>
                    <Text style={styles.heroButtonText}>Descubrir {item.name}</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.BLUE} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.heroDots}>
          {featured.map((_, i) => (
            <View key={i} style={[styles.dot, activeSlide === i && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.catRow}>
        {[
          { id: 'Gastronomía', icon: 'restaurant', color: '#FFD100' },
          { id: 'Cultura', icon: 'home', color: '#003B7D' },
          { id: 'Naturaleza', icon: 'leaf', color: '#4CAF50' },
          { id: 'Vida Nocturna', icon: 'musical-notes', color: '#E63946' },
        ].map((item) => (
          <View key={item.id} style={styles.catItem}>
            <View style={[styles.catIcon, { backgroundColor: item.color === '#003B7D' ? COLORS.BLUE : item.color }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color === '#FFD100' ? COLORS.BLUE : '#FFF'} />
            </View>
            <Text style={styles.catLabel}>{item.id}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Imperdibles de Medellín</Text>
        <Pressable onPress={() => onExplore('Medellín')}><Text style={styles.seeAllText}>Ver todos ›</Text></Pressable>
      </View>

      {error && destinations.length === 0 && (
        <Text style={{ color: COLORS.TEXT_MUTED, marginBottom: 12 }}>
          No pudimos conectar con el servidor. Revisa que la API esté encendida.
        </Text>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizList}>
        {destinations.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => onSelect(item)}>
            <Image source={item.image} style={styles.cardImage} />
            <View style={styles.cardRating}>
              <Ionicons name="star" size={12} color={COLORS.YELLOW} />
              <Text style={styles.ratingValue}>{item.rating}</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardTag}><Text style={styles.cardTagText}>{item.category}</Text></View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardTagline}>{item.tagline}</Text>
              <View style={styles.cardLocation}>
                <Ionicons name="location" size={12} color={COLORS.BLUE} />
                <Text style={styles.cardLocationText}>{item.city}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
