import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { apiGet, apiSend } from '../lib/api'
import { toDestination } from '../lib/mappers'
import type { Destination, GenerarRutaIaRequest, LugarResumenDto, RutaIaDto } from '../lib/types'

type Props = {
  candidatos: Destination[]
  onViewOnMap: (points: Destination[], title: string) => void
}

type Modo = 'favoritos' | 'recomendado'

export function AiRoutePlannerScreen({ candidatos, onViewOnMap }: Props) {
  const [modo, setModo] = useState<Modo>(candidatos.length > 0 ? 'favoritos' : 'recomendado')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [pool, setPool] = useState<Destination[]>([])
  const [poolLoading, setPoolLoading] = useState(false)
  const [presupuesto, setPresupuesto] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<RutaIaDto | null>(null)

  // Modo "recomendado": no hay favoritos (o el usuario los quiere ignorar), así que se trae un
  // grupo amplio de lugares destacados y se le deja a la IA elegir cuáles entran en la ruta.
  useEffect(() => {
    if (modo !== 'recomendado' || pool.length > 0) return
    setPoolLoading(true)
    apiGet<LugarResumenDto[]>('/api/v1/lugares/destacados?take=20')
      .then((dtos) => setPool(dtos.map(toDestination)))
      .catch(() => setPool([]))
      .finally(() => setPoolLoading(false))
  }, [modo])

  function toggle(id: string) {
    setSeleccionados((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]))
  }

  async function generar() {
    const monto = Number(presupuesto.replace(/[^0-9]/g, ''))
    if (!monto || monto <= 0) {
      Alert.alert('Presupuesto inválido', 'Escribe el presupuesto en pesos, por ejemplo 150000.')
      return
    }

    const slugs = modo === 'favoritos' ? seleccionados : pool.map((d) => d.id)
    if (slugs.length === 0) {
      Alert.alert(
        modo === 'favoritos' ? 'Elige al menos un lugar' : 'Sin lugares disponibles',
        modo === 'favoritos'
          ? 'Selecciona los lugares que quieres considerar para la ruta.'
          : 'No pudimos traer lugares para recomendar. Intenta de nuevo.',
      )
      return
    }

    setLoading(true)
    setResultado(null)
    try {
      const body: GenerarRutaIaRequest = { lugarSlugs: slugs, presupuesto: monto }
      const data = await apiSend<RutaIaDto>('/api/v1/rutas/generar-ia', 'POST', body)
      setResultado(data)
    } catch (error: any) {
      Alert.alert('No se pudo generar la ruta', error?.message ?? 'Intenta de nuevo en un momento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View>
      <Text style={styles.pageTitle}>Planificador con IA</Text>

      <View>
        <Text style={styles.settingsSectionLabel}>Tu presupuesto (COP)</Text>
        <View style={styles.authInputWrapper}>
          <Ionicons name="cash-outline" size={20} color={COLORS.BLUE} />
          <TextInput
            style={styles.authTextInput}
            value={presupuesto}
            onChangeText={(text) => setPresupuesto(text.replace(/[^0-9]/g, ''))}
            placeholder="Ej: 150000"
            placeholderTextColor={COLORS.TEXT_MUTED}
            keyboardType="number-pad"
          />
        </View>

        <Text style={styles.settingsSectionLabel}>¿Quién elige los lugares?</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
          <Pressable
            style={[
              styles.filterChip,
              modo === 'favoritos' && styles.filterChipActive,
              candidatos.length === 0 && { opacity: 0.4 },
            ]}
            disabled={candidatos.length === 0}
            onPress={() => setModo('favoritos')}
          >
            <Text style={[styles.filterText, modo === 'favoritos' && styles.filterTextActive]}>Yo elijo</Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, modo === 'recomendado' && styles.filterChipActive]}
            onPress={() => setModo('recomendado')}
          >
            <Text style={[styles.filterText, modo === 'recomendado' && styles.filterTextActive]}>
              Que la IA me recomiende
            </Text>
          </Pressable>
        </View>

        {modo === 'favoritos' ? (
          candidatos.length === 0 ? (
            <Text style={styles.editSubText}>
              Todavía no tienes favoritos guardados. Marca algunos lugares con ♥ en Explorar, o usa "Que la IA me
              recomiende".
            </Text>
          ) : (
            <View style={styles.settingsCard}>
              {candidatos.map((lugar, index) => {
                const activo = seleccionados.includes(lugar.id)
                return (
                  <View key={lugar.id}>
                    {index > 0 && <View style={styles.settingsDivider} />}
                    <Pressable style={styles.mfaStatusRow} onPress={() => toggle(lugar.id)}>
                      <Ionicons
                        name={activo ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={activo ? COLORS.BLUE : COLORS.TEXT_MUTED}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.editNameText}>{lugar.name}</Text>
                        <Text style={styles.editSubText}>{lugar.city}</Text>
                      </View>
                    </Pressable>
                  </View>
                )
              })}
            </View>
          )
        ) : poolLoading ? (
          <ActivityIndicator color={COLORS.BLUE} style={{ marginVertical: 15 }} />
        ) : (
          <Text style={styles.editSubText}>
            La IA elegirá la mejor combinación entre {pool.length} lugares destacados de toda Colombia según tu
            presupuesto.
          </Text>
        )}

        <Pressable style={[styles.authSubmit, { marginTop: 25 }, loading && { opacity: 0.7 }]} onPress={generar} disabled={loading}>
          <Text style={styles.authSubmitText}>Generar ruta con IA</Text>
          {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="sparkles" size={18} color="#FFF" />}
        </Pressable>

        {resultado && (
          <View style={{ marginTop: 25 }}>
            <Text style={styles.settingsSectionLabel}>Ruta sugerida</Text>
            <View style={styles.settingsCard}>
              <Text style={styles.editSubText}>{resultado.explicacion}</Text>
              <Text style={[styles.mfaSecret, { marginTop: 12 }]}>
                Costo estimado: ${resultado.costoEstimado.toLocaleString('es-CO')}
              </Text>

              {resultado.paradas.map((parada, index) => (
                <View key={parada.id} style={[styles.mfaStatusRow, { paddingVertical: 8 }]}>
                  <View style={styles.routeStepIndicator}>
                    <Text style={styles.routeStepText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.editNameText}>{parada.name}</Text>
                    <Text style={styles.editSubText}>{parada.city}</Text>
                  </View>
                </View>
              ))}

              <Pressable
                style={[styles.emptyBtn, { marginTop: 10, alignSelf: 'stretch', alignItems: 'center' }]}
                onPress={() => onViewOnMap(resultado.paradas.map(toDestination), 'Ruta sugerida')}
              >
                <Text style={styles.emptyBtnText}>Ver ruta en el mapa</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
