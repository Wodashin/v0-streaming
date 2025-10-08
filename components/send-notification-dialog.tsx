"use client"

import type React from "react"
import { useState } from "react"
import type { Account, AccountUser } from "@/lib/types"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface SendNotificationDialogProps {
  account: Account
  children: React.ReactNode
}

interface SendResult {
  phone: string;
  success: boolean;
  message: string;
}

export function SendNotificationDialog({ account, children }: SendNotificationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("") // Usado solo para la previsualización
  const [results, setResults] = useState<SendResult[]>([])
  const [selectedUsers, setSelectedUsers] = useState<AccountUser[]>([])
  const router = useRouter()

  const accountUsersWithPhone = account.account_users?.filter(u => u.user_phone) || [];

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setSelectedUsers(accountUsersWithPhone);
      setResults([]);
      const daysLeft = getDaysUntilExpiration(account.expiration_date);
      const serviceName = account.streaming_services?.name || "tu servicio";
      
      // Texto para la previsualización
      const baseMessage = daysLeft <= 0
        ? `Recordatorio: Tu cuenta de ${serviceName} ha vencido.`
        : `Recordatorio: Tu cuenta de ${serviceName} vencerá en ${daysLeft} día(s).`;
      
      setMessage(baseMessage);
    }
  }

  const handleSend = async () => {
    if (selectedUsers.length === 0) return;
    setLoading(true);
    setResults([]);
    
    const daysLeft = getDaysUntilExpiration(account.expiration_date);
    
    const sendPromises = selectedUsers.map(async (user) => {
      try {
        // Preparamos los datos para enviar la plantilla
        const templateName = 'recordatorio_vencimiento_stream'; // El nombre de tu plantilla
        const params = [
          account.streaming_services?.name || 'tu servicio', // Parámetro {{1}}
          daysLeft.toString()                               // Parámetro {{2}}
        ];

        // Llamamos a la API dedicada para enviar plantillas
        const response = await fetch("/api/whatsapp/send-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: user.user_phone,
            templateName: templateName,
            params: params,
          }),
        });

        const data = await response.json();
        return {
          phone: user.user_phone!,
          success: data.success,
          message: data.success ? "Plantilla enviada con éxito" : (data.error || "Error desconocido"),
        };
      } catch (error) {
        return {
          phone: user.user_phone!,
          success: false,
          message: error instanceof Error ? error.message : "Error de red",
        };
      }
    });

    const settledResults = await Promise.all(sendPromises);
    setResults(settledResults);
    setLoading(false);
    if (settledResults.some(r => r.success)) {
      router.refresh();
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    setSelectedUsers(checked ? accountUsersWithPhone : []);
  };

  const handleUserSelection = (user: AccountUser, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Notificación Manual</DialogTitle>
          <DialogDescription>
            Enviar un recordatorio de vencimiento a los usuarios de la cuenta "{account.streaming_services?.name}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {accountUsersWithPhone.length > 0 ? (
            <>
              <div>
                <Label className="font-semibold">Seleccionar destinatarios</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedUsers.length === accountUsersWithPhone.length && accountUsersWithPhone.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="font-bold">Seleccionar todos</Label>
                  </div>
                  {accountUsersWithPhone.map(user => (
                    <div key={user.id} className="flex items-center space-x-2 ml-2">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.some(su => su.id === user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user, !!checked)}
                      />
                      <Label htmlFor={user.id} className="font-normal">
                        {user.user_name} ({user.user_phone})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Previsualización del Mensaje (se enviará como plantilla)</Label>
                <Textarea
                  id="message"
                  value={message}
                  readOnly
                  rows={4}
                  className="resize-none bg-muted text-muted-foreground"
                />
                 <p className="text-xs text-muted-foreground">Este es solo un ejemplo. El mensaje final será el de tu plantilla aprobada en WhatsApp.</p>
              </div>

              {results.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-md border p-2">
                    <Label>Resultados del Envío</Label>
                    {results.map((result, index) => (
                        <Alert key={`${result.phone}-${index}`} variant={result.success ? 'default' : 'destructive'} className="flex items-center gap-2 text-xs">
                            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertDescription>
                                <strong>{result.phone}:</strong> {result.message}
                            </AlertDescription>
                        </Alert>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>Esta cuenta no tiene usuarios con números de teléfono registrados para enviar notificaciones.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
          {accountUsersWithPhone.length > 0 && (
            <Button onClick={handleSend} disabled={loading || selectedUsers.length === 0}>
              {loading ? "Enviando..." : `Enviar a ${selectedUsers.length} usuario(s)`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent
