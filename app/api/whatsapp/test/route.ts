import { NextResponse } from "next/server"
import { createWhatsAppService } from "@/lib/whatsapp/whatsapp-service"

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ success: false, error: "Phone and message are required" }, { status: 400 })
    }

    const whatsappService = createWhatsAppService()
    const result = await whatsappService.sendMessage(phone, message)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: "Test message sent successfully",
      })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] WhatsApp test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send test message",
      },
      { status: 500 },
    )
  }
}
