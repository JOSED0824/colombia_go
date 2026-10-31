import React, { useEffect, useState, useSyncExternalStore } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
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
import { useTranslation } from 'react-i18next'

import type { Session } from '@supabase/supabase-js'
import './src/i18n'
import { getLanguage, hasSavedLanguage, loadSavedLanguage, normalizeLanguage, setLanguage } from './src/i18n'
import { COLORS } from './src/theme/colors'
import { styles } from './src/theme/styles'
import { supabase } from './src/lib/supabase'
import { apiGet, apiSend } from './src/lib/api'
import { authFlow } from './src/lib/authFlow'
import { notify } from './src/lib/notify'
import { toDestination } from './src/lib/mappers'
import type { ConfiguracionDto, Destination, LugarResumenDto, PagedResult, RutaDto } from './src/lib/types'
import { getAssuranceLevel, listFactors } from './src/lib/mfa'
import { AuthScreen } from './src/screens/AuthScreen'
import { MfaChallengeScreen } from './src/screens/MfaChallengeScreen'
import { OnboardingScreen } from './src/screens/OnboardingScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { ExploreScreen } from './src/screens/ExploreScreen'
import { GuidesScreen } from './src/screens/GuidesScreen'
import { FavoritesScreen } from './src/screens/FavoritesScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { SavedRoutesScreen } from './src/screens/SavedRoutesScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { DetailScreen } from './src/screens/DetailScreen'
import { MapScreen } from './src/screens/MapScreen'
import { AiHubScreen } from './src/screens/AiHubScreen'
import { BottomNav } from './src/components/BottomNav'
import { CoachMarks } from './src/components/CoachMarks'

SplashScreen.preventAutoHideAsync().catch(() => {})

const TABS = ['Inicio', 'Explorar', 'Guías', 'IA', 'Favoritos', 'Perfil'] as const
type Tab = (typeof TABS)[number]
type StackScreen = 'Viajes' | 'Configuración' | 'Detalle' | 'Mapa' | null

// loading: leyendo la configuración del servidor · onboarding: bienvenida + tour + intereses ·
// coach: tooltips sobre la barra inferior · done: app normal.
type Phase = 'loading' | 'onboarding' | 'coach' | 'done'

export default function App() {
  const { t, i18n } = useTranslation()
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  })

  // El idioma elegido en una visita anterior se aplica antes de pintar la primera pantalla.
  const [languageReady, setLanguageReady] = useState(false)
  useEffect(() => {
    loadSavedLanguage().finally(() => setLanguageReady(true))
  }, [])

  // undefined = todavía leyendo la sesión guardada; null = no hay sesión (mostrar login).
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  // Mientras la persona cambia su contraseña con el código del correo, Supabase ya le abrió sesión;
  // se mantiene la pantalla de acceso hasta que termine.
  const recovering = useSyncExternalStore(authFlow.subscribe, authFlow.isRecovering)

  // Si el usuario tiene verificación en dos pasos activada, la sesión arranca en aal1 y hay
  // que resolver un challenge de TOTP antes de dejarlo entrar (nextLevel sube a aal2).
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      setMfaFactorId(null)
      return
    }
    getAssuranceLevel()
      .then((aal) => {
        if (aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
          return listFactors().then((factors) => {
            const verified = factors.find((f) => f.status === 'verified')
            setMfaFactorId(verified?.id ?? null)
          })
        }
        setMfaFactorId(null)
      })
      .catch(() => setMfaFactorId(null))
  }, [session?.user?.id])

  useEffect(() => {
    if (fontsLoaded && languageReady && session !== undefined) SplashScreen.hideAsync().catch(() => {})
  }, [fontsLoaded, languageReady, session])

  const [profileName, setProfileName] = useState('Viajero')

  useEffect(() => {
    const user = session?.user
    if (user) setProfileName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Viajero')
  }, [session?.user?.id])
  // null = usar el texto traducido por defecto; si la persona escribe su propia bio, se respeta.
  const [profileBio, setProfileBio] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>('Inicio')
  const [stackScreen, setStackScreen] = useState<StackScreen>(null)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [exploreResults, setExploreResults] = useState<Destination[]>([])
  const [exploreLoading, setExploreLoading] = useState(false)
  const [exploreError, setExploreError] = useState(false)

  // Ids para pintar corazones/mapas rápido; listas completas para las pantallas de Favoritos y Rutas.
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteItems, setFavoriteItems] = useState<Destination[]>([])
  const [savedRoutes, setSavedRoutes] = useState<string[]>([])
  const [routeItems, setRouteItems] = useState<Destination[]>([])

  // Para la pantalla de Mapa genérica: qué puntos mostrar y si se dibujan conectados (ruta IA).
  const [mapPoints, setMapPoints] = useState<Destination[]>([])
  const [mapTitle, setMapTitle] = useState('')
  const [mapDrawRoute, setMapDrawRoute] = useState(false)

  // Onboarding: se decide con la configuración guardada en el servidor (así no se repite al cambiar de teléfono).
  const [phase, setPhase] = useState<Phase>('loading')
  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({})

  function showOnMap(points: Destination[], title: string, drawRoute = false) {
    setMapPoints(points)
    setMapTitle(title)
    setMapDrawRoute(drawRoute)
    setStackScreen('Mapa')
  }

  async function loadFavorites() {
    const dtos = await apiGet<LugarResumenDto[]>('/api/v1/favoritos/lugares')
    setFavoriteItems(dtos.map(toDestination))
    setFavorites(dtos.map((d) => d.id))
  }

  function applyRuta(ruta: RutaDto) {
    setRouteItems(ruta.paradas.map(toDestination))
    setSavedRoutes(ruta.paradas.map((p) => p.id))
  }

  // Idioma y onboarding al iniciar sesión: en un dispositivo nuevo se usa el idioma guardado en la cuenta;
  // si la persona ya eligió uno aquí (p. ej. en la pantalla de acceso), ese manda y se sincroniza a la cuenta.
  useEffect(() => {
    if (!session?.user) {
      setPhase('loading')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const config = await apiGet<ConfiguracionDto>('/api/v1/perfil/configuracion')
        if (cancelled) return
        const serverLanguage = normalizeLanguage(config.language)
        if (!(await hasSavedLanguage())) {
          await setLanguage(serverLanguage)
        } else if (serverLanguage !== getLanguage()) {
          apiSend('/api/v1/perfil/configuracion', 'PUT', {
            notifications: config.notifications,
            location: config.location,
            reduceMotion: config.reduceMotion,
            language: getLanguage(),
          }).catch(() => {})
        }
        if (!cancelled) setPhase(config.onboardingCompleted ? 'done' : 'onboarding')
      } catch {
        // Sin conexión con la API: no se bloquea la app con un tutorial que no se podría marcar como visto.
        if (!cancelled) setPhase('done')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  // Al iniciar sesión (o cambiar de usuario o de idioma) se cargan los favoritos y la ruta guardados en la base.
  useEffect(() => {
    if (!session?.user) return
    loadFavorites().catch(() => {})
    apiGet<RutaDto>('/api/v1/rutas/mis-paradas').then(applyRuta).catch(() => {})
  }, [session?.user?.id, i18n.language])

  // Explorar: consulta la API cada vez que cambia la búsqueda, la categoría o el idioma (con una pequeña
  // espera para no hacer una llamada por cada letra).
  useEffect(() => {
    const params = new URLSearchParams({ pageSize: '50' })
    if (query.trim()) params.set('q', query.trim())
    if (category !== 'all') params.set('categoria', category)

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
  }, [query, category, i18n.language])

  if (!fontsLoaded || !languageReady || session === undefined) return null

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
      notify(t('common.offlineTitle'), t('favorites.updateFailed'))
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
      notify(t('common.offlineTitle'), t('routes.updateFailed'))
    }
  }

  // "Guardar paradas en mis rutas" de la guía de viaje: agrega las que aún no están y deja la ruta al día.
  async function saveStops(ids: string[]): Promise<boolean> {
    try {
      let latest: RutaDto | null = null
      for (const id of ids) {
        if (savedRoutes.includes(id)) continue
        latest = await apiSend<RutaDto>(`/api/v1/rutas/mis-paradas/${encodeURIComponent(id)}`, 'POST')
      }
      if (latest) applyRuta(latest)
      notify(t('guide.stopsSaved'))
      return true
    } catch {
      notify(t('common.offlineTitle'), t('routes.updateFailed'))
      return false
    }
  }

  function goExplore(city: string) {
    setQuery(city)
    setStackScreen(null)
    setActiveTab('Explorar')
  }

  function finishOnboarding() {
    setPhase('done')
    setStackScreen(null)
    setActiveTab('Inicio')
    apiSend('/api/v1/perfil/onboarding/completar', 'POST').catch(() => {})
  }

  if (!session || recovering) {
    return (
      <SafeAreaProvider>
        <AuthScreen />
      </SafeAreaProvider>
    )
  }

  if (mfaFactorId) {
    return (
      <SafeAreaProvider>
        <MfaChallengeScreen factorId={mfaFactorId} onVerified={() => setMfaFactorId(null)} />
      </SafeAreaProvider>
    )
  }

  if (phase === 'loading') {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.CREAM }}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
        </View>
      </SafeAreaProvider>
    )
  }

  if (phase === 'onboarding') {
    return (
      <SafeAreaProvider>
        <OnboardingScreen
          onFinish={(skipped) => {
            if (skipped) {
              finishOnboarding()
            } else {
              setStackScreen(null)
              setActiveTab('Inicio')
              setPhase('coach')
            }
          }}
        />
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
        onShowTutorial={() => {
          setStackScreen(null)
          setPhase('onboarding')
        }}
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
        onViewMap={() => showOnMap(routeItems.filter((d) => savedRoutes.includes(d.id)), t('map.routes'))}
      />
    )
  } else if (stackScreen === 'Mapa') {
    wrapInScroll = false
    content = <MapScreen title={mapTitle || t('map.title')} points={mapPoints} drawRoute={mapDrawRoute} onBack={() => setStackScreen(null)} />
  } else if (activeTab === 'IA') {
    content = (
      <AiHubScreen
        candidatos={favoriteItems.filter((d) => favorites.includes(d.id))}
        onViewOnMap={(points, title, drawRoute) => showOnMap(points, title, drawRoute ?? true)}
        onSaveStops={saveStops}
        onSelect={selectDestination}
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
        onViewMap={() => showOnMap(favoriteItems.filter((d) => favorites.includes(d.id)), t('map.favorites'))}
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
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {content}
            </ScrollView>
          </SafeAreaView>
        ) : (
          content
        )}
        <BottomNav
          active={activeTab}
          onChange={navigate}
          onTabLayout={(tab, layout) => setTabLayouts((current) => ({ ...current, [tab]: layout }))}
        />
        {phase === 'coach' && (
          <CoachMarks tabLayouts={tabLayouts} onStep={(tab) => navigate(tab)} onFinish={finishOnboarding} />
        )}
      </View>
    </SafeAreaProvider>
  )
}
