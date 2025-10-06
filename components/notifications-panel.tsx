"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Send, RefreshCw, CheckCircle, XCircle, Users } from "lucide-react"
import { useRouter } from "next/navigation"

// Interfaz actualizada para reflejar los cambios del backend
interface Notification {
  accountId: string
  users: { name: string; phone: string }[]
  serviceName: string
  daysLeft: number
  notificationType: string
  messageTemplate: string
}

interface SendResult {
    accountId: string;
    userName: string;
    status: 'sent' | 'failed';
    error?: string;
}

export function NotificationsPanel() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [results, setResults] = useState<SendResult[]>([])
  const router = useRouter()

  const checkNotifications = async () => {
    setChecking(true)
    setResults([]) // Limpiar resultados anteriores
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
      const response = await fetch("/api/notifications/send", { method: "POST" })
      const data = await response.json()
      if (data.success) {
        setResults(data.results || [])
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
    // ... (sin cambios)
  }

  const getNotificationTypeBadge = (type: string) => {
    // ... (sin cambios)
  }

  return (
    <Card>
      <CardHeader>
        {/* ... (sin cambios en el header) ... */}
      </CardHeader>
      <CardContent>
        {/* ... (sin cambios en el estado inicial) ... */}

        {notifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Notificaciones Pendientes</h3>
            {notifications.map((notification, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{notification.serviceName}</p>
                    {/* CORRECCIÓN AQUÍ: Mostramos el número de usuarios a notificar */}
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4" />
                      <span>Se notificará a {notification.users.length} usuario(s)</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getNotificationTypeBadge(notification.notificationType)}>
                    {getNotificationTypeLabel(notification.notificationType)}
                  </Badge>
                </div>
                <div className="bg-muted p-3 rounded text-sm italic">
                  "{notification.messageTemplate.replace('{userName}', '[Nombre de Usuario]')}"
                </div>
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
                  {result.status === "sent" ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                  <div>
                    <p className="font-medium text-sm">{result.userName}</p>
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
