import React, { useState } from 'react'
import { View, Text, ScrollView, Image, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { AuthInput } from '../components/AuthInput'

export function AuthScreen({ onAuthenticated }: any) {
  const [isLogin, setIsLogin] = useState(true)
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
          {!isLogin && <AuthInput icon="person-outline" placeholder="Nombre completo" />}
          <AuthInput icon="mail-outline" placeholder="Correo electrónico" />
          {!isLogin && <AuthInput icon="call-outline" placeholder="Número de teléfono" />}
          <AuthInput icon="lock-closed-outline" placeholder="Contraseña" secure />

          {isLogin && (
             <View style={styles.authOptions}>
               <View style={styles.remember}>
                 <Ionicons name="checkbox" size={18} color={COLORS.BLUE} />
                 <Text style={styles.rememberText}>Recordar mi cuenta</Text>
               </View>
               <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
             </View>
          )}

          <Pressable style={[styles.authSubmit, !isLogin && { backgroundColor: COLORS.YELLOW }]} onPress={() => onAuthenticated("Camilo Restrepo")}>
            <Text style={[styles.authSubmitText, !isLogin && { color: COLORS.BLUE }]}>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</Text>
            <Ionicons name="arrow-forward" size={18} color={isLogin ? "#FFF" : COLORS.BLUE} />
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
