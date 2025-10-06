import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "./register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Registro - Panel de Cuentas Streaming",
  description: "Crear cuenta de administrador",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>Registra tu cuenta de administrador para acceder al panel</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
