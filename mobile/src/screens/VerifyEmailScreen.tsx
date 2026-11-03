import React, { useEffect, useState } from 'react'
import { View, Pressable, ActivityIndicator, Linking, StyleSheet } from 'react-native'
import { Text } from '../components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { themed } from '../theme/themed'
import { styles } from '../theme/styles'
import { CodeInput } from '../components/CodeInput'
import { supabase } from '../lib/supabase'
import { AUTH_REDIRECT_URL } from '../lib/api'
import { authErrorMessage } from '../lib/errors'
import { notify } from '../lib/notify'
import { KeyboardScroll } from '../components/KeyboardScroll'

const RESEND_SECONDS = 60

type Props = {
  email: string
  /** Si el correo ya se envió justo antes de abrir esta pantalla (registro), arranca con la cuenta regresiva. */
  codeJustSent?: boolean
  onBack: () => void
}

/**
 * Paso final del registro: la persona escribe el código de 6 dígitos que le llegó al correo.
 * Al verificarlo Supabase abre la sesión y App.tsx la detecta por onAuthStateChange (no hace falta callback).
 */
export function VerifyEmailScreen({ email, codeJustSent = true, onBack }: Props) {
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(codeJustSent ? RESEND_SECONDS : 0)

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  async function verify(token = code) {
    if (token.length !== 6) {
      setError(t('verify.invalidCode'))
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    setLoading(false)
    if (err) {
      setError(/expired|invalid/i.test(err.message) ? t('verify.wrongCode') : authErrorMessage(err.message))
      setCode('')
    }
  }

  async function resend() {
    if (seconds > 0) return
    const { error: err } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: AUTH_REDIRECT_URL } })
    if (err) {
      setError(authErrorMessage(err.message))
      return
    }
    setError('')
    setSeconds(RESEND_SECONDS)
    notify(t('verify.resent'))
  }

  return (
    <SafeAreaView style={styles.authMain}>
      <View style={styles.authGlow1} />
      <View style={styles.authGlow2} />
      <KeyboardScroll
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.mfaContainer}>
        <View style={styles.mfaIconCircle}>
          <Ionicons name="mail-open-outline" size={36} color={COLORS.BLUE} />
        </View>
        <Text style={styles.authTitle}>{t('verify.title')}</Text>
        <Text style={styles.authSubtitle}>{t('verify.subtitle', { email })}</Text>

        <CodeInput value={code} onChange={(v) => { setCode(v); setError('') }} autoFocus onComplete={verify} />
        {!!error && <Text style={local.error}>{error}</Text>}

        <Pressable style={[styles.authSubmit, { width: '100%' }, loading && { opacity: 0.7 }]} onPress={() => verify()} disabled={loading}>
          <Text style={styles.authSubmitText}>{t('verify.submit')}</Text>
          {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="checkmark" size={18} color="#FFF" />}
        </Pressable>

        <Pressable onPress={resend} disabled={seconds > 0} style={local.link}>
          <Text style={[styles.switchLink, seconds > 0 && { color: COLORS.TEXT_MUTED }]}>
            {seconds > 0 ? t('verify.resendIn', { seconds }) : t('verify.resend')}
          </Text>
        </Pressable>

        <Pressable onPress={() => Linking.openURL('mailto:').catch(() => {})} style={local.link}>
          <Text style={styles.switchText}>{t('verify.openMail')}</Text>
        </Pressable>
        <Text style={local.hint}>{t('verify.checkSpam')}</Text>

        <Pressable onPress={onBack} style={{ marginTop: 18 }}>
          <Text style={styles.switchText}>
            <Text style={styles.switchLink}>{t('verify.otherEmail')}</Text>
          </Text>
        </Pressable>
      </View>
      </KeyboardScroll>
    </SafeAreaView>
  )
}

const local = themed(() => StyleSheet.create({
  error: { color: COLORS.RED, fontFamily: 'Poppins_500Medium', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  link: { marginTop: 14 },
  hint: { marginTop: 6, fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.TEXT_MUTED, textAlign: 'center' },
}))
