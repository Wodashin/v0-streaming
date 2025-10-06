"use client"

import type React from "react"

import { useState } from "react"
import type { Account } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getDaysUntilExpiration } from "@/lib/utils/date-utils"
import { useRouter } from "next/navigation"

interface SendNotificationDialogProps {
  account: Account
  children: React.ReactNode
}

export function SendNotificationDialog({ account, children }: SendNotificationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const router = useRouter()
  const daysLeft = getDaysUntilExpiration(account.expiration_date)

  const defaultMessage =
    daysLeft <= 0
      ? `Hola ${account.customers?.name}, tu cuenta de ${account.streaming_services?.name} ha vencido. Ya no podrás acceder a esta cuenta. Contáctanos para renovar.`
      : `Hola ${account.customers?.name}, tu cuenta de ${account.streaming_services?.name} vence en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}. Recuerda renovarla para seguir disfrutando del servicio.`

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setMessage(defaultMessage)
      setResult(null)
    }
  }

  const handleSend = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: account.customers?.phone,
          message: message,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: "Mensaje enviado exitosamente por WhatsApp",
        })
        router.refresh()
        setTimeout(() => setOpen(false), 2000)
      } else {
        setResult({
          success: false,
          message: data.error || "Error al enviar mensaje",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Notificación</DialogTitle>
          <DialogDescription>Enviar mensaje de WhatsApp a {account.customers?.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Teléfono</Label>
            <div className="text-sm text-muted-foreground">{account.customers?.phone}</div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          {result && (
            <div
              className={`p-3 rounded-lg text-sm ${
                result.success
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "bg-red-500/10 text-red-700 dark:text-red-400"
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Enviando..." : "Enviar WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
