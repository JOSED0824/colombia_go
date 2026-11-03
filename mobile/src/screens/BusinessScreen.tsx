import React, { useCallback, useEffect, useState } from 'react'
import { View, Pressable, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '../components/AppText'
import { KeyboardScroll } from '../components/KeyboardScroll'
import { Field, Chips, PhotoPicker, StatusPill, SubmitButton, form, type Status } from '../components/Form'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { ApiError, apiGet, apiSend } from '../lib/api'
import { pickAndUploadPhoto } from '../lib/upload'
import { notify } from '../lib/notify'
import type { MiLugarDto } from '../lib/types'

const CATEGORIES = ['food', 'culture', 'nature', 'nightlife'] as const
const PRICES = ['gratis', 'economico', 'moderado', 'costoso', 'lujo'] as const
type Price = (typeof PRICES)[number]

/** Panel del negocio: lista de sus lugares con su estado de revisión, y formulario para publicar o editar. */
export function BusinessScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const [places, setPlaces] = useState<MiLugarDto[] | null>(null)
  const [editing, setEditing] = useState<MiLugarDto | 'new' | null>(null)

  const load = useCallback(() => {
    apiGet<MiLugarDto[]>('/api/v1/negocio/lugares', { force: true })
      .then(setPlaces)
      .catch(() => setPlaces([]))
  }, [])
  useEffect(load, [load])

  if (editing) {
    return (
      <BusinessForm
        place={editing === 'new' ? null : editing}
        onBack={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          load()
        }}
      />
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.backBtnSmall} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        </Pressable>
        <Text style={styles.settingsHeaderTitle}>{t('business.title')}</Text>
      </View>

      <KeyboardScroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <Pressable style={form.submit} onPress={() => setEditing('new')}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.INK} />
          <Text style={form.submitText}>{t('business.add')}</Text>
        </Pressable>
        <Text style={[form.hint, { marginBottom: 16, marginTop: 8 }]}>{t('business.reviewNote')}</Text>

        {places === null ? (
          <ActivityIndicator color={COLORS.BLUE} style={{ marginTop: 30 }} />
        ) : places.length === 0 ? (
          <Text style={{ textAlign: 'center', color: COLORS.TEXT_MUTED, marginTop: 30 }}>{t('business.empty')}</Text>
        ) : (
          places.map((p) => (
            <Pressable key={p.id} style={[form.card, { flexDirection: 'row', gap: 14 }]} onPress={() => setEditing(p)}>
              <View style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.GRAY_LIGHT, alignItems: 'center', justifyContent: 'center' }}>
                {p.image ? <Image source={{ uri: p.image }} style={{ width: 72, height: 72 }} /> : <Ionicons name="storefront-outline" size={28} color={COLORS.TEXT_MUTED} />}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 15, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE }} numberOfLines={2}>{p.name}</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: COLORS.TEXT_MUTED }}>
                  {t(`categories.${p.category}`)} · {p.city}
                </Text>
                <StatusPill status={p.status as Status} label={t(`business.status_${p.status}`)} />
                {p.status === 'rechazado' && !!p.rejectReason && (
                  <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#C62828' }}>{t('business.rejectReason', { reason: p.rejectReason })}</Text>
                )}
              </View>
              <Ionicons name="create-outline" size={20} color={COLORS.BLUE} />
            </Pressable>
          ))
        )}
      </KeyboardScroll>
    </View>
  )
}

function BusinessForm({ place, onBack, onSaved }: { place: MiLugarDto | null; onBack: () => void; onSaved: () => void }) {
  const { t } = useTranslation()
  const [name, setName] = useState(place?.name ?? '')
  const [category, setCategory] = useState<string>(place?.category || 'food')
  const [city, setCity] = useState(place?.city ?? '')
  const [region, setRegion] = useState(place?.region ?? '')
  const [address, setAddress] = useState(place?.address ?? '')
  const [description, setDescription] = useState(place?.description ?? '')
  const [tagline, setTagline] = useState(place?.tagline ?? '')
  const [hours, setHours] = useState(place?.hours ?? '')
  const [howToGet, setHowToGet] = useState(place?.howToGet ?? '')
  const [price, setPrice] = useState<Price>((place?.priceRange as Price) || 'economico')
  const [entryCost, setEntryCost] = useState(place?.entryCost != null ? String(Math.round(place.entryCost)) : '')
  const [image, setImage] = useState<string | null>(place?.image ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function pickPhoto() {
    setUploading(true)
    try {
      const url = await pickAndUploadPhoto([4, 3])
      if (url) setImage(url)
    } catch {
      notify(t('common.photoFailed'))
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    if (!name.trim() || !city.trim() || !region.trim() || !address.trim() || description.trim().length < 20) {
      notify(t('business.required'))
      return
    }
    setSaving(true)
    const body = {
      name: name.trim(),
      category,
      city: city.trim(),
      region: region.trim(),
      address: address.trim(),
      description: description.trim(),
      tagline: tagline.trim() || null,
      hours: hours.trim() || null,
      howToGet: howToGet.trim() || null,
      priceRange: price,
      entryCost: entryCost ? Number(entryCost.replace(/[^0-9]/g, '')) : null,
      imageUrl: image,
      latitude: null,
      longitude: null,
    }
    try {
      if (place) await apiSend(`/api/v1/negocio/lugares/${place.id}`, 'PUT', body)
      else await apiSend('/api/v1/negocio/lugares', 'POST', body)
      notify(t('business.saved'))
      onSaved()
    } catch (e) {
      const msg =
        e instanceof ApiError && e.code === 'Lugar.DireccionNoEncontrada'
          ? t('business.addressNotFound')
          : e instanceof ApiError && e.status === 400
            ? t('business.required')
            : t('common.tryAgainLater')
      notify(t('common.offlineTitle'), msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.settingsHeader}>
        <Pressable style={styles.backBtnSmall} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={COLORS.BLUE} />
        </Pressable>
        <Text style={styles.settingsHeaderTitle} numberOfLines={1}>{place ? t('business.formEdit') : t('business.formNew')}</Text>
      </View>

      <KeyboardScroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {place && (
          <View style={{ marginBottom: 14 }}>
            <StatusPill status={place.status as Status} label={t(`business.status_${place.status}`)} />
          </View>
        )}
        <PhotoPicker label={t('business.photo')} url={image} uploading={uploading} onPick={pickPhoto} actionLabel={t('business.addPhoto')} />
        <Field label={t('business.name')} value={name} onChangeText={setName} />
        <Chips
          label={t('business.category')}
          options={CATEGORIES.map((c) => ({ value: c, label: t(`categories.${c}`) }))}
          selected={[category]}
          onToggle={setCategory}
        />
        <Field label={t('business.city')} value={city} onChangeText={setCity} placeholder="Medellín" />
        <Field label={t('business.region')} value={region} onChangeText={setRegion} placeholder="Antioquia" />
        <Field label={t('business.address')} value={address} onChangeText={setAddress} hint={t('business.addressHint')} />
        <Field label={t('business.description')} value={description} onChangeText={setDescription} placeholder={t('business.descriptionPh')} multiline />
        <Field label={t('business.tagline')} value={tagline} onChangeText={setTagline} />
        <Field label={t('business.hours')} value={hours} onChangeText={setHours} placeholder="8am - 6pm" />
        <Field label={t('business.howToGet')} value={howToGet} onChangeText={setHowToGet} />
        <Chips
          label={t('business.price')}
          options={PRICES.map((p) => ({ value: p, label: t(`business.price_${p}`) }))}
          selected={[price]}
          onToggle={setPrice}
        />
        <Field label={t('business.entryCost')} value={entryCost} onChangeText={setEntryCost} keyboardType="number-pad" />

        <SubmitButton label={t('business.save')} onPress={save} loading={saving} />
        <Text style={[form.hint, { textAlign: 'center', marginTop: 10 }]}>{t('business.reviewNote')}</Text>
      </KeyboardScroll>
    </View>
  )
}
