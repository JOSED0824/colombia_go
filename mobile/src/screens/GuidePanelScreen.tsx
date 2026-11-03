import React, { useEffect, useState } from 'react'
import { View, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '../components/AppText'
import { KeyboardScroll } from '../components/KeyboardScroll'
import { Field, Chips, PhotoPicker, SubmitButton, form } from '../components/Form'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { ApiError, apiGet, apiSend } from '../lib/api'
import { pickAndUploadPhoto } from '../lib/upload'
import { notify } from '../lib/notify'
import type { GuiaDto } from '../lib/types'

const LANGS = ['ES', 'EN', 'PT', 'FR', 'ZH', 'DE', 'IT'] as const

/** Panel del guía: crea o edita su perfil público. Sale en "Guías" cuando un admin lo verifica. */
export function GuidePanelScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<GuiaDto | null>(null)

  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [place, setPlace] = useState('')
  const [rate, setRate] = useState('')
  const [languages, setLanguages] = useState<string[]>(['ES'])
  const [experience, setExperience] = useState('0')
  const [bio, setBio] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)

  function fill(g: GuiaDto) {
    setProfile(g)
    setName(g.name)
    setSpecialty(g.specialty)
    setPlace(g.place)
    setRate(String(Math.round(Number(g.price.replace(/[^0-9]/g, '')) || 0) || ''))
    setLanguages(g.languages.length ? g.languages : ['ES'])
    setExperience(String(g.experienceYears ?? 0))
    setBio(g.bio ?? '')
    setPhoto(g.image && /^https?:/.test(g.image) ? g.image : null)
  }

  useEffect(() => {
    apiGet<GuiaDto>('/api/v1/guias/mi-perfil', { force: true })
      .then(fill)
      .catch(() => {}) // 404 = todavía no tiene perfil: se muestra el formulario vacío
      .finally(() => setLoading(false))
  }, [])

  async function pickPhoto() {
    setUploading(true)
    try {
      const url = await pickAndUploadPhoto([1, 1])
      if (url) setPhoto(url)
    } catch {
      notify(t('common.photoFailed'))
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    const hourlyRate = Number(rate.replace(/[^0-9]/g, ''))
    if (!name.trim() || !specialty.trim() || !place.trim() || !hourlyRate || languages.length === 0) {
      notify(t('guidePanel.required'))
      return
    }
    setSaving(true)
    try {
      const saved = await apiSend<GuiaDto>('/api/v1/guias/mi-perfil', 'PUT', {
        name: name.trim(),
        specialty: specialty.trim(),
        place: place.trim(),
        hourlyRate,
        languages,
        bio: bio.trim() || null,
        experienceYears: Math.max(0, Number(experience.replace(/[^0-9]/g, '')) || 0),
        photoUrl: photo,
      })
      fill(saved)
      notify(t('guidePanel.saved'))
    } catch (e) {
      notify(t('common.offlineTitle'), e instanceof ApiError && e.status === 400 ? t('guidePanel.required') : t('common.tryAgainLater'))
    } finally {
      setSaving(false)
    }
  }

  const banner = !profile
    ? { bg: COLORS.GRAY_LIGHT, fg: COLORS.BLUE, icon: 'sparkles-outline', text: t('guidePanel.empty') }
    : profile.verified
      ? { bg: '#E3F6EC', fg: '#0F8A4B', icon: 'checkmark-circle', text: t('guidePanel.verified') }
      : { bg: '#FFF4D6', fg: '#9A6B00', icon: 'time-outline', text: t('guidePanel.pending') }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.backBtnSmall} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        </Pressable>
        <Text style={styles.settingsHeaderTitle}>{t('guidePanel.title')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.BLUE} style={{ marginTop: 40 }} />
      ) : (
        <KeyboardScroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
          <View style={[form.banner, { backgroundColor: banner.bg }]}>
            <Ionicons name={banner.icon as any} size={22} color={banner.fg} />
            <Text style={[form.bannerText, { color: banner.fg }]}>{banner.text}</Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <PhotoPicker label={t('guidePanel.photo')} url={photo} uploading={uploading} onPick={pickPhoto} actionLabel={t('guidePanel.changePhoto')} round />
          </View>
          <Field label={t('guidePanel.name')} value={name} onChangeText={setName} />
          <Field label={t('guidePanel.specialty')} value={specialty} onChangeText={setSpecialty} placeholder={t('guidePanel.specialtyPh')} />
          <Field label={t('guidePanel.place')} value={place} onChangeText={setPlace} placeholder="Medellín" />
          <Field label={t('guidePanel.rate')} value={rate} onChangeText={setRate} keyboardType="number-pad" placeholder="60000" />
          <Chips
            label={t('guidePanel.languages')}
            options={LANGS.map((l) => ({ value: l, label: l }))}
            selected={languages}
            onToggle={(l) => setLanguages((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]))}
          />
          <Field label={t('guidePanel.experience')} value={experience} onChangeText={setExperience} keyboardType="number-pad" />
          <Field label={t('guidePanel.bio')} value={bio} onChangeText={setBio} placeholder={t('guidePanel.bioPh')} multiline />

          <SubmitButton label={t('guidePanel.save')} onPress={save} loading={saving} />
        </KeyboardScroll>
      )}
    </View>
  )
}
