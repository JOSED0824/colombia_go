import { Link } from 'react-router-dom'
import { USER } from '../data/destinations'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function HomeHeader({ value, onChange }: Props) {
  return (
    <header className="home-head">
      <Link to="/perfil" className="home-head__user">
        <img src={USER.photo} alt="" />
        <span>¡Hola, {USER.firstName}! 🇨🇴</span>
      </Link>
      <button type="button" className="icon-btn icon-btn--plain" aria-label="Notificaciones">
        <span className="notif-dot" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9a6 6 0 1 1 12 0c0 7 2 8 2 8H4s2-1 2-8" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      </button>
      <label className="search search--home">
        <span className="search__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="¿Qué quieres descubrir hoy?"
        />
      </label>
    </header>
  )
}
