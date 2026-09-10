import React from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { guides } from '../data/mockData'

export function GuidesScreen() {
  const featured = guides[0]
  return (
    <View>
      <View style={styles.guidesHeader}>
        <View>
          <Text style={styles.guidesTitle}>Guías Locales</Text>
          <View style={styles.flagLine}>
            <View style={[styles.flagColor, { backgroundColor: COLORS.YELLOW }]} />
            <View style={[styles.flagColor, { backgroundColor: COLORS.BLUE }]} />
            <View style={[styles.flagColor, { backgroundColor: COLORS.RED }]} />
          </View>
        </View>
        <Ionicons name="search-outline" size={24} color={COLORS.BLUE} />
      </View>

      <View style={styles.guideHeroCard}>
        <Image source={featured.image} style={styles.guideHeroImg} />
        <View style={styles.guideHeroContent}>
          <View style={styles.pillExp}>
            <Ionicons name="cafe" size={14} color="#5D4037" />
            <Text style={styles.pillExpText}>Experto en Café</Text>
          </View>
          <Text style={styles.guideHeroName}>{featured.name},</Text>
          <Text style={styles.guideHeroSub}>Experto en Café</Text>
          <View style={styles.guideHeroLoc}>
            <Ionicons name="location" size={16} color="#FFF" />
            <Text style={styles.guideHeroLocText}>{featured.place}</Text>
          </View>
          <View style={styles.ratingRowHero}>
            <Ionicons name="star" size={16} color={COLORS.YELLOW} />
            <Text style={styles.guideHeroRate}> 5.0 (128 reseñas)</Text>
          </View>
          <Pressable style={styles.reserveBtn}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.BLUE} />
            <Text style={styles.reserveBtnText}>Reservar Experiencia</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👒 Otros Guías Auténticos</Text>
        <Pressable><Text style={styles.seeAllText}>Ver todos ›</Text></Pressable>
      </View>

      {guides.slice(1).map((item) => (
        <Pressable key={item.id} style={styles.guideRowCard}>
          <Image source={item.image} style={styles.guideRowImg} />
          <View style={styles.guideRowContent}>
            <Text style={styles.guideRowName}>{item.name}, {item.specialty}</Text>
            <View style={styles.guideRowPill}><Text style={styles.guideRowPillText}>{item.specialty}</Text></View>
            <View style={styles.langRow}>
              {item.tags.map(t => <Text key={t} style={styles.langTag}>{t}</Text>)}
            </View>
            <View style={styles.ratingRowSmall}>
              <Ionicons name="star" size={12} color={COLORS.YELLOW} />
              <Text style={styles.ratingValueSmall}>{item.rating} ({item.reviews} reseñas)</Text>
            </View>
          </View>
          <View style={styles.guidePriceArea}>
            <Text style={styles.guidePriceVal}>{item.price}</Text>
            <Text style={styles.guidePriceSub}>por hora</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.BLUE} />
          </View>
        </Pressable>
      ))}
    </View>
  )
}
