# 😈 El Casillero del Diablo

Tienda personal para vender cosas que ya no uso. Pensada para compartir el link en TikTok/Instagram y que la gente vea los productos desde el celular.

**Qué hace**

- 🛍️ **Catálogo público**: fotos, precio, descripción, estado del 1 al 10, categorías, buscador, filtros (disponibles / vendidos / todos) y orden por precio o estado.
- 📸 **Página de cada producto**: galería deslizable con zoom, barra de estado, botón *Compartir*.
- 💸 **Ofertas**: el comprador ofrece un monto y deja su **teléfono/WhatsApp o Instagram**. Sin registro.
- 🔔 **Notificación al instante** en tu celular vía **Telegram** cada vez que alguien ofrece.
- 🛠️ **Panel `/admin`** con contraseña: subir productos (fotos desde el celular, se comprimen solas), editar, marcar vendido, eliminar y ver todas las ofertas con botón directo a WhatsApp/Instagram del comprador.
- 📱 100% responsive (mobile first).

Stack: Next.js + Supabase (base de datos y fotos) + Vercel (hosting). Todo en planes **gratuitos**.

> ℹ️ GitHub Pages no sirve para esto porque solo aloja páginas estáticas (no puede recibir ofertas ni guardar productos). Usa **Vercel**, que es gratis y se conecta directo a este repo de GitHub.

---

## 🚀 Puesta en marcha (≈15 minutos)

### 1. Supabase (base de datos + fotos)

1. Crea una cuenta en <https://supabase.com> → **New project** (elige región São Paulo para Chile/LatAm).
2. Ve a **SQL Editor → New query**, pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) y presiona **Run**.
3. Ve a **Project Settings → API** (o *API Keys*) y copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta, no la compartas)

### 2. Telegram (notificaciones de ofertas)

1. En Telegram habla con **@BotFather** → `/newbot` → sigue los pasos. Te da un **token** → `TELEGRAM_BOT_TOKEN`.
2. Abre el chat de tu bot nuevo y mándale cualquier mensaje (ej. "hola").
3. Abre en el navegador `https://api.telegram.org/bot<TU_TOKEN>/getUpdates` y busca `"chat":{"id":123456789` → ese número es `TELEGRAM_CHAT_ID`.

(Si lo dejas vacío, las ofertas igual se guardan y las ves en `/admin`.)

### 3. Vercel (publicar la web)

1. Entra a <https://vercel.com> con tu cuenta de GitHub → **Add New → Project** → importa `el-casillero-del-diablo`.
2. En **Environment Variables** agrega las variables de [`.env.example`](.env.example):

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | del paso 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | del paso 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | del paso 1 |
   | `ADMIN_PASSWORD` | la contraseña que quieras para tu panel |
   | `TELEGRAM_BOT_TOKEN` | del paso 2 |
   | `TELEGRAM_CHAT_ID` | del paso 2 |
   | `NEXT_PUBLIC_INSTAGRAM` | tu usuario de IG sin @ (opcional) |
   | `NEXT_PUBLIC_SITE_URL` | `https://tu-proyecto.vercel.app` (opcional) |

3. **Deploy**. Listo: tu link es `https://tu-proyecto.vercel.app` 🎉
4. Entra a `https://tu-proyecto.vercel.app/admin`, pon tu contraseña y sube tu primer producto.

> Si cambias variables en Vercel después, haz **Redeploy** para que se apliquen.

---

## 📲 Uso diario

- **Subir producto**: `/admin` → **＋ Nuevo producto** → fotos (la primera es la portada, puedes reordenarlas con ← →), título, precio, categoría, estado 1–10, descripción.
- **Llega una oferta**: te suena Telegram con el monto, el % respecto a tu precio y un link directo al WhatsApp/IG del comprador.
- **Vendiste algo**: botón **✓ Marcar vendido** — queda en la pestaña *Vendidos* con un sello, y ya no acepta ofertas.

## 💻 Desarrollo local

```bash
cp .env.example .env.local   # completa los valores
npm install
npm run dev                  # http://localhost:3000
```

## Personalización

`NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_STORE_TAGLINE`, `NEXT_PUBLIC_CURRENCY` (ej. `CLP`, `USD`, `MXN`) y `NEXT_PUBLIC_LOCALE` (ej. `es-CL`) cambian el nombre, la frase y el formato de precios. Los colores están en `app/globals.css`.
