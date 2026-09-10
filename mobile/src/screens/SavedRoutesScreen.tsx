import React from 'react'
import { View, Text, ScrollView, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { destinations } from '../data/mockData'

export function SavedRoutesScreen({ favorites, onSelect, onNavigate }: any) {
  const saved = destinations.filter((item) => favorites.includes(item.id))

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.guidesHeader}>
        <View>
          <Text style={styles.guidesTitle}>Mis Rutas</Text>
          <View style={styles.flagLine}>
            <View style={[styles.flagColor, { backgroundColor: COLORS.YELLOW }]} />
            <View style={[styles.flagColor, { backgroundColor: COLORS.BLUE }]} />
            <View style={[styles.flagColor, { backgroundColor: COLORS.RED }]} />
          </View>
        </View>
        <Ionicons name="map-outline" size={24} color={COLORS.BLUE} />
      </View>

      {saved.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="navigate-outline" size={60} color={COLORS.GRAY_LIGHT} />
          </View>
          <Text style={styles.emptyTitle}>¡Tu brújula está lista!</Text>
          <Text style={styles.emptyDesc}>Guarda tus lugares favoritos para crear tu ruta personalizada por Colombia.</Text>
          <Pressable style={styles.emptyButton} onPress={() => onNavigate('Explorar')}>
            <Text style={styles.emptyButtonText}>Explorar Lugares</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={styles.routeInfoCard}>
            <Ionicons name="sparkles" size={20} color={COLORS.YELLOW} />
            <Text style={styles.routeInfoText}>Tienes {saved.length} paradas en tu recorrido actual.</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {saved.map((item, index) => (
              <View key={item.id} style={styles.routeItemContainer}>
                {index !== saved.length - 1 && <View style={styles.routeLine} />}
                <View style={styles.routeStepIndicator}>
                  <Text style={styles.routeStepText}>{index + 1}</Text>
                </View>
                <Pressable style={styles.routeCard} onPress={() => onSelect(item)}>
                  <Image source={item.image} style={styles.routeImg} />
                  <View style={styles.routeContent}>
                    <Text style={styles.routeName}>{item.name}</Text>
                    <Text style={styles.routeLoc}>{item.city} · {item.category}</Text>
                    <View style={styles.routeBadges}>
                      <View style={styles.routeBadge}><Text style={styles.routeBadgeText}>8am - 6pm</Text></View>
                      <View style={[styles.routeBadge, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.routeBadgeText, { color: '#2E7D32' }]}>Visitado</Text></View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.BLUE} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
