import React, { useRef, useState } from 'react'
import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { Text } from '../components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { themed } from '../theme/themed'
import { styles } from '../theme/styles'
import { AuthInput } from '../components/AuthInput'
import { CodeInput } from '../components/CodeInput'
import { supabase } from '../lib/supabase'
import { authFlow } from '../lib/authFlow'
import { authErrorMessage } from '../lib/errors'
import { notify } from '../lib/notify'
import { KeyboardScroll } from '../components/KeyboardScroll'

type Props = {
  initialEmail?: string
  onBack: () => void
}

/**
 * Recuperar contraseña con código: (1) se pide el correo y se envía un código de 6 dígitos;
 * (2) la persona escribe el código y su nueva contraseña.
 */
export function ForgotPasswordScreen({ initialEmail = '', onBack }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // El código de un solo uso ya se canjeó (hay sesión de recuperación): un reintento solo cambia la contraseña.
  const otpVerified = useRef(false)

  async function sendCode() {
    if (!email.trim()) {
      setError(t('auth.missingEmailPassword'))
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim())
    setLoading(false)
    if (err) {
      setError(authErrorMessage(err.message))
      return
    }
    setStep('code')
  }

  async function updatePassword() {
    if (code.length !== 6) {
      setError(t('verify.invalidCode'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.errors.weakPassword'))
      return
    }

    setLoading(true)
    setError('')
    // verifyOtp inicia sesión; mientras no se cambie la contraseña, App.tsx no debe dejar entrar a la app.
    authFlow.setRecovering(true)
    let changed = false
    try {
      if (!otpVerified.current) {
        const { error: otpError } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'recovery' })
        if (otpError) {
          setError(/expired|invalid/i.test(otpError.message) ? t('verify.wrongCode') : authErrorMessage(otpError.message))
          setCode('')
          authFlow.setRecovering(false) // no se abrió sesión: nada que proteger
          return
        }
        otpVerified.current = true
      }
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(authErrorMessage(updateError.message))
        return
      }
      changed = true
      notify(t('forgot.updated'))
    } finally {
      setLoading(false)
      // Con la contraseña cambiada se suelta el flag: App.tsx ve la sesión abierta y deja entrar.
      // Si algo falló después de abrir sesión, el flag sigue activo y la persona puede reintentar o cancelar.
      if (changed) authFlow.setRecovering(false)
    }
  }

  async function cancel() {
    // Si verifyOtp alcanzó a abrir sesión y la persona se arrepiente, se cierra para no dejarla "adentro" sin querer.
    if (authFlow.isRecovering()) {
      await supabase.auth.signOut()
      authFlow.setRecovering(false)
    }
    onBack()
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
          <Ionicons name="key-outline" size={36} color={COLORS.BLUE} />
        </View>
        <Text style={styles.authTitle}>{t('forgot.title')}</Text>
        <Text style={styles.authSubtitle}>
          {step === 'email' ? t('forgot.subtitle') : t('forgot.sentTo', { email: email.trim() })}
        </Text>

        {step === 'email' ? (
          <View style={{ width: '100%', marginTop: 10 }}>
            <AuthInput icon="mail-outline" placeholder={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" />
          </View>
        ) : (
          <>
            <CodeInput value={code} onChange={(v) => { setCode(v); setError('') }} autoFocus />
            <View style={{ width: '100%' }}>
              <AuthInput icon="lock-closed-outline" placeholder={t('forgot.newPassword')} secure value={password} onChangeText={setPassword} />
            </View>
          </>
        )}

        {!!error && <Text style={local.error}>{error}</Text>}

        <Pressable
          style={[styles.authSubmit, { width: '100%', marginTop: 10 }, loading && { opacity: 0.7 }]}
          onPress={step === 'email' ? sendCode : updatePassword}
          disabled={loading}
        >
          <Text style={styles.authSubmitText}>{step === 'email' ? t('forgot.send') : t('forgot.update')}</Text>
          {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="arrow-forward" size={18} color="#FFF" />}
        </Pressable>

        <Pressable onPress={cancel} style={{ marginTop: 20 }}>
          <Text style={styles.switchText}>
            <Text style={styles.switchLink}>{t('forgot.backToLogin')}</Text>
          </Text>
        </Pressable>
      </View>
      </KeyboardScroll>
    </SafeAreaView>
  )
}

const local = themed(() => StyleSheet.create({
  error: { color: COLORS.RED, fontFamily: 'Poppins_500Medium', fontSize: 13, marginTop: 6, textAlign: 'center' },
}))
