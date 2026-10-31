import React, { useState } from 'react'
import { View, Pressable, ActivityIndicator } from 'react-native'
import { Text, TextInput } from '../components/AppText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { notify } from '../lib/notify'
import { COLORS } from '../theme/colors'
import { styles } from '../theme/styles'
import { challenge, verifyChallenge } from '../lib/mfa'
import { supabase } from '../lib/supabase'
import { KeyboardScroll } from '../components/KeyboardScroll'

type Props = {
  factorId: string
  onVerified: () => void
}

export function MfaChallengeScreen({ factorId, onVerified }: Props) {
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (code.trim().length !== 6) {
      notify(t('mfa.invalidTitle'), t('mfa.invalidMsg'))
      return
    }
    setLoading(true)
    try {
      const challengeId = await challenge(factorId)
      await verifyChallenge(factorId, challengeId, code.trim())
      onVerified()
    } catch (error: any) {
      notify(t('mfa.wrongTitle'), t('mfa.wrongMsg'))
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.authMain}>
      <View style={styles.authGlow1} />
      <View style={styles.authGlow2} />
      <KeyboardScroll
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.mfaContainer}>
        <View style={styles.mfaIconCircle}>
          <Ionicons name="shield-checkmark-outline" size={36} color={COLORS.BLUE} />
        </View>
        <Text style={styles.authTitle}>{t('mfa.challengeTitle')}</Text>
        <Text style={styles.authSubtitle}>{t('mfa.challengeSubtitle')}</Text>
        <TextInput
          style={styles.mfaCodeInput}
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          placeholder="000000"
          placeholderTextColor={COLORS.TEXT_MUTED}
          maxLength={6}
          autoFocus
        />
        <Pressable style={[styles.authSubmit, { width: '100%' }, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
          <Text style={styles.authSubmitText}>{t('mfa.verify')}</Text>
          {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="arrow-forward" size={18} color="#FFF" />}
        </Pressable>
        <Pressable onPress={() => supabase.auth.signOut()} style={{ marginTop: 20 }}>
          <Text style={styles.switchText}>
            {t('mfa.cancelAnd')}<Text style={styles.switchLink}>{t('mfa.logoutLink')}</Text>
          </Text>
        </Pressable>
      </View>
      </KeyboardScroll>
    </SafeAreaView>
  )
}
