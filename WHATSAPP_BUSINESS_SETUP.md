# Guía Completa: Configurar WhatsApp Business API (Meta Cloud API)

Esta es la opción oficial y gratuita de Meta para enviar mensajes por WhatsApp. Es la más recomendada para uso profesional.

## Ventajas

- ✅ **Gratis**: 1,000 conversaciones gratis por mes
- ✅ **Oficial**: Directamente de Meta/Facebook
- ✅ **Confiable**: No hay riesgo de bloqueo
- ✅ **Escalable**: Puedes crecer sin problemas
- ✅ **Profesional**: Verificación de negocio disponible

## Paso 1: Crear Cuenta en Meta for Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Haz clic en **"Get Started"** o **"Comenzar"**
3. Inicia sesión con tu cuenta de Facebook (o crea una nueva)
4. Completa el proceso de registro como desarrollador

## Paso 2: Crear una App de Negocio

1. En el dashboard, haz clic en **"Create App"** o **"Crear aplicación"**
2. Selecciona el tipo: **"Business"** o **"Empresa"**
3. Completa la información:
   - **App Name**: "Panel Cuentas Streaming" (o el nombre que prefieras)
   - **App Contact Email**: Tu email
   - **Business Account**: Selecciona o crea una cuenta de negocio
4. Haz clic en **"Create App"** o **"Crear aplicación"**

## Paso 3: Agregar WhatsApp al Proyecto

1. En el dashboard de tu app, busca **"WhatsApp"** en la lista de productos
2. Haz clic en **"Set Up"** o **"Configurar"**
3. Espera a que se configure el producto (puede tomar unos segundos)

## Paso 4: Obtener las Credenciales

### 4.1 Obtener el Token de Acceso (Access Token)

1. En el menú lateral, ve a **WhatsApp > Getting Started** o **WhatsApp > Primeros pasos**
2. Verás una sección llamada **"Temporary access token"** o **"Token de acceso temporal"**
3. Haz clic en **"Copy"** para copiar el token
4. **IMPORTANTE**: Este token es temporal (24 horas). Más adelante crearemos uno permanente.

### 4.2 Obtener el Phone Number ID

1. En la misma página, busca la sección **"Phone number ID"**
2. Verás un número largo (ejemplo: `123456789012345`)
3. Copia este número

### 4.3 Número de Teléfono de Prueba

Meta te proporciona un número de prueba automáticamente. Lo verás en la sección **"From"** o **"De"**.

## Paso 5: Configurar Variables de Entorno en v0

1. En v0, haz clic en el ícono de **engranaje** (⚙️) en la esquina superior derecha
2. Ve a **"Environment Variables"** o **"Variables de entorno"**
3. Agrega las siguientes variables:

\`\`\`
WHATSAPP_BUSINESS_TOKEN=tu_token_copiado_en_paso_4.1
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=tu_phone_number_id_del_paso_4.2
\`\`\`

4. Haz clic en **"Save"** o **"Guardar"**

## Paso 6: Agregar Números de Prueba

Antes de poder enviar mensajes, necesitas agregar números de teléfono de prueba:

1. En Meta for Developers, ve a **WhatsApp > Getting Started**
2. Busca la sección **"To"** o **"Para"**
3. Haz clic en **"Add phone number"** o **"Agregar número de teléfono"**
4. Ingresa tu número de WhatsApp (con código de país, ejemplo: +573001234567)
5. Recibirás un código de verificación por WhatsApp
6. Ingresa el código para verificar el número

**IMPORTANTE**: En modo de prueba, solo puedes enviar mensajes a números que hayas agregado aquí.

## Paso 7: Probar el Envío

1. En tu panel de v0, ve a la sección **"Configuración de WhatsApp"**
2. Ingresa el número que verificaste en el paso 6
3. Escribe un mensaje de prueba
4. Haz clic en **"Enviar Mensaje de Prueba"**
5. Deberías recibir el mensaje en WhatsApp en unos segundos

## Paso 8: Crear Token Permanente (Producción)

El token temporal expira en 24 horas. Para producción, necesitas un token permanente:

### Opción A: Token de Sistema (Recomendado)

1. Ve a **WhatsApp > Configuration** o **WhatsApp > Configuración**
2. Busca **"System Users"** o **"Usuarios del sistema"**
3. Haz clic en **"Create System User"** o **"Crear usuario del sistema"**
4. Dale un nombre (ejemplo: "WhatsApp Bot")
5. Selecciona el rol: **"Admin"**
6. Haz clic en **"Create System User"**
7. Haz clic en **"Generate New Token"** o **"Generar nuevo token"**
8. Selecciona tu app
9. Selecciona los permisos: `whatsapp_business_messaging` y `whatsapp_business_management`
10. Copia el token generado
11. Actualiza la variable `WHATSAPP_BUSINESS_TOKEN` en v0 con este nuevo token

### Opción B: Token de Usuario

1. Ve a **Settings > Basic** o **Configuración > Básica**
2. Busca **"App Secret"**
3. Usa la Graph API Explorer para generar un token de larga duración
4. Sigue las instrucciones en [developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived)

## Paso 9: Pasar a Producción

Para enviar mensajes a cualquier número (no solo los de prueba):

1. **Verificar Negocio**:
   - Ve a **Business Settings** en Meta Business Suite
   - Completa la verificación de negocio (requiere documentos)

2. **Agregar Número de Teléfono Propio**:
   - Ve a **WhatsApp > Phone Numbers**
   - Haz clic en **"Add phone number"**
   - Sigue el proceso de verificación
   - Costo: Gratis, pero necesitas un número que no esté en WhatsApp

3. **Solicitar Aprobación**:
   - Una vez verificado, puedes enviar mensajes a cualquier número
   - Las primeras 1,000 conversaciones por mes son gratis

## Límites y Precios

### Modo de Prueba (Gratis)
- Solo números verificados manualmente
- Límite: 5 números de prueba
- Perfecto para desarrollo

### Modo de Producción
- **Gratis**: Primeras 1,000 conversaciones/mes
- **Después**: $0.005 - $0.09 por conversación (varía por país)
- Una "conversación" = ventana de 24 horas con un usuario

### Límites de Mensajes
- **Tier 1** (inicio): 1,000 usuarios únicos/día
- **Tier 2**: 10,000 usuarios únicos/día
- **Tier 3**: 100,000 usuarios únicos/día
- Los tiers aumentan automáticamente según tu uso

## Solución de Problemas

### Error: "Invalid access token"
- El token expiró (si es temporal)
- Crea un token permanente (Paso 8)

### Error: "Recipient phone number not valid"
- El número no está en formato internacional (+código_país + número)
- Ejemplo correcto: +573001234567

### Error: "Cannot send message to this recipient"
- En modo de prueba, el número no está verificado
- Agrega el número en el paso 6

### No recibo mensajes
- Verifica que el número esté en WhatsApp
- Revisa que el formato sea correcto
- Asegúrate de haber verificado el número en modo de prueba

## Recursos Adicionales

- [Documentación Oficial](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Guía de Inicio Rápido](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Precios](https://developers.facebook.com/docs/whatsapp/pricing)
- [Límites de Mensajes](https://developers.facebook.com/docs/whatsapp/messaging-limits)

## Comparación con Twilio

| Característica | WhatsApp Business API | Twilio |
|----------------|----------------------|---------|
| Costo inicial | Gratis (1,000/mes) | Pago desde el inicio |
| Configuración | Más pasos | Más rápido |
| Oficial | Sí (Meta) | No (tercero) |
| Verificación | Requerida para producción | No requerida |
| Límites | Escala automáticamente | Según plan |
| Mejor para | Producción a largo plazo | Pruebas rápidas |

## Siguiente Paso

Una vez configurado, tu sistema enviará automáticamente notificaciones cuando las cuentas estén por vencer. Puedes automatizar el proceso completamente usando Vercel Cron Jobs (ver README.md).
