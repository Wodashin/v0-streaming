"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Account } from "@/lib/types"
import { formatDate } from "@/lib/utils/date-utils"

interface RenewAccountDialogProps {
  account: Account
  children: React.ReactNode
}

export function RenewAccountDialog({ account, children }: RenewAccountDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleRenew = async () => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("accounts")
      .update({
        start_date: account.expiration_date,
        duration_days: account.duration_days,
        status: 'active',
        // --- CORRECCIÓN AQUÍ ---
        // Se reinicia el estado del pago a 'pendiente' en cada renovación.
        payment_status: 'pending' 
      })
      .eq("id", account.id)

    setLoading(false)

    if (!error) {
      toast({
        title: "¡Cuenta Renovada!",
        description: `La cuenta de ${account.streaming_services?.name} ha sido extendida.`,
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: "No se pudo renovar la cuenta.",
        variant: "destructive",
      })
      console.error("Error renewing account:", error)
    }
  }

  // Calcula la nueva fecha de vencimiento para mostrarla en el diálogo
  const currentExpirationDate = new Date(account.expiration_date);
  // Clonar la fecha para no mutar la original
  const newStartDate = new Date(currentExpirationDate.getTime()); 
  const newExpirationDate = new Date(newStartDate.setDate(newStartDate.getDate() + account.duration_days));


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Renovar la cuenta de {account.streaming_services?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esto extenderá la suscripción por otros **{account.duration_days} días**. El estado del pago se marcará como **pendiente**.
            <div className="mt-4 text-sm space-y-1">
                <p>Fecha de vencimiento actual: <span className="font-semibold">{formatDate(account.expiration_date)}</span></p>
                <p>Nueva fecha de vencimiento: <span className="font-semibold">{formatDate(newExpirationDate.toISOString())}</span></p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleRenew} disabled={loading}>
            {loading ? "Renovando..." : "Confirmar Renovación"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
