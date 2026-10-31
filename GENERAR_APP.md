# Cómo generar la app instalable de ColombiaGO (APK / iPhone)

La app ya no necesita tu PC: el backend está desplegado en Render (`https://colombiago-api.onrender.com`) y la base de datos
en Supabase. Estos pasos generan un instalador con **EAS Build** (el servicio de compilación de Expo). Todo se corre desde la
carpeta `mobile/`.

> **Idea clave:** las variables `EXPO_PUBLIC_*` se **incrustan al compilar**. Si cambias la URL de la API o la clave de
> Supabase, hay que volver a generar el instalador.

---

## 0. ¿Qué necesitas?

| Para | Necesitas | Costo |
|---|---|---|
| **Android (APK)** | Cuenta de Expo | Gratis |
| **iPhone (instalar en tu teléfono / TestFlight)** | Cuenta de Expo + **Apple Developer Program** | 99 USD/año |
| Solo probar en tu teléfono sin instalar nada | Expo Go (lo que usas ahora) | Gratis |

Sin cuenta de Apple Developer **no se puede** instalar una app propia en un iPhone real; en iPhone sigue usando Expo Go.

---

## 1. Preparar herramientas (una sola vez)

```bash
npm install -g eas-cli
eas login
eas whoami
```

- `eas whoami` debe mostrar **tu** cuenta de Expo. Si sale otra (por ejemplo `juangaviria`), ejecuta `eas logout` y vuelve a
  `eas login`.
- Si el navegador no se abre al iniciar sesión, usa usuario y contraseña en la terminal, o crea un token en
  https://expo.dev/settings/access-tokens y ejecútalo así:
  ```bash
  set EXPO_TOKEN=tu_token        # Windows (cmd)
  $env:EXPO_TOKEN="tu_token"     # Windows (PowerShell)
  ```

## 2. Configurar el proyecto (una sola vez)

```bash
cd mobile
eas build:configure
```

Esto crea `eas.json`. Reemplaza su contenido por este (genera un **APK** instalable para Android en el perfil `preview`):

```json
{
  "cli": { "version": ">= 16.0.0", "appVersionSource": "remote" },
  "build": {
    "preview": {
      "distribution": "internal",
      "environment": "preview",
      "android": { "buildType": "apk" }
    },
    "production": {
      "environment": "production",
      "autoIncrement": true
    }
  },
  "submit": { "production": {} }
}
```

## 3. Guardar las variables en EAS

El archivo `.env` **no** se envía a los servidores de Expo, así que las variables se registran allí (una vez por entorno;
repite con `--environment production` si vas a publicar en tiendas):

```bash
eas env:create --name EXPO_PUBLIC_API_URL --value https://colombiago-api.onrender.com --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://ozbvwugphvmbbrwceyzo.supabase.co --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_KEY --value TU_CLAVE_PUBLISHABLE --environment preview --visibility plaintext
```

- `TU_CLAVE_PUBLISHABLE` está en tu `mobile/.env` (`EXPO_PUBLIC_SUPABASE_KEY`). Es una clave pensada para ir dentro de la app.
- **Nunca** pongas aquí la contraseña de la base de datos ni la clave de Gemini: esas viven solo en Render.
- La URL de la API debe empezar por **https** y no terminar en `/`.
- Para revisar lo guardado: `eas env:list --environment preview`.

## 4. (Recomendado) Permisos de ubicación

El botón "mi ubicación" del mapa necesita permisos declarados en el instalador. En `mobile/app.json`, dentro de `"expo"`, agrega:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.colombiago.app",
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "ColombiaGO usa tu ubicación para mostrarte los lugares cercanos en el mapa."
  }
},
"android": {
  "package": "com.colombiago.app",
  "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
}
```

(Conserva lo que ya tengan `ios` y `android`: `adaptiveIcon`, `predictiveBackGestureEnabled`, etc. Solo añade estas claves.)

## 5A. Generar el APK de Android (gratis)

```bash
eas build --platform android --profile preview
```

1. La primera vez pregunta si crear el *keystore* (la llave de firma): responde **Yes** (EAS lo guarda por ti).
2. La compilación corre en la nube; en el plan gratis puede tardar entre 10 y 40 minutos por la cola.
3. Al terminar muestra un **enlace y un código QR**. Ábrelo desde el teléfono Android, descarga el `.apk` e instálalo
   (permite "instalar apps de orígenes desconocidos" cuando lo pida).
4. También puedes verlo en https://expo.dev → tu proyecto → **Builds**.

## 5B. iPhone

Requiere la cuenta **Apple Developer** (99 USD/año). Hay dos caminos:

**Opción 1 – Instalación directa en tu iPhone (Ad Hoc)**

```bash
eas device:create          # registra tu iPhone (escanea el QR desde el iPhone)
eas build --platform ios --profile preview
```

En la configuración de `eas.json`, el perfil `preview` con `"distribution": "internal"` ya sirve para esto. EAS te pedirá
iniciar sesión con tu Apple ID y creará los certificados. Al terminar, abre el enlace desde el iPhone para instalarlo
(en iOS 16+ activa **Ajustes → Privacidad y seguridad → Modo desarrollador**).

**Opción 2 – TestFlight / App Store**

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

La app queda en TestFlight para probarla; luego se envía a revisión de Apple para publicarla.

## 6. Verificar que funciona

Con la app instalada:

1. Abre la app: debe cargar Inicio con lugares y fotos (si sale "no se pudo conectar", la URL de la API en EAS está mal).
2. Regístrate: debe llegar el **código de 6 dígitos al correo** (revisa las plantillas en Supabase, ver
   `ColombiaGo.Backend/docs/supabase-email-templates.md`).
3. Prueba Explorar → "Ver en el mapa", un detalle de lugar, Guías y la pestaña IA.

## 7. Cuando cambies algo

| Cambio | Qué hacer |
|---|---|
| Código de la app | Volver a ejecutar `eas build ...` |
| URL de la API o claves de Supabase | `eas env:update` (o `eas env:create`) y volver a compilar |
| Código del backend | Solo `git push`: Render redespliega solo, **no** hay que recompilar la app |

## 8. Problemas frecuentes

- **`Network request failed` / datos vacíos:** abre `https://colombiago-api.onrender.com/health`; debe decir `Healthy`. Si
  dice otra cosa, revisa los registros en Render. Verifica también `eas env:list` (https, sin `/` final).
- **La primera petición tarda mucho:** el plan gratis de Render se duerme tras 15 minutos sin uso. Con el plan *Starter* no pasa.
- **`You're signed in to Expo Go as ...` / cuenta distinta:** `eas whoami`, `eas logout`, `eas login`.
- **El build falla en `Install dependencies`:** ejecuta `npx expo-doctor` en `mobile/` y corrige lo que reporte.
- **El correo con el código no llega:** revisa Authentication → Email Templates y SMTP en Supabase.

---

### Resumen rápido (Android)

```bash
npm install -g eas-cli
eas login
cd mobile
eas build:configure                 # y pega el eas.json de arriba
eas env:create ...                  # las 3 variables (paso 3)
eas build --platform android --profile preview
```
