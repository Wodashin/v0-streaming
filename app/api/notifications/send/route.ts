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
      
      for (const user of notification.users) {
        try {
          // --- ESTA ES LA PARTE QUE CAMBIA ---
          // 1. Determina el nombre de la plantilla a usar
          const templateName = notification.daysLeft === 1 
            ? 'vencimiento_singular' // Debes crear esta plantilla para el caso de 1 día
            : 'notificacion_vencimiento_dias'; // La que ya creaste

          // 2. Prepara los parámetros en el orden correcto {{1}}, {{2}}, {{3}}
          const params = [
            user.name,                      // Parámetro {{1}}
            notification.serviceName,       // Parámetro {{2}}
            notification.daysLeft.toString() // Parámetro {{3}}
          ];
          
          // 3. Llama a la nueva función para enviar plantillas
          const result = await whatsappService.sendTemplateMessage(user.phone, templateName, params);
          // --- FIN DEL CAMBIO ---

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
