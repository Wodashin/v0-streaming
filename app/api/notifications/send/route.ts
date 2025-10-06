import { NextResponse } from "next/server"
import { getAccountsNeedingNotification, markNotificationAsSent } from "@/lib/notifications/notification-service"
import { createWhatsAppService } from "@/lib/whatsapp/whatsapp-service"

export async function POST() {
  try {
    const notificationsToSend = await getAccountsNeedingNotification()

    if (notificationsToSend.length === 0) {
      return NextResponse.json({
        success: true,
        totalProcessed: 0,
        results: [],
        message: "No hay notificaciones nuevas para enviar.",
      })
    }

    let whatsappService;
    try {
        whatsappService = createWhatsAppService();
    } catch(e) {
        return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
    
    const results = [];
    let totalProcessed = 0;

    for (const notification of notificationsToSend) {
      let allUsersNotified = true;
      totalProcessed++;
      
      // Itera sobre cada usuario de la cuenta
      for (const user of notification.users) {
        try {
          // Personaliza el mensaje para cada usuario
          const message = notification.messageTemplate.replace('{userName}', user.name);
          const result = await whatsappService.sendMessage(user.phone, message);

          if (!result.success) {
            allUsersNotified = false;
            console.error(`[v0] Failed to send to ${user.name} (${user.phone}): ${result.error}`);
          }
          results.push({
            accountId: notification.accountId,
            userName: user.name,
            phone: user.phone,
            status: result.success ? "sent" : "failed",
            error: result.error,
          });
        } catch (error) {
          allUsersNotified = false;
          results.push({
            accountId: notification.accountId,
            userName: user.name,
            phone: user.phone,
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      // Marcar la notificación como enviada solo si todos los usuarios fueron notificados con éxito
      if (allUsersNotified) {
        await markNotificationAsSent(notification.accountId, notification.notificationType, "sent");
      } else {
        await markNotificationAsSent(notification.accountId, notification.notificationType, "failed", "One or more users failed to receive the notification.");
      }
    }

    return NextResponse.json({ success: true, totalProcessed, results });
  } catch (error) {
    console.error("[v0] CRITICAL ERROR in /api/notifications/send:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
