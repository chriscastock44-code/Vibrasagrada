# Vibra Sagrada — sitio web + tienda online

Landing page y tienda online bajo el mismo dominio, con panel de administración
para cargar productos, precios y opciones de personalización. Construido con
Next.js (App Router), TypeScript, Tailwind CSS y SQLite (`better-sqlite3`).

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
- **Base de datos** — SQLite local (`data/vibra-sagrada.db`), sin
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

- Las imágenes de producto se cargan por URL (una por línea) por ahora. Para
  subir archivos directamente desde el panel se necesita un servicio de
  almacenamiento (p. ej. Cloudinary, S3, o el propio almacenamiento de
  Hostinger) — es la siguiente pieza natural a agregar.

## 3. Pagos

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
     `ADMIN_PASSWORD_HASH`, `MERCADOPAGO_ACCESS_TOKEN`, etc.) — cárgalas en la
     sección de variables de entorno del panel de Node.js, no subas el
     archivo `.env.local` al repositorio.
5. Haz respaldos periódicos del archivo `data/vibra-sagrada.db` (contiene tus
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
  lib/                  → acceso a datos (SQLite), auth, Mercado Pago, tipos
scripts/
  seed.mjs               → productos de ejemplo
  hash-password.mjs      → genera el hash de la contraseña de admin
data/
  vibra-sagrada.db        → la base de datos (se crea sola al arrancar)
```

## 6. Próximos pasos sugeridos

1. Copy real de la landing (historia de marca, propuesta de valor) — la
   identidad visual ya está aplicada, falta el contenido definitivo.
2. Subida de imágenes de producto directamente desde el admin (en vez de por
   URL).
3. Conectar el `MERCADOPAGO_ACCESS_TOKEN` real y probar el flujo de pago de
   punta a punta, incluyendo el webhook de confirmación (necesita una URL
   pública — ver sección "Pagos").
4. Elegir y ejecutar el camino de despliegue (Opción A o B arriba), según el
   plan de Hostinger que tengas.
