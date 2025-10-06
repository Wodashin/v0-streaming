import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Registro Exitoso - Panel de Cuentas Streaming",
  description: "Confirma tu correo electrónico",
}

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-600 rounded-full">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">¡Cuenta Creada!</CardTitle>
          <CardDescription>Tu cuenta ha sido creada exitosamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Verifica tu correo electrónico</p>
                <p className="text-sm text-blue-700">
                  Hemos enviado un enlace de confirmación a tu correo. Haz clic en el enlace para activar tu cuenta.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Revisa tu bandeja de entrada</p>
            <p>• Si no lo ves, revisa la carpeta de spam</p>
            <p>• El enlace expira en 24 horas</p>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-center text-muted-foreground mb-2">¿El enlace no funciona?</p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/confirm">Confirmar manualmente</Link>
            </Button>
          </div>

          <Button asChild className="w-full">
            <Link href="/auth/login">Ir a Iniciar Sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
