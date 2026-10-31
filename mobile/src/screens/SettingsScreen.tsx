import React, { useEffect, useState } from 'react'
import { View, Pressable, Image } from 'react-native'
import { Text, TextInput } from '../components/AppText'
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
import { KeyboardScroll } from '../components/KeyboardScroll'

export function SettingsScreen({ profileName, profileBio, profilePhoto, onLogout, onNavigate, onProfileUpdate, onShowTutorial, darkMode, onToggleDark }: any) {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState(true)
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
    if (!editName.trim()) {
      notify(t('settings.nameRequired'))
      return
    }
    onProfileUpdate({ name: editName.trim(), bio: editBio.trim() })
    setIsEditing(false)
    notify(t('settings.profileSaved'))
  }

  const handleCancel = () => {
    setEditName(profileName)
    setEditBio(profileBio ?? '')
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
      </View>

      <KeyboardScroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
                  placeholderTextColor={COLORS.TEXT_MUTED}
                />
              ) : (
                <Text style={styles.editNameText}>{profileName}</Text>
              )}
              <Text style={styles.editSubText}>{t('settings.tapPhoto')}</Text>
            </View>
            <Ionicons name="camera-outline" size={24} color={COLORS.BLUE} />
          </Pressable>
          {isEditing && (
            <>
              <TextInput
                style={[styles.editInput, { marginTop: 15, height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder={t('settings.yourBio')}
                placeholderTextColor={COLORS.TEXT_MUTED}
                multiline
                maxLength={160}
              />
              <View style={styles.editActions}>
                <Pressable style={styles.editCancelBtn} onPress={handleCancel}>
                  <Text style={styles.editCancelText}>{t('common.cancel')}</Text>
                </Pressable>
                <Pressable style={styles.editSaveBtn} onPress={handleSave}>
                  <Ionicons name="checkmark" size={18} color={COLORS.INK} />
                  <Text style={styles.editSaveText}>{t('settings.saveChanges')}</Text>
                </Pressable>
              </View>
            </>
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
            value={!!darkMode}
            onToggle={onToggleDark}
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
          <SettingLink icon="person-outline" label={t('settings.editInfo')} onPress={() => (isEditing ? handleCancel() : setIsEditing(true))} />
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
      </KeyboardScroll>

      <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} onSelect={changeLanguage} />
    </View>
  )
}
