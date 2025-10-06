import { createClient } from "@/lib/supabase/server"
import { getDaysUntilExpiration } from "@/lib/utils/date-utils"

export type NotificationType = "5_days" | "3_days" | "1_day" | "expired"

export interface AccountUser {
  name: string
  phone: string
  email?: string
}

export interface NotificationCheck {
  accountId: string
  users: AccountUser[] // Changed from single customer to array of users
  serviceName: string
  expirationDate: string
  daysLeft: number
  notificationType: NotificationType
  message: string
}

export async function getAccountsNeedingNotification(): Promise<NotificationCheck[]> {
  const supabase = await createClient()

  const { data: accounts } = await supabase
    .from("accounts")
    .select(`
      id,
      expiration_date,
      status,
      streaming_services (
        name
      )
    `)
    .in("status", ["active", "expired"])

  if (!accounts) return []

  const notificationsNeeded: NotificationCheck[] = []

  for (const account of accounts) {
    const daysLeft = getDaysUntilExpiration(account.expiration_date)
    let notificationType: NotificationType | null = null

    // Determine if notification is needed
    if (daysLeft === 5) {
      notificationType = "5_days"
    } else if (daysLeft === 3) {
      notificationType = "3_days"
    } else if (daysLeft === 1) {
      notificationType = "1_day"
    } else if (daysLeft <= 0 && account.status === "expired") {
      notificationType = "expired"
    }

    if (notificationType) {
      // Check if notification was already sent
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("account_id", account.id)
        .eq("notification_type", notificationType)
        .single()

      // Only add if notification hasn't been sent
      if (!existingNotification) {
        const { data: accountUsers } = await supabase
          .from("account_users")
          .select("name, phone, email")
          .eq("account_id", account.id)
          .eq("status", "active")

        const usersWithPhone = (accountUsers || []).filter((user) => user.phone && user.phone.trim() !== "")

        if (usersWithPhone.length > 0) {
          const message = generateNotificationMessage(
            account.streaming_services?.name || "Servicio",
            daysLeft,
            notificationType,
          )

          notificationsNeeded.push({
            accountId: account.id,
            users: usersWithPhone.map((user) => ({
              name: user.name,
              phone: user.phone,
              email: user.email || undefined,
            })),
            serviceName: account.streaming_services?.name || "Servicio",
            expirationDate: account.expiration_date,
            daysLeft,
            notificationType,
            message,
          })
        }
      }
    }
  }

  return notificationsNeeded
}

export function generateNotificationMessage(serviceName: string, daysLeft: number, type: NotificationType): string {
  switch (type) {
    case "5_days":
      return `Hola, tu cuenta de ${serviceName} vence en 5 días (${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES")}). Recuerda renovarla para seguir disfrutando del servicio.`
    case "3_days":
      return `Hola, tu cuenta de ${serviceName} vence en 3 días (${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES")}). No olvides renovarla pronto.`
    case "1_day":
      return `⚠️ Hola, tu cuenta de ${serviceName} vence MAÑANA. Renuévala hoy para evitar la interrupción del servicio.`
    case "expired":
      return `❌ Hola, tu cuenta de ${serviceName} ha vencido. Ya no podrás acceder a esta cuenta. Contáctanos para renovar tu suscripción.`
    default:
      return `Hola, actualización sobre tu cuenta de ${serviceName}.`
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
