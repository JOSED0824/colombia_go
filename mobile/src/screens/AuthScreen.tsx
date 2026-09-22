import React, { useState } from 'react'
import { View, Text, ScrollView, Image, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { AuthInput } from '../components/AuthInput'

export function AuthScreen({ onAuthenticated }: any) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAuth = () => {
    // Aquí iría la validación y llamada a API
    if (isLogin) {
      if (!formData.email || !formData.password) {
        Alert.alert('Error', 'Por favor completa todos los campos')
        return
      }
      onAuthenticated(formData.email.split('@')[0]) // Ejemplo: usa el nombre del email
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        Alert.alert('Error', 'Por favor completa todos los campos')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden')
        return
      }
      onAuthenticated(formData.name)
    }
  }

  return (
    <SafeAreaView style={styles.authMain}>
      <View style={styles.authGlow1} />
      <View style={styles.authGlow2} />

      <ScrollView contentContainerStyle={styles.authScroll}>
        <View style={styles.authBrand}>
          <Image source={require('../../assets/normalized/Logo-oficial-Colombia-GO.jpeg')} style={styles.authLogoLarge} />
          <Text style={styles.authTagline}>EXPLORA, CONECTA Y VIVE COLOMBIA.</Text>
        </View>

        <Text style={styles.authTitle}>{isLogin ? '¡Bienvenido!' : 'Crea tu cuenta'}</Text>
        <Text style={styles.authSubtitle}>{isLogin ? 'Inicia sesión y continúa explorando las maravillas de Colombia.' : 'Únete a Colombia GO y empieza a vivir experiencias únicas.'}</Text>

        <View style={styles.authForm}>
          {!isLogin && (
            <AuthInput
              icon="person-outline"
              placeholder="Nombre completo"
              value={formData.name}
              onChangeText={(text: string) => handleInputChange('name', text)}
            />
          )}
          <AuthInput
            icon="mail-outline"
            placeholder="Correo electrónico"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text: string) => handleInputChange('email', text)}
          />
          <AuthInput
            icon="lock-closed-outline"
            placeholder="Contraseña"
            secure
            value={formData.password}
            onChangeText={(text: string) => handleInputChange('password', text)}
          />
          {!isLogin && (
            <AuthInput
              icon="lock-closed-outline"
              placeholder="Confirmar Contraseña"
              secure
              value={formData.confirmPassword}
              onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
            />
          )}

          {isLogin && (
             <View style={styles.authOptions}>
               <View style={styles.remember}>
                 <Ionicons name="checkbox" size={18} color={COLORS.BLUE} />
                 <Text style={styles.rememberText}>Recordar mi cuenta</Text>
               </View>
               <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
             </View>
          )}

          <Pressable style={[styles.authSubmit, !isLogin && { backgroundColor: COLORS.YELLOW }]} onPress={handleAuth}>
            <Text style={[styles.authSubmitText, !isLogin && { color: COLORS.BLUE }]}>{isLogin ? 'Iniciar sesión' : 'Registrarme'}</Text>
            <Ionicons name="arrow-forward" size={18} color={isLogin ? "#FFF" : COLORS.BLUE} />
          </Pressable>
        </View>

        <View style={styles.authSep}><View style={styles.line}/><Text style={styles.sepText}>o</Text><View style={styles.line}/></View>

        <Pressable style={styles.googleBtn}>
           <Text style={styles.googleTxt}><Text style={{ color: '#4285F4' }}>G</Text>  Continuar con Google</Text>
        </Pressable>

        <Pressable style={styles.switchAuth} onPress={() => setIsLogin(!isLogin)}>
           <Text style={styles.switchText}>{isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}<Text style={styles.switchLink}>{isLogin ? 'Regístrarme' : 'Inicia sesión'}</Text></Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
