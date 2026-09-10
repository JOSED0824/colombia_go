import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, Image, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { SettingToggle } from '../components/SettingToggle'
import { SettingLink } from '../components/SettingLink'

export function SettingsScreen({ profileName, profileBio, profilePhoto, onLogout, onNavigate, onProfileUpdate }: any) {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(profileName)
  const [editBio, setEditBio] = useState(profileBio)

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      onProfileUpdate({ photo: result.assets[0].uri })
    }
  }

  const handleSave = () => {
    onProfileUpdate({ name: editName, bio: editBio })
    setIsEditing(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.backBtnSmall} onPress={() => onNavigate('Perfil')}>
          <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        </Pressable>
        <Text style={styles.settingsHeaderTitle}>Configuración</Text>
        {isEditing && (
          <Pressable onPress={handleSave}>
            <Text style={{ color: COLORS.BLUE, fontFamily: 'Poppins_700Bold' }}>Guardar</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.settingsSectionLabel}>Perfil</Text>
        <View style={styles.settingsCard}>
          <Pressable style={styles.profileEditRow} onPress={pickImage}>
            <Image source={profilePhoto ? { uri: profilePhoto } : require('../../assets/normalized/Camilo.jpg')} style={styles.editAvatar} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Tu nombre"
                />
              ) : (
                <Text style={styles.editNameText}>{profileName}</Text>
              )}
              <Text style={styles.editSubText}>Toca para cambiar foto</Text>
            </View>
            <Ionicons name="camera-outline" size={24} color={COLORS.BLUE} />
          </Pressable>
          {isEditing && (
            <TextInput
              style={[styles.editInput, { marginTop: 15, height: 60, textAlignVertical: 'top' }]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tu biografía"
              multiline
            />
          )}
        </View>

        <Text style={styles.settingsSectionLabel}>Preferencias</Text>
        <View style={styles.settingsCard}>
          <SettingToggle
            icon="notifications-outline"
            label="Notificaciones"
            value={notifications}
            onToggle={() => setNotifications(!notifications)}
          />
          <View style={styles.settingsDivider} />
          <SettingToggle
            icon="moon-outline"
            label="Modo Oscuro"
            value={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
          />
          <View style={styles.settingsDivider} />
          <SettingToggle
            icon="location-outline"
            label="Ubicación"
            value={locationEnabled}
            onToggle={() => setLocationEnabled(!locationEnabled)}
          />
        </View>

        <Text style={styles.settingsSectionLabel}>Seguridad</Text>
        <View style={styles.settingsCard}>
          <SettingLink icon="person-outline" label="Editar Información" onPress={() => setIsEditing(!isEditing)} />
          <View style={styles.settingsDivider} />
          <SettingLink icon="lock-closed-outline" label="Cambiar Contraseña" onPress={() => alert('Función para cambiar contraseña en desarrollo')} />
        </View>

        <Pressable style={styles.logoutBtnAction} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.RED} />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </Pressable>

        <Text style={styles.versionText}>Colombia GO v1.0.2</Text>
      </ScrollView>
    </View>
  )
}
