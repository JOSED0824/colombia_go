import { NavLink } from 'react-router-dom'

const ITEMS = [
  { to: '/', label: 'Inicio', icon: HomeIcon },
  { to: '/explorar', label: 'Explorar', icon: ExploreIcon },
  { to: '/guias', label: 'Guías', icon: GuidesIcon },
  { to: '/favoritos', label: 'Favoritos', icon: FavIcon },
  { to: '/perfil', label: 'Perfil', icon: ProfileIcon },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Principal">
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
        >
          <span className="bottom-nav__icon">
            <Icon />
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  )
}

function ExploreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 15 1.2-3.8L15 9l-1.2 3.8z" />
    </svg>
  )
}

function GuidesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4h11v16H8z" />
      <path d="M8 4a3 3 0 0 0-3 3v13h3" />
      <path d="M11 8h5M11 12h5" />
    </svg>
  )
}

function FavIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.6-9.5-8.2C.4 9.8 2.1 6 5.6 6c2 0 3.3 1.1 4.4 2.6C11.1 7.1 12.4 6 14.4 6c3.5 0 5.2 3.8 3.1 6.8C19 16.4 12 21 12 21z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1.4-3.2 3.8-4.8 7-4.8s5.6 1.6 7 4.8" />
    </svg>
  )
}
