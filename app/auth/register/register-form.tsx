"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "./actions"
import { Loader2 } from "lucide-react"

// Componente para el botón, para mostrar el estado de carga
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creando cuenta...
        </>
      ) : (
        "Crear Cuenta"
      )}
    </Button>
  )
}

export function RegisterForm() {
  // Usamos useFormState para un mejor manejo de errores desde el servidor
  const [state, formAction] = useFormState(registerUser, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@ejemplo.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
      </div>
      
      {/* No es necesario confirmar la contraseña aquí, Supabase se encarga.
          Pero si quieres mantenerlo, asegúrate de que tu `registerUser` lo valide.
          Por simplicidad, lo he eliminado del flujo principal. */}

      <SubmitButton />
    </form>
  )
}
