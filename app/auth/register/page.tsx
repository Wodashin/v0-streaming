import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "./register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Crear Cuenta - Panel de Cuentas",
  description: "Crea una cuenta de administrador para acceder al panel.",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-8 w-8" />
          <CardTitle className="text-2xl font-bold">Crear Cuenta de Administrador</CardTitle>
          <CardDescription>Completa el formulario para registrarte.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
            <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
