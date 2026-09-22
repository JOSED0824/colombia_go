import { StatusBar } from 'expo-status-bar'
import React, { useMemo, useState, useCallback } from 'react'
import { ScrollView, Text, View, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins'

// Data & Theme
import { destinations, Category, Destination } from './src/data/mockData'
import { COLORS } from './src/theme/colors'
import { styles } from './src/theme/styles'

// Screens
import { HomeScreen } from './src/screens/HomeScreen'
import { ExploreScreen } from './src/screens/ExploreScreen'
import { DetailScreen } from './src/screens/DetailScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { GuidesScreen } from './src/screens/GuidesScreen'
import { FavoritesScreen } from './src/screens/FavoritesScreen'
import { SavedRoutesScreen } from './src/screens/SavedRoutesScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { AuthScreen } from './src/screens/AuthScreen'

type Screen = 'Inicio' | 'Explorar' | 'Guías' | 'Plan' | 'Favoritos' | 'Perfil' | 'Viajes' | 'Eventos' | 'Hoteles' | 'Centros' | 'Configuración' | 'Acceso'

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.CREAM }}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <ColombiaGoApp />
    </SafeAreaProvider>
  )
}

function ColombiaGoApp() {
  const [screen, setScreen] = useState<Screen>('Inicio')
  const [authenticated, setAuthenticated] = useState(false)
  const [category, setCategory] = useState<Category>('Todos')
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [savedRoutes, setSavedRoutes] = useState<string[]>([])
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [profileName, setProfileName] = useState('Camilo Restrepo')
  const [profileBio, setProfileBio] = useState('Explorando Colombia, una historia a la vez.')
  const [selected, setSelected] = useState<Destination | null>(null)

  const filtered = useMemo(() => destinations.filter((destination) => {
    const matchesCategory = category === 'Todos' || destination.category === category
    const text = `${destination.name} ${destination.city} ${destination.tagline}`.toLowerCase()
    return matchesCategory && text.includes(query.toLowerCase())
  }), [category, query])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }, [])

  const toggleRoute = useCallback((id: string) => {
    setSavedRoutes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }, [])

  const logout = () => {
    setSelected(null)
    setScreen('Acceso')
    setAuthenticated(false)
  }

  if (!authenticated) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AuthScreen onAuthenticated={(name: string) => { setProfileName(name); setAuthenticated(true); setScreen('Inicio') }} />
      </View>
    )
  }

  if (selected) {
    return (
      <DetailScreen
        destination={selected}
        favorite={favorites.includes(selected.id)}
        inRoute={savedRoutes.includes(selected.id)}
        onBack={() => setSelected(null)}
        onFavorite={() => toggleFavorite(selected.id)}
        onToggleRoute={() => toggleRoute(selected.id)}
        onSelect={setSelected}
      />
    )
  }

  const renderContent = () => {
    switch (screen) {
      case 'Inicio': return <HomeScreen profileName={profileName} profilePhoto={profilePhoto} onExplore={(q?: string) => { if(q) setQuery(q); setScreen('Explorar'); }} onNavigate={setScreen} onSelect={setSelected} />
      case 'Explorar': return <ExploreScreen category={category} setCategory={setCategory} query={query} setQuery={setQuery} destinations={filtered} favorites={favorites} savedRoutes={savedRoutes} onSelect={setSelected} onFavorite={toggleFavorite} onToggleRoute={toggleRoute} />
      case 'Favoritos': return <FavoritesScreen destinations={destinations.filter((item) => favorites.includes(item.id))} onSelect={setSelected} onFavorite={toggleFavorite} onToggleRoute={toggleRoute} inRoutes={savedRoutes} onNavigate={setScreen} />
      case 'Guías': return <GuidesScreen />
      case 'Perfil': return <ProfileScreen favorites={favorites.length} profileName={profileName} profileBio={profileBio} profilePhoto={profilePhoto} onNavigate={setScreen} />
      case 'Viajes': return <SavedRoutesScreen favorites={savedRoutes} onSelect={setSelected} onNavigate={setScreen} />
      case 'Configuración': return <SettingsScreen profileName={profileName} profileBio={profileBio} profilePhoto={profilePhoto} onLogout={logout} onNavigate={setScreen} onProfileUpdate={(data: any) => { if(data.name) setProfileName(data.name); if(data.bio) setProfileBio(data.bio); if(data.photo) setProfilePhoto(data.photo); }} />
      default: return <HomeScreen profileName={profileName} profilePhoto={profilePhoto} onExplore={() => setScreen('Explorar')} onNavigate={setScreen} onSelect={setSelected} />
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
      <View style={styles.nav}>
        {[
          { id: 'Inicio', icon: 'home', label: 'Inicio' },
          { id: 'Explorar', icon: 'compass', label: 'Explorar' },
          { id: 'Guías', icon: 'map', label: 'Guías' },
          { id: 'Favoritos', icon: 'heart', label: 'Favoritos' },
          { id: 'Perfil', icon: 'person', label: 'Perfil' },
        ].map((item) => (
          <Pressable key={item.id} style={[styles.navItem, screen === item.id && styles.navItemActive]} onPress={() => setScreen(item.id as Screen)}>
            <Ionicons
              name={item.icon as any}
              size={22}
              color={screen === item.id ? COLORS.BLUE : COLORS.TEXT_MUTED}
            />
            <Text style={[styles.navLabel, screen === item.id && styles.navLabelActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  )
}
