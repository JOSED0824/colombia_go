# Colombia Go

Colombia Go es una guía visual para descubrir lugares, planes y destinos de Colombia. La aplicación reúne recomendaciones de gastronomía, cultura, naturaleza y vida nocturna en una interfaz pensada para explorar sin complicaciones.

# Qué incluye

- Página de inicio con destinos destacados y categorías.
- Exploración de destinos con filtros por categoría.
- Fichas individuales con descripción, horario, precio, transporte y dirección.
- Guías de viaje y rutas guardadas.
- Sección de favoritos persistida durante la sesión.
- Perfil y configuración de la experiencia.
- Diseño responsive para escritorio y móvil.

# Tecnologías

- React 19
- TypeScript
- Vite
- React Router
- CSS
  
Posible adaptación en futuras versiones 

Los destinos y las guías están definidos como datos locales dentro de `src/data`. No hay una API ni una base de datos conectada en esta versión.

# Empezar

Necesitas tener Node.js instalado.

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación, normalmente `http://localhost:5173`.

Para generar una versión de producción:

```bash
npm run build
npm run preview
```

# Estructura principal

```text
src/
├── components/   Componentes reutilizables de la interfaz
├── context/      Estado de favoritos y rutas guardadas
├── data/         Destinos y guías de ejemplo
├── pages/        Vistas principales de la aplicación
├── App.tsx       Rutas de la aplicación
└── styles.css    Estilos globales
```

Las imágenes utilizadas por los destinos están en `public/images`.

# Rutas disponibles

| Ruta | Vista |
| --- | --- |
| `/` | Inicio |
| `/explorar` | Explorar destinos |
| `/guias` | Guías |
| `/viajes` | Rutas guardadas |
| `/favoritos` | Favoritos |
| `/perfil` | Perfil |
| `/configuracion` | Configuración |
| `/destino/:id` | Detalle de un destino |

# Scripts

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: comprueba TypeScript y crea el build de producción.
- `npm run preview`: sirve localmente el build generado.
