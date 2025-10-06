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

    // Lógica principal: la nueva fecha de inicio es la fecha de vencimiento actual.
    // La duración se mantiene igual que la original de la cuenta.
    const { error } = await supabase
      .from("accounts")
      .update({
        start_date: account.expiration_date, // La nueva fecha de inicio es el vencimiento actual
        duration_days: account.duration_days,   // Mantenemos la duración original
        status: 'active' // Se asegura de que la cuenta se reactive si estaba vencida
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
  const newExpirationDate = new Date(currentExpirationDate.setDate(currentExpirationDate.getDate() + account.duration_days));

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Renovar la cuenta de {account.streaming_services?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esto extenderá la suscripción por otros **{account.duration_days} días** a partir de la fecha de vencimiento actual.
            <br />
            <br />
            Fecha de vencimiento actual: **{formatDate(account.expiration_date)}**
            <br />
            Nueva fecha de vencimiento: **{formatDate(newExpirationDate.toISOString())}**
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
