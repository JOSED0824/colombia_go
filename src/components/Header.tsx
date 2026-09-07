import { Logo } from './Logo'

type HeaderProps = {
  onMenu: () => void
  title?: string
  subtitle?: string
  overlay?: boolean
}

export function Header({ onMenu, title, subtitle, overlay = false }: HeaderProps) {
  return (
    <header className={`topbar ${overlay ? 'topbar--overlay' : ''}`}>
      <button type="button" className="icon-btn" onClick={onMenu} aria-label="Abrir menú">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>
      <div className="topbar__titles">
        {title ? (
          <>
            <p className="topbar__kicker">{title}</p>
            {subtitle && <p className="topbar__sub">{subtitle}</p>}
          </>
        ) : (
          <Logo />
        )}
      </div>
      <button type="button" className="icon-btn" aria-label="Notificaciones">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9a6 6 0 1 1 12 0c0 7 2 8 2 8H4s2-1 2-8" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      </button>
    </header>
  )
}
