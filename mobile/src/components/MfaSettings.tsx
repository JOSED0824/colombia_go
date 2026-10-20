import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { enrollTotp, listFactors, unenroll, verifyEnrollment, type Factor } from '../lib/mfa'

export function MfaSettings() {
  const [loading, setLoading] = useState(true)
  const [factor, setFactor] = useState<Factor | null>(null)
  const [pending, setPending] = useState<{ id: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const factors = await listFactors()
      setFactor(factors.find((f) => f.status === 'verified') ?? null)
    } catch {
      // si falla la consulta, se asume sin MFA activado; el usuario puede reintentar
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function startEnroll() {
    setBusy(true)
    try {
      const data = await enrollTotp()
      setPending({ id: data.id, secret: data.totp.secret })
    } catch (error: any) {
      Alert.alert('No se pudo activar', error?.message ?? 'Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  async function confirmEnroll() {
    if (!pending || code.trim().length !== 6) {
      Alert.alert('Código inválido', 'Ingresa el código de 6 dígitos de tu app de autenticación.')
      return
    }
    setBusy(true)
    try {
      await verifyEnrollment(pending.id, code.trim())
      setPending(null)
      setCode('')
      Alert.alert('Listo', 'La verificación en dos pasos quedó activada.')
      await refresh()
    } catch (error: any) {
      Alert.alert('Código incorrecto', error?.message ?? 'Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    if (!factor) return
    setBusy(true)
    try {
      await unenroll(factor.id)
      await refresh()
    } catch (error: any) {
      Alert.alert('No se pudo desactivar', error?.message ?? 'Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <ActivityIndicator color={COLORS.BLUE} style={{ marginVertical: 15 }} />
  }

  if (factor) {
    return (
      <View style={styles.mfaStatusRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.editNameText}>Verificación en dos pasos</Text>
          <Text style={styles.editSubText}>Activada — pedimos un código extra al iniciar sesión.</Text>
        </View>
        <Pressable onPress={disable} disabled={busy}>
          <Text style={{ color: COLORS.RED, fontFamily: 'Poppins_700Bold' }}>{busy ? '...' : 'Desactivar'}</Text>
        </Pressable>
      </View>
    )
  }

  if (pending) {
    return (
      <View>
        <Text style={styles.editSubText}>
          Agrega esta cuenta en Google Authenticator, Authy u otra app de autenticación (entrada manual), con esta
          clave:
        </Text>
        <Text selectable style={styles.mfaSecret}>
          {pending.secret}
        </Text>
        <TextInput
          style={[styles.editInput, { marginTop: 10 }]}
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="Código de 6 dígitos"
          placeholderTextColor={COLORS.TEXT_MUTED}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Pressable
          style={[styles.emptyBtn, { marginTop: 10, alignSelf: 'stretch', alignItems: 'center' }, busy && { opacity: 0.7 }]}
          onPress={confirmEnroll}
          disabled={busy}
        >
          <Text style={styles.emptyBtnText}>{busy ? 'Verificando...' : 'Confirmar'}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <Pressable onPress={startEnroll} disabled={busy} style={styles.mfaStatusRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.editNameText}>Verificación en dos pasos</Text>
        <Text style={styles.editSubText}>{busy ? 'Generando clave...' : 'Desactivada — tócala para activarla.'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.BLUE} />
    </Pressable>
  )
}
