import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { challenge, verifyChallenge } from '../lib/mfa'
import { supabase } from '../lib/supabase'

type Props = {
  factorId: string
  onVerified: () => void
}

export function MfaChallengeScreen({ factorId, onVerified }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (code.trim().length !== 6) {
      Alert.alert('Código inválido', 'Ingresa el código de 6 dígitos de tu app de autenticación.')
      return
    }
    setLoading(true)
    try {
      const challengeId = await challenge(factorId)
      await verifyChallenge(factorId, challengeId, code.trim())
      onVerified()
    } catch (error: any) {
      Alert.alert('Código incorrecto', error?.message ?? 'El código no es correcto o ya venció. Intenta de nuevo.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.authMain}>
      <View style={styles.authGlow1} />
      <View style={styles.authGlow2} />
      <View style={styles.mfaContainer}>
        <View style={styles.mfaIconCircle}>
          <Ionicons name="shield-checkmark-outline" size={36} color={COLORS.BLUE} />
        </View>
        <Text style={styles.authTitle}>Verificación en dos pasos</Text>
        <Text style={styles.authSubtitle}>Abre tu app de autenticación (Google Authenticator, Authy, etc.) y escribe el código de 6 dígitos.</Text>
        <TextInput
          style={styles.mfaCodeInput}
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          placeholder="000000"
          placeholderTextColor={COLORS.TEXT_MUTED}
          maxLength={6}
          autoFocus
        />
        <Pressable style={[styles.authSubmit, { width: '100%' }, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
          <Text style={styles.authSubmitText}>Verificar</Text>
          {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="arrow-forward" size={18} color="#FFF" />}
        </Pressable>
        <Pressable onPress={() => supabase.auth.signOut()} style={{ marginTop: 20 }}>
          <Text style={styles.switchText}>
            Cancelar y <Text style={styles.switchLink}>cerrar sesión</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
