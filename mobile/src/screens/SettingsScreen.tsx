import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, Image, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useTranslation } from 'react-i18next'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { SettingToggle } from '../components/SettingToggle'
import { SettingLink } from '../components/SettingLink'
import { MfaSettings } from '../components/MfaSettings'
import { LanguageModal } from '../components/LanguageModal'
import { LANGUAGES, getLanguage, setLanguage, type LanguageCode } from '../i18n'
import { apiGet, apiSend } from '../lib/api'
import { notify } from '../lib/notify'
import type { ConfiguracionDto } from '../lib/types'

export function SettingsScreen({ profileName, profileBio, profilePhoto, onLogout, onNavigate, onProfileUpdate, onShowTutorial }: any) {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(profileName)
  const [editBio, setEditBio] = useState(profileBio ?? '')

  // Las preferencias viven en el servidor (así se conservan al cambiar de teléfono).
  useEffect(() => {
    apiGet<ConfiguracionDto>('/api/v1/perfil/configuracion')
      .then((c) => {
        setNotifications(c.notifications)
        setLocationEnabled(c.location)
        setReduceMotion(c.reduceMotion)
      })
      .catch(() => {})
  }, [])

  // Cada cambio manda el estado completo; si falla, se revierte el interruptor y se avisa.
  async function savePrefs(next: { notifications: boolean; location: boolean; reduceMotion: boolean }, revert: () => void) {
    try {
      await apiSend('/api/v1/perfil/configuracion', 'PUT', { ...next, language: getLanguage() })
    } catch {
      revert()
      notify(t('common.offlineTitle'), t('common.tryAgainLater'))
    }
  }

  function toggleNotifications() {
    const value = !notifications
    setNotifications(value)
    savePrefs({ notifications: value, location: locationEnabled, reduceMotion }, () => setNotifications(!value))
  }

  function toggleLocation() {
    const value = !locationEnabled
    setLocationEnabled(value)
    savePrefs({ notifications, location: value, reduceMotion }, () => setLocationEnabled(!value))
  }

  async function changeLanguage(code: LanguageCode) {
    await setLanguage(code)
    // El idioma elegido también se guarda en la cuenta para recuperarlo en otro dispositivo.
    apiSend('/api/v1/perfil/configuracion', 'PUT', { notifications, location: locationEnabled, reduceMotion, language: code }).catch(() => {})
  }

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

  const currentLanguage = LANGUAGES.find((l) => l.code === getLanguage()) ?? LANGUAGES[0]

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.backBtnSmall} onPress={() => onNavigate('Perfil')}>
          <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        </Pressable>
        <Text style={styles.settingsHeaderTitle}>{t('settings.title')}</Text>
        {isEditing && (
          <Pressable onPress={handleSave}>
            <Text style={{ color: COLORS.BLUE, fontFamily: 'Poppins_700Bold' }}>{t('common.save')}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.settingsSectionLabel}>{t('settings.profile')}</Text>
        <View style={styles.settingsCard}>
          <Pressable style={styles.profileEditRow} onPress={pickImage}>
            <Image source={profilePhoto ? { uri: profilePhoto } : require('../../assets/normalized/Camilo.jpg')} style={styles.editAvatar} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t('settings.yourName')}
                />
              ) : (
                <Text style={styles.editNameText}>{profileName}</Text>
              )}
              <Text style={styles.editSubText}>{t('settings.tapPhoto')}</Text>
            </View>
            <Ionicons name="camera-outline" size={24} color={COLORS.BLUE} />
          </Pressable>
          {isEditing && (
            <TextInput
              style={[styles.editInput, { marginTop: 15, height: 60, textAlignVertical: 'top' }]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder={t('settings.yourBio')}
              multiline
            />
          )}
        </View>

        <Text style={styles.settingsSectionLabel}>{t('settings.preferences')}</Text>
        <View style={styles.settingsCard}>
          <SettingToggle
            icon="notifications-outline"
            label={t('settings.notifications')}
            value={notifications}
            onToggle={toggleNotifications}
          />
          <View style={styles.settingsDivider} />
          <SettingToggle
            icon="moon-outline"
            label={t('settings.darkMode')}
            value={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
          />
          <View style={styles.settingsDivider} />
          <SettingToggle
            icon="location-outline"
            label={t('settings.location')}
            value={locationEnabled}
            onToggle={toggleLocation}
          />
          <View style={styles.settingsDivider} />
          <SettingLink
            icon="language-outline"
            label={`${t('settings.language')}: ${currentLanguage.flag} ${currentLanguage.native}`}
            onPress={() => setLangOpen(true)}
          />
          <View style={styles.settingsDivider} />
          <SettingLink icon="school-outline" label={t('settings.tutorial')} onPress={onShowTutorial} />
        </View>

        <Text style={styles.settingsSectionLabel}>{t('settings.security')}</Text>
        <View style={styles.settingsCard}>
          <SettingLink icon="person-outline" label={t('settings.editInfo')} onPress={() => setIsEditing(!isEditing)} />
          <View style={styles.settingsDivider} />
          <SettingLink icon="lock-closed-outline" label={t('settings.changePassword')} onPress={() => notify(t('settings.changePasswordSoon'))} />
          <View style={styles.settingsDivider} />
          <MfaSettings />
        </View>

        <Pressable style={styles.logoutBtnAction} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.RED} />
          <Text style={styles.logoutBtnText}>{t('settings.logout')}</Text>
        </Pressable>

        <Text style={styles.versionText}>{t('settings.version')}</Text>
      </ScrollView>

      <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} onSelect={changeLanguage} />
    </View>
  )
}
