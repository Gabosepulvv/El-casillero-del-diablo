# 🏷️ Ventas Gabriel

Tienda personal para vender cosas que ya no uso. Pensada para compartir el link en TikTok/Instagram y que la gente vea los productos y te escriba por WhatsApp desde el celular.

**Qué hace**

- 🛍️ **Catálogo público**: fotos, precio, descripción, estado del 1 al 10, categorías, buscador, filtros (disponibles / vendidos / todos) y orden por precio o estado.
- 📸 **Página de cada producto**: galería deslizable con zoom, barra de estado, botón *Compartir*.
- 💬 **Botón "Contactar por WhatsApp"**: abre un chat contigo con un mensaje listo que dice qué producto estaba viendo, su precio y el link.
- 🛠️ **Panel `/admin`** con contraseña: subir productos (fotos desde el celular, se comprimen solas), editar, marcar vendido y eliminar.
- 📱 100% responsive (mobile first).

Stack: Next.js + Supabase (base de datos y fotos) + Vercel (hosting). Todo en planes **gratuitos**.

> ℹ️ GitHub Pages no sirve para esto porque solo aloja páginas estáticas (no puede guardar productos ni fotos). Usa **Vercel**, que es gratis y se conecta directo a este repo de GitHub.

---

## 🚀 Puesta en marcha (≈15 minutos)

### 1. Supabase (base de datos + fotos)

1. Crea una cuenta en <https://supabase.com> → **New project** (elige región São Paulo para Chile/LatAm).
2. Ve a **SQL Editor → New query**, pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql) y presiona **Run**.
3. Ve a **Project Settings → API** (o *API Keys*) y copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta, no la compartas)

### 2. Vercel (publicar la web)

1. Entra a <https://vercel.com> con tu cuenta de GitHub → **Add New → Project** → importa `el-casillero-del-diablo`.
2. En **Environment Variables** agrega las variables de [`.env.example`](.env.example):

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | del paso 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | del paso 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | del paso 1 |
   | `ADMIN_PASSWORD` | la contraseña que quieras para tu panel |
   | `NEXT_PUBLIC_WHATSAPP` | tu número con código de país, sin + ni espacios (ej. `56912345678`) |
   | `NEXT_PUBLIC_INSTAGRAM` | tu usuario de IG sin @ (opcional) |
   | `NEXT_PUBLIC_SITE_URL` | `https://tu-proyecto.vercel.app` (opcional) |

3. **Deploy**. Listo: tu link es `https://tu-proyecto.vercel.app` 🎉
4. Entra a `https://tu-proyecto.vercel.app/admin`, pon tu contraseña y sube tu primer producto.

> Si cambias variables en Vercel después, haz **Redeploy** para que se apliquen.

---

## 📲 Uso diario

- **Subir producto**: `/admin` → **＋ Nuevo producto** → fotos (la primera es la portada, puedes reordenarlas con ← →), título, precio, categoría, estado 1–10, descripción.
- **Te escriben**: te llega un WhatsApp tipo *"¡Hola! Me interesa "PS4 Slim" ($180.000) que vi en tu tienda: <link> ¿Sigue disponible?"*.
- **Vendiste algo**: botón **✓ Marcar vendido** — queda en la pestaña *Vendidos* con un sello y sin botón de contacto.

## 🏷️ Precio original en tienda

Cada producto puede tener (opcional) el **link a una tienda** y el **precio nuevo**. En la página del producto aparece la sección *"Precio original en tienda"* con el botón **Consultar precio original en …** y cuánto ahorra el comprador.

Si tu base de datos se creó antes de esta función, corre una vez [`supabase/migrations/002_precio_original.sql`](supabase/migrations/002_precio_original.sql) en **Supabase → SQL Editor**.

## 💻 Desarrollo local

```bash
cp .env.example .env.local   # completa los valores
npm install
npm run dev                  # http://localhost:3000
```

## Personalización

`NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_STORE_TAGLINE`, `NEXT_PUBLIC_CURRENCY` (ej. `CLP`, `USD`, `MXN`) y `NEXT_PUBLIC_LOCALE` (ej. `es-CL`) cambian el nombre, la frase y el formato de precios. Los colores están en `app/globals.css`.
