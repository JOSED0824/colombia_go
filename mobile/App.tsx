import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins'

import type { Session } from '@supabase/supabase-js'
import { styles } from './src/theme/styles'
import { supabase } from './src/lib/supabase'
import { apiGet, apiSend } from './src/lib/api'
import { CATEGORIA_SLUG, toDestination } from './src/lib/mappers'
import type { Destination, LugarResumenDto, PagedResult, RutaDto } from './src/lib/types'
import { AuthScreen } from './src/screens/AuthScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { ExploreScreen } from './src/screens/ExploreScreen'
import { GuidesScreen } from './src/screens/GuidesScreen'
import { FavoritesScreen } from './src/screens/FavoritesScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { SavedRoutesScreen } from './src/screens/SavedRoutesScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { DetailScreen } from './src/screens/DetailScreen'
import { BottomNav } from './src/components/BottomNav'

SplashScreen.preventAutoHideAsync().catch(() => {})

const TABS = ['Inicio', 'Explorar', 'Guías', 'Favoritos', 'Perfil'] as const
type Tab = (typeof TABS)[number]
type StackScreen = 'Viajes' | 'Configuración' | 'Detalle' | null

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  })

  // undefined = todavía leyendo la sesión guardada; null = no hay sesión (mostrar login).
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (fontsLoaded && session !== undefined) SplashScreen.hideAsync().catch(() => {})
  }, [fontsLoaded, session])

  const [profileName, setProfileName] = useState('Viajero')

  useEffect(() => {
    const user = session?.user
    if (user) setProfileName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Viajero')
  }, [session?.user?.id])
  const [profileBio, setProfileBio] = useState('Explorando Colombia un lugar a la vez 🇨🇴')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>('Inicio')
  const [stackScreen, setStackScreen] = useState<StackScreen>(null)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [exploreResults, setExploreResults] = useState<Destination[]>([])
  const [exploreLoading, setExploreLoading] = useState(false)
  const [exploreError, setExploreError] = useState(false)

  // Ids para pintar corazones/mapas rápido; listas completas para las pantallas de Favoritos y Rutas.
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteItems, setFavoriteItems] = useState<Destination[]>([])
  const [savedRoutes, setSavedRoutes] = useState<string[]>([])
  const [routeItems, setRouteItems] = useState<Destination[]>([])

  async function loadFavorites() {
    const dtos = await apiGet<LugarResumenDto[]>('/api/v1/favoritos/lugares')
    setFavoriteItems(dtos.map(toDestination))
    setFavorites(dtos.map((d) => d.id))
  }

  function applyRuta(ruta: RutaDto) {
    setRouteItems(ruta.paradas.map(toDestination))
    setSavedRoutes(ruta.paradas.map((p) => p.id))
  }

  // Al iniciar sesión (o cambiar de usuario) se cargan los favoritos y la ruta guardados en la base.
  useEffect(() => {
    if (!session?.user) return
    loadFavorites().catch(() => {})
    apiGet<RutaDto>('/api/v1/rutas/mis-paradas').then(applyRuta).catch(() => {})
  }, [session?.user?.id])

  // Explorar: consulta la API cada vez que cambia la búsqueda o la categoría (con una pequeña espera
  // para no hacer una llamada por cada letra).
  useEffect(() => {
    const params = new URLSearchParams({ pageSize: '50' })
    if (query.trim()) params.set('q', query.trim())
    if (category !== 'Todos' && CATEGORIA_SLUG[category]) params.set('categoria', CATEGORIA_SLUG[category])

    setExploreLoading(true)
    const timer = setTimeout(() => {
      apiGet<PagedResult<LugarResumenDto>>(`/api/v1/lugares?${params.toString()}`)
        .then((page) => {
          setExploreResults(page.items.map(toDestination))
          setExploreError(false)
        })
        .catch(() => setExploreError(true))
        .finally(() => setExploreLoading(false))
    }, 350)
    return () => clearTimeout(timer)
  }, [query, category])

  if (!fontsLoaded || session === undefined) return null

  function navigate(target: string) {
    if ((TABS as readonly string[]).includes(target)) {
      setStackScreen(null)
      setActiveTab(target as Tab)
    } else {
      setStackScreen(target as StackScreen)
    }
  }

  function selectDestination(item: Destination) {
    setSelectedDestination(item)
    setStackScreen('Detalle')
  }

  // Se actualiza el ícono al instante y luego se guarda en la API; si falla, se revierte.
  async function toggleFavorite(id: string) {
    const wasFavorite = favorites.includes(id)
    setFavorites((current) => (wasFavorite ? current.filter((x) => x !== id) : [...current, id]))
    try {
      await apiSend(`/api/v1/favoritos/lugares/${encodeURIComponent(id)}`, wasFavorite ? 'DELETE' : 'POST')
      await loadFavorites()
    } catch {
      setFavorites((current) => (wasFavorite ? [...current, id] : current.filter((x) => x !== id)))
      Alert.alert('Sin conexión', 'No se pudo actualizar tus favoritos. Intenta de nuevo.')
    }
  }

  async function toggleRoute(id: string) {
    const wasInRoute = savedRoutes.includes(id)
    setSavedRoutes((current) => (wasInRoute ? current.filter((x) => x !== id) : [...current, id]))
    try {
      const ruta = await apiSend<RutaDto>(`/api/v1/rutas/mis-paradas/${encodeURIComponent(id)}`, wasInRoute ? 'DELETE' : 'POST')
      applyRuta(ruta)
    } catch {
      setSavedRoutes((current) => (wasInRoute ? [...current, id] : current.filter((x) => x !== id)))
      Alert.alert('Sin conexión', 'No se pudo actualizar tu ruta. Intenta de nuevo.')
    }
  }

  function goExplore(city: string) {
    setQuery(city)
    setStackScreen(null)
    setActiveTab('Explorar')
  }

  if (!session) {
    return (
      <SafeAreaProvider>
        <AuthScreen />
      </SafeAreaProvider>
    )
  }

  let content: React.ReactNode
  let wrapInScroll = true

  if (stackScreen === 'Detalle' && selectedDestination) {
    wrapInScroll = false
    content = (
      <DetailScreen
        destination={selectedDestination}
        favorite={favorites.includes(selectedDestination.id)}
        inRoute={savedRoutes.includes(selectedDestination.id)}
        onBack={() => setStackScreen(null)}
        onFavorite={() => toggleFavorite(selectedDestination.id)}
        onToggleRoute={() => toggleRoute(selectedDestination.id)}
      />
    )
  } else if (stackScreen === 'Configuración') {
    wrapInScroll = false
    content = (
      <SettingsScreen
        profileName={profileName}
        profileBio={profileBio}
        profilePhoto={profilePhoto}
        onLogout={() => {
          supabase.auth.signOut()
          setFavorites([])
          setFavoriteItems([])
          setSavedRoutes([])
          setRouteItems([])
          setActiveTab('Inicio')
          setStackScreen(null)
        }}
        onNavigate={navigate}
        onProfileUpdate={(patch: { name?: string; bio?: string; photo?: string }) => {
          if (patch.name) setProfileName(patch.name)
          if (patch.bio) setProfileBio(patch.bio)
          if (patch.photo) setProfilePhoto(patch.photo)
        }}
      />
    )
  } else if (stackScreen === 'Viajes') {
    wrapInScroll = false
    content = (
      <SavedRoutesScreen
        paradas={routeItems.filter((d) => savedRoutes.includes(d.id))}
        onSelect={selectDestination}
        onNavigate={navigate}
      />
    )
  } else if (activeTab === 'Inicio') {
    content = (
      <HomeScreen
        profileName={profileName}
        profilePhoto={profilePhoto}
        onExplore={goExplore}
        onSelect={selectDestination}
      />
    )
  } else if (activeTab === 'Explorar') {
    content = (
      <ExploreScreen
        category={category}
        setCategory={setCategory}
        query={query}
        setQuery={setQuery}
        destinations={exploreResults}
        loading={exploreLoading}
        error={exploreError}
        favorites={favorites}
        savedRoutes={savedRoutes}
        onSelect={selectDestination}
        onFavorite={toggleFavorite}
        onToggleRoute={toggleRoute}
      />
    )
  } else if (activeTab === 'Guías') {
    content = <GuidesScreen />
  } else if (activeTab === 'Favoritos') {
    content = (
      <FavoritesScreen
        destinations={favoriteItems.filter((d) => favorites.includes(d.id))}
        inRoutes={savedRoutes}
        onSelect={selectDestination}
        onFavorite={toggleFavorite}
        onToggleRoute={toggleRoute}
        onNavigate={navigate}
      />
    )
  } else {
    content = (
      <ProfileScreen
        favorites={favorites}
        profileName={profileName}
        profileBio={profileBio}
        profilePhoto={profilePhoto}
        onNavigate={navigate}
      />
    )
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {wrapInScroll ? (
          <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {content}
            </ScrollView>
          </SafeAreaView>
        ) : (
          content
        )}
        <BottomNav active={activeTab} onChange={navigate} />
      </View>
    </SafeAreaProvider>
  )
}
