import React, { useState } from 'react'
import { View, Image, Pressable, ActivityIndicator } from 'react-native'
import { Text } from '../components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { AuthInput } from '../components/AuthInput'
import { LanguageButton, LanguageModal } from '../components/LanguageModal'
import { VerifyEmailScreen } from './VerifyEmailScreen'
import { ForgotPasswordScreen } from './ForgotPasswordScreen'
import { supabase } from '../lib/supabase'
import { authErrorMessage, isEmailNotConfirmed } from '../lib/errors'
import { notify } from '../lib/notify'
import { getLanguage, setLanguage } from '../i18n'
import { KeyboardScroll } from '../components/KeyboardScroll'

type View_ = { name: 'form' } | { name: 'verify'; email: string; codeJustSent: boolean } | { name: 'forgot' }

// No recibe callback: al iniciar sesión, App.tsx detecta la nueva sesión vía onAuthStateChange.
export function AuthScreen() {
  const { t } = useTranslation()
  const [view, setView] = useState<View_>({ name: 'form' })
  const [isLogin, setIsLogin] = useState(true)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  async function submit() {
    if (!email.trim() || !password) {
      notify(t('auth.missingTitle'), t('auth.missingEmailPassword'))
      return
    }
    if (!isLogin && !nombre.trim()) {
      notify(t('auth.missingTitle'), t('auth.missingName'))
      return
    }

    setLoading(true)
    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({
          email: email.trim(),
          password,
          // full_name e idioma los lee el trigger handle_new_user (usuarios.nombre_completo / usuario_configuracion.idioma).
          options: { data: { full_name: nombre.trim(), phone: telefono.trim() || undefined, idioma: getLanguage() } },
        })
    setLoading(false)

    if (error) {
      if (isLogin && isEmailNotConfirmed(error)) {
        // Se registró pero nunca verificó: se le manda un código nuevo y se le pide escribirlo.
        await supabase.auth.resend({ type: 'signup', email: email.trim() })
        setView({ name: 'verify', email: email.trim(), codeJustSent: true })
        return
      }
      notify(isLogin ? t('auth.loginFailed') : t('auth.signupFailed'), authErrorMessage(error.message))
      return
    }

    if (!isLogin) {
      // Con "Confirm email" activo, Supabase no devuelve sesión y una cuenta ya existente vuelve sin identidades.
      if (data.user && (data.user.identities?.length ?? 1) === 0) {
        notify(t('auth.signupFailed'), t('auth.errors.alreadyRegistered'))
        return
      }
      if (!data.session) setView({ name: 'verify', email: email.trim(), codeJustSent: true })
    }
  }

  if (view.name === 'verify') {
    return <VerifyEmailScreen email={view.email} codeJustSent={view.codeJustSent} onBack={() => setView({ name: 'form' })} />
  }
  if (view.name === 'forgot') {
    return <ForgotPasswordScreen initialEmail={email} onBack={() => setView({ name: 'form' })} />
  }

  return (
    <SafeAreaView style={styles.authMain}>
      <View style={styles.authGlow1} />
      <View style={styles.authGlow2} />

      <KeyboardScroll
        contentContainerStyle={styles.authScroll}
        showsVerticalScrollIndicator={false}
      >
        <LanguageButton onPress={() => setLangOpen(true)} />
        <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} onSelect={(code) => setLanguage(code)} />

        <View style={styles.authBrand}>
          <Image source={require('../../assets/normalized/Logo-oficial-Colombia-GO.jpeg')} style={styles.authLogoLarge} />
          <Text style={styles.authTagline}>{t('auth.tagline')}</Text>
        </View>

        <Text style={styles.authTitle}>{isLogin ? t('auth.welcome') : t('auth.createTitle')}</Text>
        <Text style={styles.authSubtitle}>{isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}</Text>

        <View style={styles.authForm}>
          {!isLogin && <AuthInput icon="person-outline" placeholder={t('auth.fullName')} value={nombre} onChangeText={setNombre} autoCapitalize="words" />}
          <AuthInput icon="mail-outline" placeholder={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" />
          {!isLogin && <AuthInput icon="call-outline" placeholder={t('auth.phone')} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />}
          <AuthInput icon="lock-closed-outline" placeholder={t('auth.password')} secure value={password} onChangeText={setPassword} />

          {isLogin && (
            <View style={styles.authOptions}>
              <View style={styles.remember}>
                <Ionicons name="checkbox" size={18} color={COLORS.BLUE} />
                <Text style={styles.rememberText}>{t('auth.remember')}</Text>
              </View>
              <Pressable onPress={() => setView({ name: 'forgot' })}>
                <Text style={styles.forgot}>{t('auth.forgot')}</Text>
              </Pressable>
            </View>
          )}

          <Pressable style={[styles.authSubmit, !isLogin && { backgroundColor: COLORS.YELLOW }, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
            <Text style={[styles.authSubmitText, !isLogin && { color: COLORS.INK }]}>{isLogin ? t('auth.login') : t('auth.register')}</Text>
            {loading
              ? <ActivityIndicator size="small" color={isLogin ? '#FFF' : COLORS.INK} />
              : <Ionicons name="arrow-forward" size={18} color={isLogin ? '#FFF' : COLORS.INK} />}
          </Pressable>
        </View>

        <View style={styles.authSep}><View style={styles.line} /><Text style={styles.sepText}>{t('auth.or')}</Text><View style={styles.line} /></View>

        <Pressable style={styles.googleBtn} onPress={() => notify(t('auth.googleSoon'))}>
          <Text style={styles.googleTxt}><Text style={{ color: '#4285F4' }}>G</Text>  {t('auth.google')}</Text>
        </Pressable>

        <Pressable style={styles.switchAuth} onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>{isLogin ? t('auth.noAccount') : t('auth.haveAccount')}<Text style={styles.switchLink}>{isLogin ? t('auth.signUpLink') : t('auth.signInLink')}</Text></Text>
        </Pressable>
      </KeyboardScroll>
    </SafeAreaView>
  )
}
