"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers" // Importar 'headers' para obtener la URL dinámicamente

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // --- CORRECCIÓN CLAVE AQUÍ ---
  // Se obtiene la URL de origen de la solicitud actual.
  // Esto funciona tanto para Vercel como para localhost de forma automática.
  const origin = headers().get('origin') || 'http://localhost:3000';

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Se usa la URL de origen para construir el enlace de redirección.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("rate limit")) {
        return { error: "Has intentado registrarte muy seguido. Por favor, espera un minuto." };
    }
    return { error: error.message }
  }

  // Si no hubo error, redirigimos a la página de éxito.
  redirect("/auth/register/success");
}
