import { NextResponse } from "next/server"
import { getAccountsNeedingNotification, markNotificationAsSent } from "@/lib/notifications/notification-service"
import { createWhatsAppService } from "@/lib/whatsapp/whatsapp-service"

export async function POST() {
  try {
    const notifications = await getAccountsNeedingNotification()

    if (notifications.length === 0) {
      return NextResponse.json({
        success: true,
        totalProcessed: 0,
        results: [],
        message: "No notifications to send",
      })
    }

    let whatsappService
    try {
      whatsappService = createWhatsAppService()
    } catch (error) {
      console.error("[v0] WhatsApp service initialization error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to initialize WhatsApp service",
        },
        { status: 500 },
      )
    }

    const results = []

    for (const notification of notifications) {
      try {
        const result = await whatsappService.sendMessage(notification.customerPhone, notification.message)

        if (result.success) {
          console.log("[v0] WhatsApp message sent:", {
            to: notification.customerPhone,
            messageId: result.messageId,
          })

          await markNotificationAsSent(notification.accountId, notification.notificationType, "sent")

          results.push({
            accountId: notification.accountId,
            customerName: notification.customerName,
            status: "sent",
            messageId: result.messageId,
          })
        } else {
          throw new Error(result.error || "Failed to send message")
        }
      } catch (error) {
        console.error("[v0] Error sending notification:", error)

        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        await markNotificationAsSent(notification.accountId, notification.notificationType, "failed", errorMessage)

        results.push({
          accountId: notification.accountId,
          customerName: notification.customerName,
          status: "failed",
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalProcessed: results.length,
      results,
    })
  } catch (error) {
    console.error("[v0] Error in send notifications:", error)
    return NextResponse.json({ success: false, error: "Failed to send notifications" }, { status: 500 })
  }
}
