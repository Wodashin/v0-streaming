// WhatsApp Service - Supports multiple providers
// You need to add the appropriate environment variables in Project Settings

export type WhatsAppProvider = "twilio" | "whatsapp-business" | "baileys"

export interface WhatsAppConfig {
  provider: WhatsAppProvider
  // Twilio credentials
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioWhatsAppNumber?: string
  // WhatsApp Business API credentials
  whatsappBusinessToken?: string
  whatsappBusinessPhoneNumberId?: string
  // Baileys (WhatsApp Web) - no credentials needed, uses QR code
}

export interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

export class WhatsAppService {
  private config: WhatsAppConfig

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  // Función para enviar mensajes de texto simples (usada para pruebas)
  async sendMessage(to: string, message: string): Promise<SendMessageResult> {
    try {
      switch (this.config.provider) {
        case "twilio":
          // La lógica de Twilio iría aquí si la usaras
          throw new Error("Twilio provider not fully implemented in this example.");
        case "whatsapp-business":
          return await this.sendViaWhatsAppBusinessText(to, message)
        case "baileys":
            throw new Error("Baileys provider is not supported for production.");
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error("[v0] WhatsApp send TEXT error:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // NUEVA FUNCIÓN para enviar plantillas (para notificaciones automáticas)
  async sendTemplateMessage(to: string, templateName: string, params: (string | number)[]): Promise<SendMessageResult> {
    try {
        switch (this.config.provider) {
            case "whatsapp-business":
                return await this.sendViaWhatsAppBusinessTemplate(to, templateName, params);
            default:
                throw new Error(`Template messages are only supported for WhatsApp Business provider.`);
        }
    } catch (error) {
        console.error("[v0] WhatsApp send TEMPLATE error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  private async sendViaWhatsAppBusinessText(to: string, message: string): Promise<SendMessageResult> {
    const { whatsappBusinessToken, whatsappBusinessPhoneNumberId } = this.config
    if (!whatsappBusinessToken || !whatsappBusinessPhoneNumberId) {
      throw new Error("WhatsApp Business API credentials not configured")
    }
    const formattedTo = to.replace(/\D/g, "")
    const url = `https://graph.facebook.com/v21.0/${whatsappBusinessPhoneNumberId}/messages`
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedTo,
      type: "text",
      text: { preview_url: false, body: message },
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${whatsappBusinessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const responseData = await response.json()
    if (responseData.error) {
        console.error("[v0] WhatsApp API TEXT response error:", JSON.stringify(responseData.error, null, 2));
        throw new Error(`WhatsApp Business API error: ${responseData.error.message}`);
    }
    return { success: true, messageId: responseData.messages?.[0]?.id }
  }
  
  // NUEVA FUNCIÓN INTERNA para manejar el envío de plantillas
  private async sendViaWhatsAppBusinessTemplate(to: string, templateName: string, params: (string | number)[]): Promise<SendMessageResult> {
    const { whatsappBusinessToken, whatsappBusinessPhoneNumberId } = this.config;
    if (!whatsappBusinessToken || !whatsappBusinessPhoneNumberId) {
      throw new Error("WhatsApp Business API credentials not configured");
    }

    const formattedTo = to.replace(/\D/g, "");
    const url = `https://graph.facebook.com/v21.0/${whatsappBusinessPhoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: formattedTo,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "es" // Asegúrate que coincida con el idioma de tu plantilla
        },
        components: [
          {
            type: "body",
            parameters: params.map(param => ({
              type: "text",
              text: param.toString()
            }))
          }
        ]
      }
    };

    console.log("[v0] Sending TEMPLATE payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${whatsappBusinessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("[v0] WhatsApp API TEMPLATE response:", JSON.stringify(responseData, null, 2));

    if (responseData.error) {
      throw new Error(`WhatsApp Business API error: ${JSON.stringify(responseData.error)}`);
    }

    return { success: true, messageId: responseData.messages?.[0]?.id };
  }
}

// Factory function to create WhatsApp service from environment variables
export function createWhatsAppService(): WhatsAppService {
  // ... (Esta parte no necesita cambios)
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER

  const whatsappBusinessToken = process.env.WHATSAPP_BUSINESS_TOKEN
  const whatsappBusinessPhoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID

  if (twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber) {
    return new WhatsAppService({
      provider: "twilio",
      twilioAccountSid,
      twilioAuthToken,
      twilioWhatsAppNumber,
    })
  }

  if (whatsappBusinessToken && whatsappBusinessPhoneNumberId) {
    return new WhatsAppService({
      provider: "whatsapp-business",
      whatsappBusinessToken,
      whatsappBusinessPhoneNumberId,
    })
  }

  throw new Error(
    "No WhatsApp provider configured. Please add environment variables for either:\n" +
      "1. Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER\n" +
      "2. WhatsApp Business: WHATSAPP_BUSINESS_TOKEN, WHATSAPP_BUSINESS_PHONE_NUMBER_ID",
  )
}
