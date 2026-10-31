// Insignias de los logros (hoja original cortada en mobile/assets/badges). La base guarda
// `icono = 'badge:<nombre>'` en cada logro; si el icono no es una insignia (p. ej. un emoji) se muestra tal cual.
const BADGES: Record<string, any> = {
  globe: require('../../assets/badges/globe.png'),
  map: require('../../assets/badges/map.png'),
  compass: require('../../assets/badges/compass.png'),
  passport: require('../../assets/badges/passport.png'),
  camera: require('../../assets/badges/camera.png'),
  mountain: require('../../assets/badges/mountain.png'),
  church: require('../../assets/badges/church.png'),
  beach: require('../../assets/badges/beach.png'),
  plane: require('../../assets/badges/plane.png'),
  trophy: require('../../assets/badges/trophy.png'),
}

export function badgeImage(icono: string | null | undefined) {
  return icono?.startsWith('badge:') ? BADGES[icono.slice('badge:'.length)] : undefined
}
