# Panel de Gestión de Cuentas de Streaming

Sistema completo para gestionar cuentas de streaming con **notificaciones automáticas por Telegram** — 100% gratuito, sin límites de mensajes.

## ✨ Características

- Gestión completa de cuentas (crear, editar, eliminar)
- Gestión de clientes y servicios (Netflix, Spotify, ChatGPT, etc.)
- Notificaciones automáticas por **Telegram Bot** (gratis e ilimitado)
- Historial de notificaciones enviadas
- Dashboard con estadísticas y gráficos
- Alertas automáticas: 1 día antes y al vencer
- Reporte financiero
- Autenticación segura con Supabase

## 🚀 Instalación

### 1. Clona el repositorio

```bash
git clone <tu-repo>
cd v0-streaming
pnpm install
```

### 2. Configura Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (gratis)
2. Ve a **SQL Editor** y ejecuta los scripts en orden:
   - `scripts/001_create_tables.sql`
   - `scripts/002_seed_data.sql` *(opcional)*
   - `scripts/004_add_account_users.sql`
   - `scripts/005_add_row_level_security.sql`
   - `scripts/006_user_lifecycle_management.sql`
   - `scripts/007_make_customer_optional.sql`
3. En **Project Settings > API** copia tus claves

### 3. Crea tu Telegram Bot (5 minutos, gratis)

1. Abre Telegram y busca **@BotFather**
2. Escribe `/newbot` y sigue las instrucciones
3. Copia el **token** que te entrega (ej: `123456789:ABC-DEF1234...`)

### 4. Variables de entorno

Crea `.env.local` en la raíz:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF1234...
```

### 5. Ejecuta

```bash
pnpm dev
```

---

## 📱 Cómo usar Telegram

### Obtener el Chat ID de un cliente

1. El cliente escribe **primero** al bot (cualquier mensaje)
2. Visita: `https://api.telegram.org/bot<TU_TOKEN>/getUpdates`
3. Copia el número en `"chat":{"id":XXXXXXX}`
4. Guarda ese número en el campo **Teléfono** del usuario en el panel

### Probar el bot

En el panel, abre **"Configuración de Telegram"**, ingresa un Chat ID y envía un mensaje de prueba.

---

## 🔔 Notificaciones automáticas

| Momento | Mensaje |
|---|---|
| 1 día antes | ⚠️ "Tu cuenta de [servicio] vence mañana" |
| Día de vencimiento | 🔴 "Tu cuenta de [servicio] ha vencido hoy" |

### Cron Job automático en Vercel

Crea `vercel.json` en la raíz:

```json
{
  "crons": [{
    "path": "/api/notifications/send",
    "schedule": "0 9 * * *"
  }]
}
```

---

## ☁️ Deploy en Vercel

1. Sube a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. Agrega las variables de entorno en **Project Settings**
4. Deploy ✅

---

## ❓ Problemas frecuentes

**El bot no envía mensajes**
- El cliente debe haber iniciado conversación con el bot primero
- Verifica que el Chat ID (solo números) esté en el campo "Teléfono" del usuario

**Error: "chat not found"**
- El Chat ID es incorrecto o el cliente aún no ha escrito al bot
