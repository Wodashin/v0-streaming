"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "./actions"
import { Loader2 } from "lucide-react"

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    const result = await registerUser(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@ejemplo.com"
          required
          autoComplete="email"
          disabled={loading}
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
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          "Crear Cuenta"
        )}
      </Button>
    </form>
  )
}
