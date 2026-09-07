import { useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'colombiago-settings'

type Settings = {
  notifications: boolean
  location: boolean
  reduceMotion: boolean
}

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  location: true,
  reduceMotion: false,
}

function readSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(readSettings)

  function updateSetting(key: keyof Settings) {
    setSettings((current) => {
      const next = { ...current, [key]: !current[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="page settings-page">
      <header className="page-head settings-head">
        <Link to="/perfil" className="back-link" aria-label="Volver al perfil">←</Link>
        <div>
          <h1>Configuración</h1>
          <p>Personaliza tu experiencia ColombiaGO</p>
        </div>
      </header>

      <section className="settings-section">
        <p className="settings-label">Preferencias</p>
        <div className="settings-list">
          <SettingRow
            title="Notificaciones"
            description="Novedades, recomendaciones y viajes"
            enabled={settings.notifications}
            onChange={() => updateSetting('notifications')}
            tone="red"
          />
          <SettingRow
            title="Usar mi ubicación"
            description="Recomendaciones cerca de ti"
            enabled={settings.location}
            onChange={() => updateSetting('location')}
            tone="blue"
          />
        </div>
      </section>

      <section className="settings-section">
        <p className="settings-label">Tu cuenta</p>
        <div className="settings-list settings-links">
          <Link to="/viajes"><span>✦</span><strong>Rutas guardadas</strong><b>›</b></Link>
          <Link to="/favoritos"><span>♥</span><strong>Mis favoritos</strong><b>›</b></Link>
        </div>
      </section>
    </div>
  )
}

type SettingRowProps = {
  title: string
  description: string
  enabled: boolean
  onChange: () => void
  tone: string
}

function SettingRow({ title, description, enabled, onChange, tone }: SettingRowProps) {
  return (
    <div className="setting-row">
      <span className={`setting-row__icon setting-row__icon--${tone}`} aria-hidden="true">●</span>
      <span className="setting-row__copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <button
        type="button"
        className={`switch ${enabled ? 'is-on' : ''}`}
        aria-pressed={enabled}
        aria-label={`${title}: ${enabled ? 'activado' : 'desactivado'}`}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  )
}
