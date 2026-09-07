import { NavLink } from 'react-router-dom'
import { Logo } from './Logo'

type Props = {
  open: boolean
  onClose: () => void
}

export function SideMenu({ open, onClose }: Props) {
  return (
    <>
      <div className={`drawer-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open || undefined}>
        <Logo />
        <p className="drawer__tag">Explora. Connecta. vive Colombia.</p>
        <nav className="drawer__nav">
          <NavLink to="/" onClick={onClose}>
            Inicio
          </NavLink>
          <NavLink to="/explorar" onClick={onClose}>
            Explorar
          </NavLink>
          <NavLink to="/viajes" onClick={onClose}>
            Viajes
          </NavLink>
          <NavLink to="/favoritos" onClick={onClose}>
            Favoritos
          </NavLink>
          <NavLink to="/perfil" onClick={onClose}>
            Perfil
          </NavLink>
        </nav>
      </aside>
    </>
  )
}
