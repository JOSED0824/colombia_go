import React, { useEffect, useState, useSyncExternalStore, useRef } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
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
import { COLORS, applyTheme, loadSavedTheme, saveTheme, type ThemeMode } from './src/theme/colors'
import { styles } from './src/theme/styles'
import { supabase } from './src/lib/supabase'
import { apiGet, apiSend, pingApi, prefetch, API_BASE } from './src/lib/api'
import { authFlow } from './src/lib/authFlow'
import { notify } from './src/lib/notify'
import { toDestination } from './src/lib/mappers'
import type { ConfiguracionDto, Destination, LugarResumenDto, MiLugarDto, PagedResult, PerfilDto, Role, RutaDto } from './src/lib/types'
import { ALL_TAB_IDS, tabsForRole } from './src/lib/roleNav'
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
import { KeyboardScroll } from './src/components/KeyboardScroll'
import { GuideDetailScreen } from './src/screens/GuideDetailScreen'
import { NotificationsScreen } from './src/screens/NotificationsScreen'
import { GuidePanelScreen } from './src/screens/GuidePanelScreen'
import { BusinessDashboard, BusinessForm } from './src/screens/BusinessScreen'
import { GuideHomeScreen } from './src/screens/GuideHomeScreen'
import { TabScene, PushScene, ReturnScene } from './src/components/Transitions'
import { AchievementBubble } from './src/components/AchievementBubble'
import { useAchievementWatcher } from './src/lib/achievements'
import { AdminScreen } from './src/screens/AdminScreen'
import type { Guia } from './src/lib/guides'

SplashScreen.preventAutoHideAsync().catch(() => {})

// Las pestañas dependen del tipo de cuenta (turista, guía, negocio, admin): ver src/lib/roleNav.ts.
type Tab = string
type StackScreen = 'Viajes' | 'Configuración' | 'Detalle' | 'Mapa' | 'Guía' | 'Notificaciones' | 'PanelGuia' | 'NegocioEditar' | null

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

  // Tema claro/oscuro: el guardado en el dispositivo o, la primera vez, el del sistema.
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [themeReady, setThemeReady] = useState(false)
  useEffect(() => {
    loadSavedTheme()
      .then(setThemeMode)
      .finally(() => setThemeReady(true))
  }, [])

  function toggleTheme() {
    const next: ThemeMode = themeMode === 'dark' ? 'light' : 'dark'
    applyTheme(next) // reconstruye los estilos con la paleta nueva...
    setThemeMode(next) // ...y vuelve a pintar la app
    saveTheme(next)
  }

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
    if (fontsLoaded && languageReady && themeReady && session !== undefined) SplashScreen.hideAsync().catch(() => {})
  }, [fontsLoaded, languageReady, themeReady, session])

  const [profileName, setProfileName] = useState('Viajero')

  useEffect(() => {
    const user = session?.user
    if (user) {
      setProfileName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Viajero')
      setProfileBio(user.user_metadata?.bio || null)
    }
  }, [session?.user?.id])
  // null = usar el texto traducido por defecto; si la persona escribe su propia bio, se respeta.
  const [profileBio, setProfileBio] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  // Tipo de cuenta. Mientras llega el perfil se usa el que eligió al registrarse (user_metadata.tipo_cuenta); el perfil
  // de la API es el que manda (incluye "admin", que no se elige desde la app).
  const [role, setRole] = useState<Role>('turista')
  useEffect(() => {
    const meta = session?.user?.user_metadata?.tipo_cuenta
    setRole(meta === 'guia' || meta === 'negocio' ? meta : 'turista')
  }, [session?.user?.id])
  const tabs = tabsForRole(role)

  // Insignias recién ganadas: se celebran con una burbuja que lleva a las notificaciones.
  const achievement = useAchievementWatcher(session?.user?.id)

  // Paneles de guía y negocio: cambian estos números para que vuelvan a pedir sus datos tras guardar.
  const [guideRefresh, setGuideRefresh] = useState(0)
  const [businessRefresh, setBusinessRefresh] = useState(0)
  const [selectedPlace, setSelectedPlace] = useState<MiLugarDto | null>(null)

  const [activeTab, setActiveTab] = useState<Tab>('Inicio')
  const previousTab = useRef(activeTab)
  const tabDirection = useRef(0)
  const [stackScreen, setStackScreen] = useState<StackScreen>(null)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [detailFrom, setDetailFrom] = useState<StackScreen>(null)
  const [selectedGuide, setSelectedGuide] = useState<Guia | null>(null)

  // Las pestañas que ya se abrieron siguen montadas (ocultas) cuando se cambia de pestaña. Así al volver no se
  // vuelve a construir la pantalla ni a cargar: conserva sus datos, el texto escrito y la posición del scroll.
  const [visited, setVisited] = useState<Set<Tab>>(() => new Set<Tab>(['Inicio']))
  useEffect(() => {
    setVisited((v) => (v.has(activeTab) ? v : new Set(v).add(activeTab)))
  }, [activeTab])

  // Al conocer el tipo de cuenta, la app abre en la primera pestaña de ese rol (p. ej. "Mi negocio").
  useEffect(() => {
    if (tabs.some((tab) => tab.id === activeTab)) return
    setActiveTab(tabs[0].id)
    setVisited(new Set([tabs[0].id]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

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

  // Calentamiento: ya con la app lista, se van montando (ocultas) las pestañas que faltan, de a una cada 400 ms. Así cada una
  // carga sus datos en segundo plano y cuando la persona la abre por primera vez ya está lista, sin spinner de "cargando".
  useEffect(() => {
    if (phase !== 'done' || !session?.user) return
    const timers = tabs.map(({ id }, i) =>
      setTimeout(() => setVisited((v) => (v.has(id) ? v : new Set(v).add(id))), 900 + i * 400),
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session?.user?.id, role])

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
        const [config, perfil] = await Promise.all([
          apiGet<ConfiguracionDto>('/api/v1/perfil/configuracion'),
          apiGet<PerfilDto>('/api/v1/perfil').catch(() => null),
        ])
        if (cancelled) return
        if (perfil?.role) setRole(perfil.role)
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
        // El recorrido de bienvenida (intereses, pestañas de turista) es solo para turistas.
        const isTourist = !perfil?.role || perfil.role === 'turista'
        if (!cancelled) setPhase(config.onboardingCompleted || !isTourist ? 'done' : 'onboarding')
      } catch {
        // Sin conexión con la API: no se bloquea la app con un tutorial que no se podría marcar como visto.
        if (!cancelled) setPhase('done')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  // Si el backend no responde (apagado, otra red, firewall) la app se vería vacía sin explicación: se avisa una vez al entrar.
  useEffect(() => {
    if (!session?.user) return
    pingApi().then((ok) => {
      if (!ok) notify(t('common.offlineTitle'), t('common.apiUnreachable', { url: API_BASE }))
    })
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
          prefetch(page.items.slice(0, 6).map((l) => `/api/v1/lugares/${encodeURIComponent(l.id)}/contenido`))
          setExploreError(false)
        })
        .catch(() => setExploreError(true))
        .finally(() => setExploreLoading(false))
    }, 350)
    return () => clearTimeout(timer)
  }, [query, category, i18n.language])

  if (!fontsLoaded || !languageReady || !themeReady || session === undefined) return null

  if (previousTab.current !== activeTab) {
    const from = tabs.findIndex((tab) => tab.id === previousTab.current)
    const to = tabs.findIndex((tab) => tab.id === activeTab)
    tabDirection.current = from < 0 || to < 0 ? 0 : Math.sign(to - from)
    previousTab.current = activeTab
  }

  function navigate(target: string) {
    if (ALL_TAB_IDS.has(target)) {
      setStackScreen(null)
      setActiveTab(target as Tab)
    } else {
      setStackScreen(target as StackScreen)
    }
  }

  // Si el detalle se abrió desde el mapa, "atrás" vuelve al mapa (con sus puntos) en vez de ir al inicio.
  function selectDestination(item: Destination) {
    // Si el detalle se abrió desde otra pantalla (mapa, "Mis rutas", notificaciones…), "atrás" vuelve a esa pantalla.
    setDetailFrom(stackScreen && stackScreen !== 'Detalle' ? stackScreen : null)
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

  // Los botones de categoría del inicio abren Explorar ya filtrado por esa categoría.
  function goCategory(id: string) {
    setCategory(id)
    setQuery('')
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
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        <AuthScreen />
      </SafeAreaProvider>
    )
  }

  if (mfaFactorId) {
    return (
      <SafeAreaProvider>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        <MfaChallengeScreen factorId={mfaFactorId} onVerified={() => setMfaFactorId(null)} />
      </SafeAreaProvider>
    )
  }

  if (phase === 'loading') {
    return (
      <SafeAreaProvider>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.CREAM }}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
        </View>
      </SafeAreaProvider>
    )
  }

  if (phase === 'onboarding') {
    return (
      <SafeAreaProvider>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
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

  let content: React.ReactNode = null
  // Pantallas "de pila" sin scroll propio (Configuración, Mis rutas): respetan la zona segura y el margen lateral.
  let padStack = false

  if (stackScreen === 'Detalle' && selectedDestination) {
    content = (
      <DetailScreen
        destination={selectedDestination}
        favorite={favorites.includes(selectedDestination.id)}
        inRoute={savedRoutes.includes(selectedDestination.id)}
        onBack={() => setStackScreen(detailFrom)}
        onFavorite={() => toggleFavorite(selectedDestination.id)}
        onToggleRoute={() => toggleRoute(selectedDestination.id)}
      />
    )
  } else if (stackScreen === 'Guía' && selectedGuide) {
    content = <GuideDetailScreen guide={selectedGuide} onBack={() => setStackScreen(null)} />
  } else if (stackScreen === 'Configuración') {
    padStack = true
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
        darkMode={themeMode === 'dark'}
        onToggleDark={toggleTheme}
        onShowTutorial={() => {
          setStackScreen(null)
          setPhase('onboarding')
        }}
        onProfileUpdate={(patch: { name?: string; bio?: string; photo?: string }) => {
          if (patch.name) setProfileName(patch.name)
          if (patch.bio !== undefined) setProfileBio(patch.bio || null)
          if (patch.photo) setProfilePhoto(patch.photo)
          // El nombre y la biografía se guardan en la cuenta (Supabase) para que sigan ahí al cerrar la app.
          if (patch.name || patch.bio !== undefined) {
            supabase.auth.updateUser({ data: { ...(patch.name ? { full_name: patch.name } : {}), ...(patch.bio !== undefined ? { bio: patch.bio } : {}) } }).catch(() => {})
          }
        }}
      />
    )
  } else if (stackScreen === 'Viajes') {
    padStack = true
    content = (
      <SavedRoutesScreen
        paradas={routeItems.filter((d) => savedRoutes.includes(d.id))}
        onSelect={selectDestination}
        onNavigate={navigate}
        onViewMap={() => showOnMap(routeItems.filter((d) => savedRoutes.includes(d.id)), t('map.routes'))}
      />
    )
  } else if (stackScreen === 'Mapa') {
    content = (
      <MapScreen
        title={mapTitle || t('map.title')}
        points={mapPoints}
        drawRoute={mapDrawRoute}
        onBack={() => setStackScreen(null)}
        onSelect={selectDestination}
      />
    )
  } else if (stackScreen === 'Notificaciones') {
    padStack = true
    content = <NotificationsScreen onBack={() => setStackScreen(null)} onNavigate={navigate} />
  } else if (stackScreen === 'PanelGuia') {
    padStack = true
    content = (
      <GuidePanelScreen
        onBack={() => setStackScreen(null)}
        onSaved={() => setGuideRefresh((n) => n + 1)}
      />
    )
  } else if (stackScreen === 'NegocioEditar' && selectedPlace) {
    padStack = true
    content = (
      <BusinessForm
        place={selectedPlace}
        onBack={() => setStackScreen(null)}
        onSaved={() => {
          setBusinessRefresh((n) => n + 1)
          setStackScreen(null)
        }}
      />
    )
  }

  function renderTab(tab: Tab): React.ReactNode {
    switch (tab) {
      case 'MiGuia':
        return <GuideHomeScreen name={profileName} refreshKey={guideRefresh} onEdit={() => setStackScreen('PanelGuia')} />
      case 'MiNegocio':
        return (
          <BusinessDashboard
            name={profileName}
            refreshKey={businessRefresh}
            onNew={() => navigate('Publicar')}
            onEdit={(place) => {
              setSelectedPlace(place)
              setStackScreen('NegocioEditar')
            }}
          />
        )
      case 'Publicar':
        return (
          <BusinessForm
            key={businessRefresh}
            place={null}
            onSaved={() => {
              setBusinessRefresh((n) => n + 1) // recarga "Mi negocio" y deja este formulario vacío
              navigate('MiNegocio')
            }}
          />
        )
      case 'Moderar':
        return <AdminScreen />
      case 'IA':
        return (
          <AiHubScreen
            candidatos={favoriteItems.filter((d) => favorites.includes(d.id))}
            onViewOnMap={(points, title, drawRoute) => showOnMap(points, title, drawRoute ?? true)}
            onSaveStops={saveStops}
            onSelect={selectDestination}
          />
        )
      case 'Inicio':
        return (
          <HomeScreen
            profileName={profileName}
            profilePhoto={profilePhoto}
            onExplore={goExplore}
            onCategory={goCategory}
            onNotifications={() => setStackScreen('Notificaciones')}
            onSelect={selectDestination}
            onOpenGuide={(guide: Guia) => {
              setSelectedGuide(guide)
              setStackScreen('Guía')
            }}
            onOpenAi={() => navigate('IA')}
          />
        )
      case 'Explorar':
        return (
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
            onViewMap={() => showOnMap(exploreResults, category === 'all' ? t('explore.title') : t(`categories.${category}`))}
          />
        )
      case 'Guías':
        return (
          <GuidesScreen
            onSelect={(guide) => {
              setSelectedGuide(guide)
              setStackScreen('Guía')
            }}
          />
        )
      case 'Favoritos':
        return (
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
      default:
        return (
          <ProfileScreen
            favorites={favorites}
            routesCount={savedRoutes.length}
            profileName={profileName}
            profileBio={profileBio}
            profilePhoto={profilePhoto}
            onNavigate={navigate}
          />
        )
    }
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.CREAM }}>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        {content !== null && (
          <PushScene key={String(stackScreen)}>
            {padStack ? (
              <SafeAreaView style={styles.safe} edges={['top']}>
                <View style={{ flex: 1, paddingHorizontal: 20 }}>{content}</View>
              </SafeAreaView>
            ) : (
              content
            )}
          </PushScene>
        )}
        <ReturnScene visible={content === null}>
          {tabs.map(({ id }) => id).filter((tab) => visited.has(tab) || tab === activeTab).map((tab) => (
            <TabScene key={tab} active={tab === activeTab} direction={tabDirection.current}>
              <SafeAreaView style={styles.safe} edges={['top']}>
                <KeyboardScroll contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                  {renderTab(tab)}
                </KeyboardScroll>
              </SafeAreaView>
            </TabScene>
          ))}
        </ReturnScene>
        <BottomNav
          tabs={tabs}
          active={activeTab}
          onChange={navigate}
          onTabLayout={(tab, layout) => setTabLayouts((current) => ({ ...current, [tab]: layout }))}
        />
        {achievement.current && (
          <AchievementBubble
            key={achievement.current.id}
            logro={achievement.current}
            onDismiss={achievement.dismiss}
            onOpen={() => setStackScreen('Notificaciones')}
          />
        )}
        {phase === 'coach' && (
          <CoachMarks tabLayouts={tabLayouts} onStep={(tab) => navigate(tab)} onFinish={finishOnboarding} />
        )}
      </View>
    </SafeAreaProvider>
  )
}
