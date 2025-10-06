# Panel de Gestión de Cuentas de Streaming

Sistema completo para gestionar cuentas de streaming con notificaciones automáticas por WhatsApp.

## Características

- Gestión completa de cuentas (CRUD)
- Gestión de clientes y servicios
- Sistema de notificaciones automáticas
- Integración con WhatsApp (Twilio y WhatsApp Business API)
- Historial de notificaciones
- Dashboard con estadísticas
- Alertas automáticas: 5, 3, 1 días antes y al vencer

## Configuración Rápida

### 1. Ejecutar Scripts de Base de Datos

Los scripts SQL en la carpeta `scripts/` crean las tablas automáticamente:
- `001_create_tables.sql` - Crea las tablas principales
- `002_seed_data.sql` - Datos de ejemplo
- `003_remove_test_data.sql` - Elimina los datos de prueba (ejecutar después de probar el sistema)

### 2. Configurar WhatsApp

Tienes dos opciones para enviar mensajes por WhatsApp:

#### Opción A: WhatsApp Business API (Recomendado - Gratis)

**Ventajas**: Oficial de Meta, 1,000 mensajes gratis/mes, más confiable

**Configuración**: Sigue la guía completa en [WHATSAPP_BUSINESS_SETUP.md](./WHATSAPP_BUSINESS_SETUP.md)

**Variables de entorno necesarias**:
\`\`\`
WHATSAPP_BUSINESS_TOKEN=tu_token
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=tu_phone_number_id
\`\`\`

#### Opción B: Twilio (Más rápido para empezar)

**Ventajas**: Configuración en 5 minutos, ideal para pruebas

**Pasos rápidos**:
1. Crea cuenta en [twilio.com](https://www.twilio.com)
2. Ve a Console Dashboard para obtener Account SID y Auth Token
3. Activa WhatsApp Sandbox en Messaging > Try it out
4. Agrega las variables de entorno:

\`\`\`
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
\`\`\`

### 3. Probar la Integración

1. Ve a la sección "Configuración de WhatsApp" en el panel
2. Ingresa tu número de teléfono (con código de país, ejemplo: +573001234567)
3. Escribe un mensaje de prueba
4. Haz clic en "Enviar Mensaje de Prueba"
5. Deberías recibir el mensaje en WhatsApp

## Uso del Sistema

### Gestionar Cuentas

1. **Agregar Cliente**: Haz clic en "Nuevo Cliente" para agregar un cliente con nombre, teléfono y email
2. **Agregar Servicio**: Haz clic en "Nuevo Servicio" para agregar servicios como Netflix, ChatGPT, etc.
3. **Agregar Cuenta**: Haz clic en "Nueva Cuenta" para asignar un servicio a un cliente
   - Selecciona el cliente y servicio
   - Define la duración en días
   - El sistema calculará automáticamente la fecha de vencimiento
4. **Editar/Eliminar**: Usa los botones en la tabla para modificar o eliminar registros

### Sistema de Notificaciones

El sistema envía notificaciones automáticas en estos momentos:

- **5 días antes**: "Tu cuenta de [servicio] vence en 5 días..."
- **3 días antes**: "Tu cuenta de [servicio] vence en 3 días..."
- **1 día antes**: "Tu cuenta de [servicio] vence mañana..."
- **Día de vencimiento**: "Tu cuenta de [servicio] ha vencido hoy..."

#### Envío Manual

1. Haz clic en "Verificar" en el panel de notificaciones
2. El sistema mostrará cuántas notificaciones están pendientes
3. Haz clic en "Enviar Todas" para enviar las notificaciones
4. También puedes enviar notificaciones individuales desde la tabla de cuentas

#### Envío Automático

Para automatizar completamente el proceso, configura un Cron Job en Vercel:

1. Crea un archivo `vercel.json` en la raíz del proyecto:

\`\`\`json
{
  "crons": [{
    "path": "/api/notifications/send",
    "schedule": "0 9 * * *"
  }]
}
\`\`\`

2. Esto enviará notificaciones automáticamente todos los días a las 9:00 AM

Otros horarios útiles:
- `0 9 * * *` - Diario a las 9:00 AM
- `0 9,18 * * *` - Dos veces al día (9 AM y 6 PM)
- `0 9 * * 1-5` - Solo días laborables a las 9 AM

### Historial de Notificaciones

El sistema guarda un registro completo de todas las notificaciones:
- Fecha y hora de envío
- Cliente y cuenta
- Tipo de notificación (5, 3, 1 día o vencida)
- Estado (exitosa o fallida)
- Mensaje de error si falló

## Estructura de la Base de Datos

### Tablas Principales

- **customers**: Clientes con nombre, teléfono y email
- **streaming_services**: Servicios disponibles (Netflix, ChatGPT, Spotify, etc.)
- **accounts**: Cuentas asignadas con fechas de inicio, vencimiento y estado
- **notifications**: Historial completo de notificaciones enviadas

### Funciones Automáticas

- **Cálculo de vencimiento**: Al crear una cuenta, se calcula automáticamente la fecha de vencimiento
- **Actualización de estado**: Las cuentas se marcan como "expired" automáticamente al vencer
- **Prevención de duplicados**: No se envían notificaciones duplicadas para el mismo día

## Formato de Números de Teléfono

Los números deben incluir el código de país:

- ✅ Correcto: `+573001234567` (Colombia)
- ✅ Correcto: `+5491123456789` (Argentina)
- ✅ Correcto: `+525512345678` (México)
- ❌ Incorrecto: `3001234567` (sin código de país)
- ❌ Incorrecto: `+57 300 123 4567` (con espacios)

El sistema formatea automáticamente los números, pero es mejor ingresarlos correctamente desde el inicio.

## Solución de Problemas

### No se envían mensajes

1. **Verifica las variables de entorno**: Asegúrate de que estén configuradas correctamente
2. **Revisa el historial**: Ve al historial de notificaciones para ver el error específico
3. **Prueba la conexión**: Usa la sección "Configuración de WhatsApp" para enviar un mensaje de prueba

### Error: "Invalid phone number"

- El número debe incluir el código de país
- No debe tener espacios ni caracteres especiales
- Ejemplo correcto: `+573001234567`

### Error: "WhatsApp provider not configured"

- No has agregado las variables de entorno
- Ve a Project Settings (⚙️) > Environment Variables
- Agrega las credenciales de Twilio o WhatsApp Business API

### Las notificaciones se envían duplicadas

- El sistema previene duplicados automáticamente
- Solo se envía una notificación por tipo por día
- Si ves duplicados, puede ser que hayas ejecutado el envío manualmente varias veces

## Guías Detalladas

- [Configurar WhatsApp Business API](./WHATSAPP_BUSINESS_SETUP.md) - Guía paso a paso completa
- [Documentación de Twilio](https://www.twilio.com/docs/whatsapp) - Para configurar Twilio

## Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador (F12)
2. Verifica el historial de notificaciones para ver errores específicos
3. Asegúrate de que las variables de entorno estén configuradas
4. Prueba con un mensaje de prueba primero

## Próximas Mejoras

- Plantillas de mensajes personalizables
- Soporte para múltiples idiomas
- Reportes y estadísticas avanzadas
- Integración con más servicios de mensajería
