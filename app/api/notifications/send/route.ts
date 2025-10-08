import { NextResponse } from "next/server";
import { getAccountsNeedingNotification, markNotificationAsSent } from "@/lib/notifications/notification-service";
import { createWhatsAppService } from "@/lib/whatsapp/whatsapp-service";

export async function POST() {
  try {
    const notificationsToSend = await getAccountsNeedingNotification();

    if (notificationsToSend.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay notificaciones nuevas para enviar.",
      });
    }

    const whatsappService = createWhatsAppService();
    const results = [];

    for (const notification of notificationsToSend) {
      // Solo procesar notificaciones de 1 día
      if (notification.notificationType !== '1_day') {
        continue;
      }

      let allUsersNotified = true;
      
      for (const user of notification.users) {
        try {
          // Usamos el nombre exacto de tu nueva plantilla
          const templateName = 'recordatorio_vencimiento_stream';

          // Preparamos los parámetros en el orden correcto de tu plantilla:
          // {{1}} = Nombre del servicio
          // {{2}} = Días restantes
          const params = [
            notification.serviceName,
            notification.daysLeft.toString()
          ];
          
          const result = await whatsappService.sendTemplateMessage(user.phone, templateName, params);
          
          if (!result.success) {
            allUsersNotified = false;
            console.error(`[v0] Failed to send to ${user.name} (${user.phone}): ${result.error}`);
          }
          results.push({
            userName: user.name,
            phone: user.phone,
            status: result.success ? "sent" : "failed",
            error: result.error,
          });
        } catch (error) {
          allUsersNotified = false;
          results.push({
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
        await markNotificationAsSent(notification.accountId, notification.notificationType, "failed", "One or more users failed to receive notification.");
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("[v0] CRITICAL ERROR in /api/notifications/send:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
