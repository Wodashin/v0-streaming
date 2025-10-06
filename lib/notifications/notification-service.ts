import { createClient } from "@/lib/supabase/server"
import { getDaysUntilExpiration } from "@/lib/utils/date-utils"

export type NotificationType = "5_days" | "3_days" | "1_day" | "expired"

export interface AccountUserForNotification {
  name: string
  phone: string
}

export interface NotificationCheck {
  accountId: string
  users: AccountUserForNotification[] // Ahora tenemos una lista de usuarios a notificar
  serviceName: string
  expirationDate: string
  daysLeft: number
  notificationType: NotificationType
  messageTemplate: string // Se añade una plantilla para el mensaje
}

export async function getAccountsNeedingNotification(): Promise<NotificationCheck[]> {
  const supabase = await createClient()

  // 1. Obtener todas las cuentas que podrían necesitar notificación con sus usuarios
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select(
      `
      id,
      expiration_date,
      status,
      streaming_services (name),
      account_users (user_name, user_phone, status)
    `
    )
    .in("status", ["active", "expired"])
    .not("account_users", "is", null) // Solo cuentas que tengan usuarios

  if (accountsError) {
    console.error("Error fetching accounts:", accountsError)
    return []
  }
  if (!accounts) return []

  const potentialNotifications: NotificationCheck[] = []

  // 2. Determinar en memoria qué notificaciones son necesarias
  for (const account of accounts) {
    const daysLeft = getDaysUntilExpiration(account.expiration_date)
    let notificationType: NotificationType | null = null

    // Usar rangos para mayor resiliencia
    if (daysLeft <= 1 && daysLeft > 0) notificationType = "1_day"
    else if (daysLeft <= 3 && daysLeft > 1) notificationType = "3_days"
    else if (daysLeft <= 5 && daysLeft > 3) notificationType = "5_days"
    else if (daysLeft <= 0 && account.status === "expired") notificationType = "expired"

    if (notificationType) {
      const activeUsersWithPhone = account.account_users.filter(
        (user: any) => user.status === "active" && user.user_phone
      )

      if (activeUsersWithPhone.length > 0) {
        potentialNotifications.push({
          accountId: account.id,
          users: activeUsersWithPhone.map((u: any) => ({ name: u.user_name, phone: u.user_phone! })),
          serviceName: account.streaming_services?.name || "Servicio",
          expirationDate: account.expiration_date,
          daysLeft,
          notificationType,
          messageTemplate: generateNotificationMessageTemplate(account.streaming_services?.name || "Servicio", daysLeft, notificationType)
        })
      }
    }
  }

  if (potentialNotifications.length === 0) return []

  // 3. Verificar en UNA SOLA CONSULTA qué notificaciones ya se enviaron
  const accountIds = potentialNotifications.map((n) => n.accountId)
  const { data: sentNotifications } = await supabase
    .from("notifications")
    .select("account_id, notification_type")
    .in("account_id", accountIds)

  const sentSet = new Set(sentNotifications?.map((n) => `${n.account_id}-${n.notification_type}`) || [])

  // 4. Filtrar y devolver solo las que no se han enviado
  return potentialNotifications.filter(
    (p) => !sentSet.has(`${p.accountId}-${p.notificationType}`)
  )
}

// Plantilla de mensaje para personalizar por usuario
export function generateNotificationMessageTemplate(serviceName: string, daysLeft: number, type: NotificationType): string {
  // Usamos un placeholder {userName} que será reemplazado después
  switch (type) {
    case "5_days":
      return `Hola {userName}, tu cuenta de ${serviceName} vence en 5 días. Recuerda renovarla.`
    case "3_days":
      return `Hola {userName}, tu cuenta de ${serviceName} vence en 3 días. No olvides renovarla.`
    case "1_day":
      return `⚠️ Hola {userName}, tu cuenta de ${serviceName} vence MAÑANA. Renuévala para evitar interrupciones.`
    case "expired":
      return `❌ Hola {userName}, tu cuenta de ${serviceName} ha vencido.`
    default:
      return `Hola {userName}, actualización sobre tu cuenta de ${serviceName}.`
  }
}

export async function markNotificationAsSent(
  accountId: string,
  notificationType: NotificationType,
  status: "sent" | "failed" = "sent",
  errorMessage?: string,
) {
  const supabase = await createClient()

  await supabase.from("notifications").insert({
    account_id: accountId,
    notification_type: notificationType,
    status,
    error_message: errorMessage || null,
  })
}

export async function getNotificationHistory(accountId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("notifications")
    .select(`
      *,
      accounts (
        customers (
          name,
          phone
        ),
        streaming_services (
          name
        )
      )
    `)
    .order("sent_at", { ascending: false })

  if (accountId) {
    query = query.eq("account_id", accountId)
  }

  const { data } = await query
  return data || []
}
