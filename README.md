# Vibra Sagrada — sitio web + tienda online

Landing page y tienda online bajo el mismo dominio, con panel de administración
para cargar productos, precios y opciones de personalización. Construido con
Next.js (App Router), TypeScript, Tailwind CSS y una base de datos SQLite
(vía [Turso](https://turso.tech)/libSQL, con SQLite local como fallback en
desarrollo).

La estructura, el backend, la tienda, el carrito, el checkout y el panel de
admin funcionan de punta a punta, y ya tiene aplicada la identidad visual de
marca (logo, colores, tipografía y estilo "pop art" del brandbook). Falta
conectar las llaves reales de pago y definir el copy final de contenido.

## Qué incluye

- **Landing (`/`)** — hero, historia de marca y productos destacados, con la
  identidad visual de Vibra Sagrada ya aplicada.
- **Tienda (`/tienda`)** — catálogo, ficha de producto con formulario de
  personalización dinámico (texto, selección, área de texto, subida de
  imagen), carrito y checkout.
- **Panel de administración (`/admin`)** — login con contraseña, alta/edición/
  baja de productos, precio, stock, imágenes y campos de personalización.
- **Pagos** — integración con Mercado Pago Checkout Pro (modo prueba mientras
  no haya credenciales reales; con una nota clara en pantalla si falta
  configurar).
- **Base de datos** — SQLite compatible con Turso (libSQL): en desarrollo usa
  automáticamente un archivo local (`data/vibra-sagrada.db`), sin necesitar
  ninguna cuenta externa; en producción se conecta a una base de datos real
  en Turso (ver sección "Base de datos" más abajo — importante antes de
  desplegar).

## 1. Poner el proyecto a correr en tu computadora

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
npm run seed          # agrega 3 productos de ejemplo (solo si la base está vacía)
npm run dev
```

Abre `http://localhost:3000`. La tienda está en `/tienda` y el panel de admin
en `/admin`.

### Variables de entorno

Copia `.env.example` a `.env.local` y complétalo:

```bash
cp .env.example .env.local
```

- `ADMIN_SESSION_SECRET`: una cadena aleatoria larga. Genera una con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `ADMIN_PASSWORD_HASH`: la contraseña del panel de admin, pero **como hash**,
  nunca en texto plano. Genera uno con:
  ```bash
  npm run hash-password -- "la-contraseña-que-quieras"
  ```
  El comando te da la línea lista para pegar en `.env.local`. Importante: los
  hashes de bcrypt empiezan con `$2b$...` — Next.js interpreta `$algo` dentro
  de archivos `.env` como referencia a otra variable, así que el script ya te
  entrega el valor con los `$` escapados (`\$`). Cópialo tal cual te lo dé,
  no lo modifiques.
- `MERCADOPAGO_ACCESS_TOKEN`: opcional por ahora. Sin ella, el checkout
  muestra un aviso de "pasarela no configurada" en vez de fallar, y en
  desarrollo puedes simular un pedido de prueba para probar el flujo completo
  (carrito → checkout → gracias).

Ya dejé un `.env.local` con una contraseña de prueba (`vibra2026`) generada
automáticamente para que puedas probar el panel de admin de inmediato.
**Cámbiala antes de usar el sitio en producción.**

## 2. Panel de administración

Entra a `/admin`, inicia sesión con la contraseña configurada, y desde ahí
puedes:

- Ver todos los productos (publicados y ocultos).
- Crear uno nuevo con "+ Nuevo producto".
- Editar precio, stock, descripción, imágenes y estado (publicado/oculto).
- Definir los **campos de personalización** de cada producto como JSON. Por
  ejemplo:

  ```json
  [
    {
      "id": "texto_grabado",
      "type": "text",
      "label": "Texto a grabar",
      "required": true,
      "maxLength": 25,
      "helpText": "Máximo 25 caracteres."
    },
    {
      "id": "color",
      "type": "select",
      "label": "Color",
      "required": true,
      "options": ["Dorado", "Plateado"]
    }
  ]
  ```

  Tipos disponibles: `text`, `textarea`, `select` (con `options`), `image`
  (el cliente sube un archivo).

  Esto es intencionalmente simple para el esqueleto — un builder visual (sin
  escribir JSON) es una mejora natural para una siguiente iteración.

- Las imágenes de producto se suben directamente desde el panel (botón
  "+ Subir imagen", varias a la vez) usando Cloudinary — ver la siguiente
  sección para configurarlo. También puedes pegar una URL de imagen a mano
  si ya la tienes alojada en otro lugar.

## 3. Imágenes de producto (Cloudinary)

Las imágenes que subes desde el admin no se guardan en el disco del propio
servidor (por la misma razón que la base de datos: en hosting administrado
como Hostinger, un archivo en disco no está garantizado a sobrevivir un
redeploy o reinicio). En vez de eso, el navegador las sube directo a
[Cloudinary](https://cloudinary.com), un servicio de almacenamiento de
imágenes con un plan gratis que alcanza de sobra para una tienda chica.

Para configurarlo:

1. Crea una cuenta gratis en [cloudinary.com](https://cloudinary.com) (no
   pide tarjeta para el plan gratis).
2. En el dashboard, copia el **Cloud name** (aparece arriba, en la página
   principal del dashboard).
3. Ve a **Settings** (ícono de engrane) → pestaña **Upload** → sección
   **Upload presets** → **Add upload preset**.
   - Cambia **Signing Mode** de "Signed" a **"Unsigned"** (importante: así
     el navegador puede subir imágenes directo sin exponer ninguna
     contraseña ni llave secreta).
   - Guarda y copia el **nombre** del preset que se generó (o ponle uno tú,
     por ejemplo `vibra-sagrada`).
4. Agrega ambos valores como variables de entorno donde despliegues el sitio
   (y en tu `.env.local` si quieres probarlo en desarrollo):
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

   Nota: estas dos sí llevan el prefijo `NEXT_PUBLIC_` a propósito — no son
   secretas, el navegador las necesita para subir la imagen directamente a
   Cloudinary sin pasar por el servidor.
5. Redespliega. Ya deberías poder usar "+ Subir imagen" en el admin.

Mientras no configures esto, el botón de subir imagen muestra un error, pero
el campo para pegar una URL de imagen sigue funcionando normalmente.

## 4. Base de datos

El proyecto usa un archivo SQLite local mientras desarrollas — no necesitas
crear ninguna cuenta para correr `npm run dev`. Pero para **desplegar en
producción es obligatorio conectar una base de datos en
[Turso](https://turso.tech)** (libSQL, compatible con SQLite), por dos
razones:

1. Hostinger (y la mayoría de hostings de Node.js administrados) no permite
   compilar módulos nativos al instalar dependencias — no tienen Python ni
   herramientas de compilación disponibles. El driver de Turso no necesita
   compilar nada: descarga un binario ya compilado según tu plataforma,
   así que `npm install` funciona sin problema ahí.
2. Un archivo SQLite viviendo en el propio disco de la app no está
   garantizado a sobrevivir un redeploy o reinicio en hosting administrado.
   Turso es una base de datos de verdad en la nube: tus productos y pedidos
   quedan a salvo pase lo que pase con el servidor de la app.

Para configurarla:

1. Crea una cuenta gratis en [turso.tech](https://turso.tech).
2. Desde el dashboard, crea una base de datos nueva (dale un nombre, por
   ejemplo `vibra-sagrada`, y elige la región más cercana a tus clientes).
3. En la página de esa base de datos vas a encontrar la **Database URL**
   (empieza con `libsql://...`) y un botón para **crear un token de
   autenticación** (auth token).
4. Agrega ambos valores como variables de entorno donde despliegues el sitio
   (en Hostinger, en la sección de variables de entorno del Web App):
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
5. La primera vez que la app arranque con esas variables, crea las tablas
   automáticamente (mismo esquema que usa el archivo local) — no hace falta
   ninguna migración manual.

Si ya tenías productos cargados en el archivo local (`data/vibra-sagrada.db`)
y quieres llevarlos a Turso, la CLI de Turso incluye un comando de import
directo desde un archivo SQLite (`turso db shell <nombre> < dump.sql`, o
revisa `turso db import` en su documentación) — avísame si llegas a este
punto y te ayudo con el comando exacto.

## 5. Pagos

El checkout usa [Mercado Pago Checkout Pro](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/landing):
el cliente paga en una página alojada por Mercado Pago (tarjeta, transferencia,
efectivo en tiendas, saldo de Mercado Pago, etc.) y regresa al sitio al
terminar. Para activarlo:

1. Entra a tu [panel de desarrolladores de Mercado Pago](https://www.mercadopago.com.mx/developers/panel/app)
   y crea una aplicación (o usa la que se genera por defecto con tu cuenta).
2. En la sección **Credenciales de prueba**, copia el **Access Token** y
   ponlo en `.env.local` como `MERCADOPAGO_ACCESS_TOKEN`.
3. Prueba una compra completa usando una
   [cuenta de prueba compradora](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/additional-content/test-cards)
   y una tarjeta de prueba.
4. Cuando todo funcione, repite el proceso con el **Access Token de
   producción** (mismo panel, sección "Credenciales de producción") en el
   servidor donde despliegues el sitio.

**Confirmación de pago (webhook):** ya está implementada en
`src/app/api/mercadopago/webhook/route.ts`. Cada preferencia de pago se crea
con `notification_url` apuntando a esa ruta; Mercado Pago la llama cuando el
pago cambia de estado, la ruta consulta el pago real por su id (nunca confía
en datos que lleguen sin verificar) y, si está `approved`, marca el pedido
como pagado en la base de datos usando el `external_reference` (el id interno
del pedido) para ubicarlo. **Importante:** esto solo funciona con una URL
pública — en `localhost` Mercado Pago no puede llamarte de vuelta, así que la
confirmación automática solo se puede probar de verdad ya desplegado (o con
un túnel como [ngrok](https://ngrok.com) apuntando a tu `localhost:3000`
mientras desarrollas).

## 6. Desplegar en tu dominio de Hostinger

Tu dominio ya está en Hostinger, en un plan que incluye **Web Apps**
(despliegue de Node.js). Estos son los pasos:

1. Sube este proyecto a un repositorio de GitHub (ya tienes GitHub conectado
   a Hostinger).
2. En hPanel → **Sitios web** → **Web Apps** → **Empezar ya**.
3. Elige **Import Git Repository** y selecciona el repositorio.
4. En "¿Qué nombre de dominio quieres utilizar?", escribe tu dominio
   directamente aunque no aparezca en la lista de sugerencias (si ya está
   registrado en la misma cuenta de Hostinger, lo conecta automáticamente).
5. En "Revisa los ajustes de compilación", el preajuste **Next.js** y los
   valores por defecto ya están bien — no hace falta tocarlos.
6. Agrega las variables de entorno (botón "Añadir" → una fila por variable):
   `ADMIN_SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, `MERCADOPAGO_ACCESS_TOKEN`,
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (ver secciones "Imágenes de
   producto", "Base de datos" y "Pagos" arriba). **Ojo:** pega los
   valores tal cual, sin las barras invertidas `\` que sí lleva
   `ADMIN_PASSWORD_HASH` dentro de `.env.local` — esas solo son necesarias en
   archivos `.env`, aquí no.
7. Dale a implementar/desplegar.

**Nota sobre `better-sqlite3`:** este proyecto usa Turso (libSQL) en vez de
`better-sqlite3` precisamente porque el entorno de compilación de Hostinger
no tiene Python ni herramientas de compilación — un módulo nativo como
`better-sqlite3` falla ahí con un error de `node-gyp`. El driver de Turso no
tiene ese problema porque no compila nada, descarga un binario ya hecho.

## 7. Estructura del proyecto

```
src/
  app/
    (site)/            → landing + tienda (layout con header/carrito)
      page.tsx          → landing "/"
      tienda/            → catálogo, ficha de producto, carrito, checkout
    admin/              → panel de administración (layout propio, sin header de tienda)
    api/                → rutas de backend (productos, checkout, login/logout)
  components/           → componentes de UI (carrito, formularios, nav de admin)
  lib/                  → acceso a datos (Turso/libSQL), auth, Mercado Pago, tipos
scripts/
  seed.mjs               → productos de ejemplo
  hash-password.mjs      → genera el hash de la contraseña de admin
data/
  vibra-sagrada.db        → base de datos local para desarrollo (se crea sola,
                             no se usa en producción si TURSO_DATABASE_URL
                             está configurada)
```

## 8. Próximos pasos sugeridos

1. Copy real de la landing (historia de marca, propuesta de valor) — la
   identidad visual ya está aplicada, falta el contenido definitivo.
2. Conectar el `MERCADOPAGO_ACCESS_TOKEN` real y probar el flujo de pago de
   punta a punta, incluyendo el webhook de confirmación (necesita una URL
   pública — ver sección "Pagos").
3. Crear la base de datos en Turso y desplegar siguiendo la sección
   "Desplegar en tu dominio de Hostinger".
