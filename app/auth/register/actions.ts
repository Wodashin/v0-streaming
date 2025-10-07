"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const origin = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
    : 'http://localhost:3000';

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" }
  }

  const supabase = await createClient()

  // Se realiza el registro (signUp)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Esta opción le dice a Supabase a dónde redirigir al usuario DESPUÉS de que haga clic en el enlace de su correo
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    // Manejo específico para el error de límite de frecuencia
    if (error.message.includes("rate limit")) {
        return { error: "Has intentado registrarte muy seguido. Por favor, espera un minuto." };
    }
    return { error: error.message }
  }

  // --- CORRECCIÓN CLAVE ---
  // Si no hubo error, redirigimos INMEDIATAMENTE a la página de éxito.
  // Esta página le dirá al usuario que revise su correo.
  redirect("/auth/register/success");
}
