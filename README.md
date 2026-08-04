# Vobra Sagrada — sitio web + tienda online

Landing page y tienda online bajo el mismo dominio, con panel de administración
para cargar productos, precios y opciones de personalización. Construido con
Next.js (App Router), TypeScript, Tailwind CSS y SQLite (`better-sqlite3`).

Este es el **esqueleto funcional**: la estructura, el backend, la tienda, el
carrito, el checkout y el panel de admin ya funcionan de punta a punta. Lo que
falta es la dirección de diseño real (colores, tipografía, fotos, copy de
marca) y conectar las llaves reales de pago.

## Qué incluye

- **Landing (`/`)** — hero, historia de marca y productos destacados. Todo el
  contenido está marcado con `TODO` donde debe ir el copy/diseño definitivo.
- **Tienda (`/tienda`)** — catálogo, ficha de producto con formulario de
  personalización dinámico (texto, selección, área de texto, subida de
  imagen), carrito y checkout.
- **Panel de administración (`/admin`)** — login con contraseña, alta/edición/
  baja de productos, precio, stock, imágenes y campos de personalización.
- **Pagos** — integración con Stripe Checkout (modo prueba mientras no haya
  llaves reales; con una nota clara en pantalla si falta configurar).
- **Base de datos** — SQLite local (`data/vobra-sagrada.db`), sin
  dependencias externas ni servicios de pago de por medio para desarrollar.

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
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY`: opcionales por ahora. Sin
  ellas, el checkout muestra un aviso de "pasarela no configurada" en vez de
  fallar, y en desarrollo puedes simular un pedido de prueba para probar el
  flujo completo (carrito → checkout → gracias).

Ya dejé un `.env.local` con una contraseña de prueba (`vobra2026`) generada
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

- Las imágenes de producto se cargan por URL (una por línea) por ahora. Para
  subir archivos directamente desde el panel se necesita un servicio de
  almacenamiento (p. ej. Cloudinary, S3, o el propio almacenamiento de
  Hostinger) — es la siguiente pieza natural a agregar.

## 3. Pagos

El checkout usa [Stripe Checkout](https://stripe.com/docs/checkout/quickstart).
Para activarlo:

1. Crea una cuenta en Stripe (disponible en México).
2. Copia tus llaves de **modo prueba** desde
   `https://dashboard.stripe.com/test/apikeys` y ponlas en `.env.local`.
3. Prueba una compra completa con una [tarjeta de prueba](https://stripe.com/docs/testing)
   (`4242 4242 4242 4242`, cualquier fecha futura y CVC).
4. Cuando todo funcione, repite el proceso con tus llaves de **modo real** en
   el servidor de producción.

Si más adelante prefieres Mercado Pago (muy usado en México/LatAm) en vez de
o junto con Stripe, la integración vive en un solo archivo
(`src/app/api/checkout/route.ts`) y es un cambio acotado.

**Pendiente para producción:** agregar un webhook de Stripe que marque el
pedido como pagado en la base de datos (`src/lib/orders.ts` ya tiene
`markOrderPaid`, falta la ruta `/api/webhooks/stripe` que la invoque). Hoy el
pedido queda registrado como "pending" apenas se crea la sesión de pago.

## 4. Desplegar en tu dominio de Hostinger

Tu dominio ya está en Hostinger. Hay dos caminos según el tipo de plan que
tengas — revisa en hPanel si tu plan incluye **"Node.js"** como tipo de sitio
(Business, Cloud y VPS normalmente sí; hosting compartido básico normalmente
no).

### Opción A — Directamente en Hostinger (recomendada si tu plan soporta Node.js)

Mantiene todo bajo tu cuenta de Hostinger, sin depender de un tercero, y la
base de datos SQLite funciona tal cual porque el servidor es persistente
(no es "serverless").

1. Sube este proyecto a un repositorio de GitHub (ya tienes GitHub conectado,
   así que este paso es directo: crea un repo nuevo y haz push del código).
2. En hPanel → **Sitios web** → **Agregar sitio** (o el sitio ya creado con tu
   dominio) → busca la opción **Node.js** / "Configurar app de Node.js".
3. Conecta el repositorio de GitHub (Hostinger permite desplegar por Git) o
   sube el código por SFTP/Git manualmente.
4. Configura:
   - Comando de instalación: `npm install`
   - Comando de build: `npm run build`
   - Comando de arranque: `npm run start`
   - Variables de entorno: las mismas de tu `.env.local` (`ADMIN_SESSION_SECRET`,
     `ADMIN_PASSWORD_HASH`, `STRIPE_SECRET_KEY`, etc.) — cárgalas en la sección
     de variables de entorno del panel de Node.js, no subas el archivo
     `.env.local` al repositorio.
5. Haz respaldos periódicos del archivo `data/vobra-sagrada.db` (contiene tus
   productos y pedidos) — por ejemplo descargándolo por SFTP cada cierto
   tiempo, o migrando a una base de datos administrada más adelante.

### Opción B — Vercel + tu dominio de Hostinger (si tu plan de Hostinger no soporta Node.js)

Vercel es la plataforma que mantiene Next.js y el despliegue es prácticamente
automático conectando el repo de GitHub. La única salvedad importante:

> **Vercel ejecuta el sitio en funciones "serverless" con almacenamiento
> temporal.** Eso significa que si alguien agrega un producto desde `/admin`
> en producción, ese cambio **no se guardará de forma confiable** con la base
> SQLite actual. Para usar esta opción en producción hace falta migrar la
> base de datos a un servicio como [Turso](https://turso.tech) (SQLite en la
> nube, cambio de código mínimo) o Postgres (Supabase/Neon). Es un paso
> siguiente natural, pero no está incluido en este esqueleto.

Pasos generales si de todas formas quieres usar esta opción para probar el
diseño/landing mientras se resuelve la base de datos:

1. Sube el código a GitHub.
2. Importa el repositorio en [vercel.com](https://vercel.com).
3. Agrega las variables de entorno en la configuración del proyecto en Vercel.
4. En Hostinger, ve a **DNS / Nameservers** de tu dominio y agrega los
   registros que Vercel te indique (normalmente un registro `A` apuntando a
   `76.76.21.21` y un `CNAME` para `www`).

## 5. Estructura del proyecto

```
src/
  app/
    (site)/            → landing + tienda (layout con header/carrito)
      page.tsx          → landing "/"
      tienda/            → catálogo, ficha de producto, carrito, checkout
    admin/              → panel de administración (layout propio, sin header de tienda)
    api/                → rutas de backend (productos, checkout, login/logout)
  components/           → componentes de UI (carrito, formularios, nav de admin)
  lib/                  → acceso a datos (SQLite), auth, Stripe, tipos
scripts/
  seed.mjs               → productos de ejemplo
  hash-password.mjs      → genera el hash de la contraseña de admin
data/
  vobra-sagrada.db        → la base de datos (se crea sola al arrancar)
```

## 6. Próximos pasos sugeridos

1. **Dirección de diseño**: colores, tipografía, logo y fotografía reales de
   marca (todo el HTML/Tailwind actual es un esqueleto neutro, listo para
   restylear).
2. Copy real de la landing (historia de marca, propuesta de valor).
3. Subida de imágenes de producto directamente desde el admin (en vez de por
   URL).
4. Webhook de Stripe para marcar pedidos como pagados automáticamente.
5. Decidir la pasarela de pago definitiva (Stripe, Mercado Pago, o ambas).
6. Elegir y ejecutar el camino de despliegue (Opción A o B arriba).
