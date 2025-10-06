"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, CheckCircle, XCircle } from "lucide-react"

interface NotificationHistoryItem {
  id: string
  notification_type: string
  sent_at: string
  status: string
  error_message: string | null
  accounts: {
    customers: {
      name: string
      phone: string
    }
    streaming_services: {
      name: string
    }
  }
}

export function NotificationHistory() {
  const [history, setHistory] = useState<NotificationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/notifications/history")
      const data = await response.json()

      if (data.success) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error("[v0] Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "5_days":
        return "5 días antes"
      case "3_days":
        return "3 días antes"
      case "1_day":
        return "1 día antes"
      case "expired":
        return "Cuenta vencida"
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Cargando historial...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Notificaciones
        </CardTitle>
        <CardDescription>Registro de todas las notificaciones enviadas</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay notificaciones en el historial</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-start justify-between border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  {item.status === "sent" ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.accounts.customers.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.accounts.streaming_services.name} • {item.accounts.customers.phone}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.sent_at)}</p>
                    {item.error_message && <p className="text-xs text-red-600">Error: {item.error_message}</p>}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getNotificationTypeLabel(item.notification_type)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
