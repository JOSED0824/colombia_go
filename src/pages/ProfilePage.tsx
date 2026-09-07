import { Link } from 'react-router-dom'
import { USER } from '../data/destinations'

const ACHIEVEMENTS = [
  {
    title: 'Cazador de miradores',
    text: 'Descubriste 10+ miradores increíbles.',
    tone: 'green',
    icon: '🏔️',
  },
  {
    title: 'Noche loca',
    text: 'Estuviste en 5+ bares o discotecas.',
    tone: 'yellow',
    icon: '🪩',
  },
  {
    title: 'Amigo del Metrocable',
    text: 'Usaste 5 líneas del Metrocable.',
    tone: 'blue',
    icon: '🚡',
  },
]

export function ProfilePage() {
  return (
    <div className="page profile-page">
      <header className="profile-top">
        <h1>Mi perfil</h1>
        <button type="button" className="icon-btn icon-btn--plain" aria-label="Ajustes">
          ⚙
        </button>
      </header>

      <div className="profile-hero">
        <div className="profile-hero__art" aria-hidden="true">
          <span className="parrot">🦜</span>
          <span className="palm">🌿</span>
        </div>
        <div className="profile-photo">
          <img src={USER.photo} alt={USER.name} />
          <span className="star-badge">★</span>
        </div>
        <h2>{USER.name}</h2>
        <p className="level">
          <span>✦</span> {USER.level}
        </p>
      </div>

      <ul className="stat-card">
        <li>
          <strong>{USER.places}</strong>
          <span>📍 Lugares</span>
        </li>
        <li>
          <strong>{USER.guides}</strong>
          <span>📖 Guías</span>
        </li>
        <li>
          <strong>{USER.reviews}</strong>
          <span>★ Reseñas</span>
        </li>
      </ul>

      <section className="section">
        <div className="section__head">
          <h2>Mis logros</h2>
          <span className="more more--purple">Ver todos</span>
        </div>
        <div className="ach-row">
          {ACHIEVEMENTS.map((a) => (
            <article key={a.title} className={`ach ach--${a.tone}`}>
              <div className="ach__hex">{a.icon}</div>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="menu-list">
        <Link to="/favoritos" className="menu-item">
          <span className="menu-ico menu-ico--red">♥</span>
          <span>
            <strong>Mis favoritos</strong>
            <small>Lugares y experiencias que amas</small>
          </span>
          <span>›</span>
        </Link>
        <Link to="/viajes" className="menu-item">
          <span className="menu-ico menu-ico--blue">🗺</span>
          <span>
            <strong>Rutas guardadas</strong>
            <small>Tus rutas y recorridos personalizados</small>
          </span>
          <span>›</span>
        </Link>
        <Link to="/configuracion" className="menu-item">
          <span className="menu-ico menu-ico--purple">⚙</span>
          <span>
            <strong>Configuración</strong>
            <small>Cuenta, notificaciones y más</small>
          </span>
          <span>›</span>
        </Link>
      </nav>
    </div>
  )
}
