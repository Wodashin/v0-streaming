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

  async sendMessage(to: string, message: string): Promise<SendMessageResult> {
    try {
      switch (this.config.provider) {
        case "twilio":
          return await this.sendViaTwilio(to, message)
        case "whatsapp-business":
          return await this.sendViaWhatsAppBusiness(to, message)
        case "baileys":
          return await this.sendViaBaileys(to, message)
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error("[v0] WhatsApp send error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async sendViaTwilio(to: string, message: string): Promise<SendMessageResult> {
    const { twilioAccountSid, twilioAuthToken, twilioWhatsAppNumber } = this.config

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      throw new Error("Twilio credentials not configured")
    }

    // Format phone number for WhatsApp (must include country code)
    const formattedTo = to.startsWith("+") ? to : `+${to}`
    const formattedFrom = twilioWhatsAppNumber.startsWith("whatsapp:")
      ? twilioWhatsAppNumber
      : `whatsapp:${twilioWhatsAppNumber}`

    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: formattedFrom,
        To: `whatsapp:${formattedTo}`,
        Body: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twilio API error: ${error}`)
    }

    const data = await response.json()
    return {
      success: true,
      messageId: data.sid,
    }
  }

  private async sendViaWhatsAppBusiness(to: string, message: string): Promise<SendMessageResult> {
    const { whatsappBusinessToken, whatsappBusinessPhoneNumberId } = this.config

    if (!whatsappBusinessToken || !whatsappBusinessPhoneNumberId) {
      throw new Error("WhatsApp Business API credentials not configured")
    }

    const formattedTo = to.replace(/\D/g, "")

    if (formattedTo.length < 10 || formattedTo.length > 15) {
      throw new Error("Invalid phone number format. Must be 10-15 digits including country code.")
    }

    console.log("[v0] Sending WhatsApp message to:", formattedTo)
    console.log("[v0] Using Phone Number ID:", whatsappBusinessPhoneNumberId)

    const url = `https://graph.facebook.com/v21.0/${whatsappBusinessPhoneNumberId}/messages`

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedTo,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    }

    console.log("[v0] Request payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappBusinessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()
    console.log("[v0] WhatsApp API response:", JSON.stringify(responseData, null, 2))

    if (!response.ok) {
      throw new Error(`WhatsApp Business API error: ${JSON.stringify(responseData)}`)
    }

    return {
      success: true,
      messageId: responseData.messages?.[0]?.id,
    }
  }

  private async sendViaBaileys(to: string, message: string): Promise<SendMessageResult> {
    // Baileys requires a persistent connection and QR code scanning
    // This is a placeholder - in production, you'd need a separate service
    // running Baileys with proper session management

    throw new Error(
      "Baileys provider requires a separate service. " + "Please use Twilio or WhatsApp Business API for production.",
    )
  }
}

// Factory function to create WhatsApp service from environment variables
export function createWhatsAppService(): WhatsAppService {
  // Determine which provider to use based on available env vars
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
