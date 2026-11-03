import React, { useCallback, useEffect, useState } from 'react'
import { View, Pressable, ActivityIndicator } from 'react-native'
import { Image } from '../components/Img'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '../components/AppText'
import { KeyboardScroll } from '../components/KeyboardScroll'
import { Field, Chips, PhotoPicker, StatusPill, SubmitButton, form, type Status } from '../components/Form'
import { Select } from '../components/Select'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { ApiError, apiGet, apiSend } from '../lib/api'
import { pickAndUploadPhoto } from '../lib/upload'
import { notify } from '../lib/notify'
import { DEPARTAMENTOS, ciudadesDe, departamentoDe } from '../lib/colombia'
import type { MiLugarDto } from '../lib/types'

const CATEGORIES = ['food', 'culture', 'nature', 'nightlife'] as const
const PRICES = ['gratis', 'economico', 'moderado', 'costoso', 'lujo'] as const
type Price = (typeof PRICES)[number]

/**
 * Inicio de la cuenta de negocio (pestaña "Mi negocio"): resumen de sus lugares por estado y la lista para editarlos.
 * `refreshKey` cambia cuando se publica o edita algo, para volver a pedir la lista.
 */
export function BusinessDashboard({
  name,
  refreshKey,
  onNew,
  onEdit,
}: {
  name: string
  refreshKey: number
  onNew: () => void
  onEdit: (place: MiLugarDto) => void
}) {
  const { t } = useTranslation()
  const [places, setPlaces] = useState<MiLugarDto[] | null>(null)

  const load = useCallback(() => {
    apiGet<MiLugarDto[]>('/api/v1/negocio/lugares', { force: true })
      .then(setPlaces)
      .catch(() => setPlaces([]))
  }, [])
  useEffect(load, [load, refreshKey])

  const count = (s: MiLugarDto['status']) => places?.filter((p) => p.status === s).length ?? 0
  const rated = places?.filter((p) => p.reviewsCount > 0) ?? []
  const avg = rated.length ? rated.reduce((a, p) => a + Number(p.rating), 0) / rated.length : null

  return (
    <View>
      <Text style={styles.pageTitle}>{t('businessHome.hello', { name: name.split(' ')[0] })}</Text>
      <Text style={[form.hint, { fontSize: 13, marginTop: -6, marginBottom: 18 }]}>{t('businessHome.subtitle')}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        <Stat icon="checkmark-circle" color="#0F8A4B" value={String(count('aprobado'))} label={t('businessHome.published')} />
        <Stat icon="time-outline" color="#9A6B00" value={String(count('pendiente'))} label={t('businessHome.inReview')} />
        <Stat icon="close-circle" color="#C62828" value={String(count('rechazado'))} label={t('businessHome.rejected')} />
        <Stat icon="star" color="#F59E0B" value={avg ? avg.toFixed(1) : '–'} label={t('businessHome.rating')} />
      </View>

      <Pressable style={form.submit} onPress={onNew}>
        <Ionicons name="add-circle-outline" size={20} color={COLORS.INK} />
        <Text style={form.submitText}>{t('business.add')}</Text>
      </Pressable>
      <Text style={[form.hint, { marginBottom: 16, marginTop: 8 }]}>{t('business.reviewNote')}</Text>

      <Text style={[styles.settingsSectionLabel, { marginTop: 4 }]}>{t('businessHome.places')}</Text>
      {places === null ? (
        <ActivityIndicator color={COLORS.BLUE} style={{ marginTop: 30 }} />
      ) : places.length === 0 ? (
        <Text style={{ textAlign: 'center', color: COLORS.TEXT_MUTED, marginTop: 20 }}>{t('business.empty')}</Text>
      ) : (
        places.map((p) => (
          <Pressable key={p.id} style={[form.card, { flexDirection: 'row', gap: 14 }]} onPress={() => onEdit(p)}>
            <View style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.GRAY_LIGHT, alignItems: 'center', justifyContent: 'center' }}>
              {p.image ? <Image source={{ uri: p.image }} style={{ width: 72, height: 72 }} /> : <Ionicons name="storefront-outline" size={28} color={COLORS.TEXT_MUTED} />}
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 15, fontFamily: 'Poppins_700Bold', color: COLORS.BLUE }} numberOfLines={2}>{p.name}</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: COLORS.TEXT_MUTED }}>
                {t(`categories.${p.category}`)} · {p.city}
                {p.reviewsCount > 0 ? `  ★ ${Number(p.rating).toFixed(1)} (${p.reviewsCount})` : ''}
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
    </View>
  )
}

function Stat({ icon, color, value, label }: { icon: string; color: string; value: string; label: string }) {
  return (
    <View style={[form.card, { marginBottom: 0, width: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }]}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontFamily: 'Poppins_800ExtraBold', color: COLORS.BLUE }}>{value}</Text>
        <Text style={{ fontSize: 11, fontFamily: 'Poppins_500Medium', color: COLORS.TEXT_MUTED }} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  )
}

/**
 * Formulario para publicar (place = null) o editar un lugar. Se usa como pestaña "Publicar" (sin botón atrás) y como
 * pantalla de edición desde "Mi negocio".
 */
export function BusinessForm({ place, onBack, onSaved }: { place: MiLugarDto | null; onBack?: () => void; onSaved: () => void }) {
  const { t } = useTranslation()
  const [name, setName] = useState(place?.name ?? '')
  const [category, setCategory] = useState<string>(place?.category || 'food')
  const [region, setRegion] = useState(place?.region || (place ? departamentoDe(place.city) ?? '' : ''))
  const [city, setCity] = useState(place?.city ?? '')
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

  const fields = (
    <>
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
      <Select
        label={t('business.region')}
        value={region}
        options={DEPARTAMENTOS.map((d) => d.nombre)}
        onChange={(d) => {
          setRegion(d)
          if (!ciudadesDe(d).includes(city)) setCity('')
        }}
      />
      <Select
        label={t('business.city')}
        value={city}
        options={ciudadesDe(region)}
        onChange={setCity}
        allowOther
        disabled={!region}
        placeholder={region ? undefined : t('select.pickRegionFirst')}
      />
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
    </>
  )

  // En la pestaña "Publicar" el formulario ya está dentro del scroll de la pestaña; como pantalla de edición tiene el suyo.
  if (!onBack) {
    return (
      <View>
        <Text style={styles.pageTitle}>{t('business.formNew')}</Text>
        {fields}
      </View>
    )
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
        {fields}
      </KeyboardScroll>
    </View>
  )
}
