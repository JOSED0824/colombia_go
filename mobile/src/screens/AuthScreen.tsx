import React, { useState } from 'react'
import { View, Text, ScrollView, Image, Pressable, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { AuthInput } from '../components/AuthInput'
import { supabase } from '../lib/supabase'

// No recibe callback: al iniciar sesión, App.tsx detecta la nueva sesión vía onAuthStateChange.
export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!email.trim() || !password) {
      Alert.alert('Faltan datos', 'Escribe tu correo y tu contraseña.')
      return
    }
    if (!isLogin && !nombre.trim()) {
      Alert.alert('Faltan datos', 'Escribe tu nombre completo.')
      return
    }

    setLoading(true)
    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({
          email: email.trim(),
          password,
          // full_name lo lee el trigger handle_new_user para llenar usuarios.nombre_completo.
          options: { data: { full_name: nombre.trim(), phone: telefono.trim() || undefined } },
        })
    setLoading(false)

    if (error) {
      Alert.alert(isLogin ? 'No se pudo iniciar sesión' : 'No se pudo crear la cuenta', traducirError(error.message))
      return
    }
    if (!isLogin && !data.session) {
      // Supabase tiene activado "Confirm email": la cuenta existe pero falta confirmar el correo.
      Alert.alert('Revisa tu correo', 'Te enviamos un enlace para confirmar tu cuenta. Después inicia sesión.')
      setIsLogin(true)
    }
  }

  return (
    <SafeAreaView style={styles.authMain}>
      <View style={styles.authGlow1} />
      <View style={styles.authGlow2} />

      <ScrollView contentContainerStyle={styles.authScroll}>
        <View style={styles.authBrand}>
          <Image source={require('../../assets/normalized/Logo-oficial-Colombia-GO.jpeg')} style={styles.authLogoLarge} />
          <Text style={styles.authTagline}>EXPLORA, CONNECTA Y VIVE COLOMBIA.</Text>
        </View>

        <Text style={styles.authTitle}>{isLogin ? '¡Bienvenido!' : 'Crea tu cuenta'}</Text>
        <Text style={styles.authSubtitle}>{isLogin ? 'Inicia sesión y continúa explorando las maravillas de Colombia.' : 'Únete a Colombia GO y empieza a vivir experiencias únicas.'}</Text>

        <View style={styles.authForm}>
          {!isLogin && <AuthInput icon="person-outline" placeholder="Nombre completo" value={nombre} onChangeText={setNombre} autoCapitalize="words" />}
          <AuthInput icon="mail-outline" placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" />
          {!isLogin && <AuthInput icon="call-outline" placeholder="Número de teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />}
          <AuthInput icon="lock-closed-outline" placeholder="Contraseña" secure value={password} onChangeText={setPassword} />

          {isLogin && (
             <View style={styles.authOptions}>
               <View style={styles.remember}>
                 <Ionicons name="checkbox" size={18} color={COLORS.BLUE} />
                 <Text style={styles.rememberText}>Recordar mi cuenta</Text>
               </View>
               <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
             </View>
          )}

          <Pressable style={[styles.authSubmit, !isLogin && { backgroundColor: COLORS.YELLOW }, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
            <Text style={[styles.authSubmitText, !isLogin && { color: COLORS.BLUE }]}>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</Text>
            {loading
              ? <ActivityIndicator size="small" color={isLogin ? '#FFF' : COLORS.BLUE} />
              : <Ionicons name="arrow-forward" size={18} color={isLogin ? "#FFF" : COLORS.BLUE} />}
          </Pressable>
        </View>

        <View style={styles.authSep}><View style={styles.line}/><Text style={styles.sepText}>o</Text><View style={styles.line}/></View>

        <Pressable style={styles.googleBtn}>
           <Text style={styles.googleTxt}><Text style={{ color: '#4285F4' }}>G</Text>  Continuar con Google</Text>
        </Pressable>

        <Pressable style={styles.switchAuth} onPress={() => setIsLogin(!isLogin)}>
           <Text style={styles.switchText}>{isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}<Text style={styles.switchLink}>{isLogin ? 'Regístrate' : 'Inicia sesión'}</Text></Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function traducirError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (message.includes('Email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión.'
  if (message.includes('User already registered')) return 'Ya existe una cuenta con ese correo.'
  if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (message.includes('Unable to validate email address')) return 'El correo no es válido.'
  return message
}
