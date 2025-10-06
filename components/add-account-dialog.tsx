"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { StreamingService } from "@/lib/types"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddAccountDialogProps {
  services: StreamingService[]
  children: React.ReactNode
}

export function AddAccountDialog({ services, children }: AddAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<StreamingService | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.from("accounts").insert({
      service_id: formData.get("service_id") as string,
      start_date: formData.get("start_date") as string,
      duration_days: Number.parseInt(formData.get("duration_days") as string),
      user_capacity: Number.parseInt(formData.get("user_capacity") as string),
      credentials: (formData.get("credentials") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })

    setLoading(false)

    if (!error) {
      setOpen(false)
      setSelectedService(null)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva Cuenta</DialogTitle>
            <DialogDescription>Crea una nueva cuenta de streaming. Podrás agregar usuarios después.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="service_id">Servicio</Label>
              <Select
                name="service_id"
                required
                onValueChange={(value) => {
                  const service = services.find((s) => s.id === value)
                  setSelectedService(service || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user_capacity">Capacidad de Usuarios</Label>
              <Input
                id="user_capacity"
                name="user_capacity"
                type="number"
                min="1"
                defaultValue={selectedService?.default_user_capacity || 1}
                key={selectedService?.id || "default"}
                required
              />
              {selectedService && (
                <p className="text-xs text-muted-foreground">
                  Capacidad por defecto para {selectedService.name}: {selectedService.default_user_capacity} usuarios
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration_days">Duración (días)</Label>
              <Input id="duration_days" name="duration_days" type="number" min="1" defaultValue="30" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credentials">Credenciales</Label>
              <Input id="credentials" name="credentials" placeholder="usuario@ejemplo.com / contraseña" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" name="notes" placeholder="Notas adicionales..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
