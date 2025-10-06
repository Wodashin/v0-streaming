"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Send, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Notification {
  accountId: string
  customerName: string
  customerPhone: string
  serviceName: string
  daysLeft: number
  notificationType: string
  message: string
}

export function NotificationsPanel() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [results, setResults] = useState<any[]>([])
  const router = useRouter()

  const checkNotifications = async () => {
    setChecking(true)
    try {
      const response = await fetch("/api/notifications/check")
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error("[v0] Error checking notifications:", error)
    } finally {
      setChecking(false)
    }
  }

  const sendNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setNotifications([])
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Error sending notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "5_days":
        return "5 días"
      case "3_days":
        return "3 días"
      case "1_day":
        return "1 día"
      case "expired":
        return "Vencida"
      default:
        return type
    }
  }

  const getNotificationTypeBadge = (type: string) => {
    switch (type) {
      case "5_days":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "3_days":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "1_day":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      case "expired":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Sistema de Notificaciones
            </CardTitle>
            <CardDescription className="mt-2">Verifica y envía notificaciones automáticas por WhatsApp</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={checkNotifications} disabled={checking}>
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`} />
              Verificar
            </Button>
            {notifications.length > 0 && (
              <Button size="sm" onClick={sendNotifications} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Todas ({notifications.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay notificaciones pendientes</p>
            <p className="text-sm mt-2">Haz clic en "Verificar" para buscar cuentas que necesiten notificación</p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Notificaciones Pendientes</h3>
            {notifications.map((notification, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{notification.customerName}</p>
                    <p className="text-sm text-muted-foreground">{notification.customerPhone}</p>
                  </div>
                  <Badge variant="secondary" className={getNotificationTypeBadge(notification.notificationType)}>
                    {getNotificationTypeLabel(notification.notificationType)}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{notification.serviceName}</span>
                  {notification.daysLeft >= 0 ? (
                    <span className="text-muted-foreground">
                      {" "}
                      - Vence en {notification.daysLeft} día{notification.daysLeft !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400"> - Cuenta vencida</span>
                  )}
                </div>
                <div className="bg-muted p-3 rounded text-sm">{notification.message}</div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Resultados del Envío</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {result.status === "sent" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{result.customerName}</p>
                    {result.error && <p className="text-xs text-red-600">{result.error}</p>}
                  </div>
                </div>
                <Badge variant={result.status === "sent" ? "default" : "destructive"}>
                  {result.status === "sent" ? "Enviado" : "Error"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
