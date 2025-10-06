"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function WhatsAppConfigCard() {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTesting(true)
    setTestResult(null)

    const formData = new FormData(e.currentTarget)
    const phoneInput = formData.get("phone") as string

    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneInput,
          message: formData.get("message"),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTestResult({
          success: true,
          message: `Mensaje enviado exitosamente. ID: ${data.messageId}`,
        })
      } else {
        setTestResult({
          success: false,
          message: data.error || "Error al enviar mensaje",
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <div>
                  <CardTitle>Configuración de WhatsApp</CardTitle>
                  <CardDescription>Prueba la integración de WhatsApp enviando un mensaje de prueba</CardDescription>
                </div>
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Variables de Entorno Requeridas</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">Opción 1: Twilio</p>
                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                      <li>TWILIO_ACCOUNT_SID</li>
                      <li>TWILIO_AUTH_TOKEN</li>
                      <li>TWILIO_WHATSAPP_NUMBER</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Opción 2: WhatsApp Business API</p>
                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                      <li>WHATSAPP_BUSINESS_TOKEN</li>
                      <li>WHATSAPP_BUSINESS_PHONE_NUMBER_ID</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Agrega estas variables en Project Settings (ícono de engranaje arriba a la derecha)
                </p>
              </div>

              <form onSubmit={handleTest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Teléfono</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="56948842564" required />
                  <p className="text-xs text-muted-foreground">
                    Solo números con código de país (ej: 56948842564 para Chile, 521234567890 para México)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje de Prueba</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Hola, este es un mensaje de prueba del sistema de notificaciones."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" disabled={testing} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {testing ? "Enviando..." : "Enviar Mensaje de Prueba"}
                </Button>
              </form>

              {testResult && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    testResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{testResult.success ? "Éxito" : "Error"}</p>
                    <p className="text-sm text-muted-foreground mt-1 break-words">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
