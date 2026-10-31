import React, { useEffect, useState } from 'react'
import { View, Pressable, ActivityIndicator } from 'react-native'
import { Text, TextInput } from './AppText'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { notify } from '../lib/notify'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { enrollTotp, listFactors, unenroll, verifyEnrollment, type Factor } from '../lib/mfa'

export function MfaSettings() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [factor, setFactor] = useState<Factor | null>(null)
  const [pending, setPending] = useState<{ id: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const factors = await listFactors()
      setFactor(factors.find((f) => f.status === 'verified') ?? null)
    } catch {
      // si falla la consulta, se asume sin MFA activado; el usuario puede reintentar
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function startEnroll() {
    setBusy(true)
    try {
      const data = await enrollTotp()
      setPending({ id: data.id, secret: data.totp.secret })
    } catch (error: any) {
      notify(t('mfa.enrollFailed'), error?.message ?? t('apiErrors.generic'))
    } finally {
      setBusy(false)
    }
  }

  async function confirmEnroll() {
    if (!pending || code.trim().length !== 6) {
      notify(t('mfa.invalidTitle'), t('mfa.invalidMsg'))
      return
    }
    setBusy(true)
    try {
      await verifyEnrollment(pending.id, code.trim())
      setPending(null)
      setCode('')
      notify(t('mfa.doneTitle'), t('mfa.doneMsg'))
      await refresh()
    } catch (error: any) {
      notify(t('mfa.wrongTitle'), t('mfa.wrongMsg'))
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    if (!factor) return
    setBusy(true)
    try {
      await unenroll(factor.id)
      await refresh()
    } catch (error: any) {
      notify(t('mfa.disableFailed'), error?.message ?? t('apiErrors.generic'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <ActivityIndicator color={COLORS.BLUE} style={{ marginVertical: 15 }} />
  }

  if (factor) {
    return (
      <View style={styles.mfaStatusRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.editNameText}>{t('mfa.settingsTitle')}</Text>
          <Text style={styles.editSubText}>{t('mfa.enabled')}</Text>
        </View>
        <Pressable onPress={disable} disabled={busy}>
          <Text style={{ color: COLORS.RED, fontFamily: 'Poppins_700Bold' }}>{busy ? '...' : t('mfa.disable')}</Text>
        </Pressable>
      </View>
    )
  }

  if (pending) {
    return (
      <View>
        <Text style={styles.editSubText}>
          {t('mfa.enrollHelp')}
        </Text>
        <Text selectable style={styles.mfaSecret}>
          {pending.secret}
        </Text>
        <TextInput
          style={[styles.editInput, { marginTop: 10 }]}
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder={t('mfa.codePlaceholder')}
          placeholderTextColor={COLORS.TEXT_MUTED}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Pressable
          style={[styles.emptyBtn, { marginTop: 10, alignSelf: 'stretch', alignItems: 'center' }, busy && { opacity: 0.7 }]}
          onPress={confirmEnroll}
          disabled={busy}
        >
          <Text style={styles.emptyBtnText}>{busy ? t('mfa.verifying') : t('mfa.confirm')}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <Pressable onPress={startEnroll} disabled={busy} style={styles.mfaStatusRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.editNameText}>{t('mfa.settingsTitle')}</Text>
        <Text style={styles.editSubText}>{busy ? t('mfa.generating') : t('mfa.disabledHint')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.BLUE} />
    </Pressable>
  )
}
