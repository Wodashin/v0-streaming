import { NextResponse } from "next/server";
import { createWhatsAppService } from "@/lib/whatsapp/whatsapp-service";

export async function POST(request: Request) {
  try {
    const { phone, templateName, params } = await request.json();

    if (!phone || !templateName || !params) {
      return NextResponse.json({ success: false, error: "Phone, templateName, and params are required" }, { status: 400 });
    }

    const whatsappService = createWhatsAppService();
    const result = await whatsappService.sendTemplateMessage(phone, templateName, params);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: "Template message sent successfully",
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("[v0] WhatsApp send-template error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send template message",
      },
      { status: 500 }
    );
  }
}
