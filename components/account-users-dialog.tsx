"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Plus, Trash2, UserCheck, Mail, Phone, User } from "lucide-react"
import type { Account, AccountUser } from "@/lib/types"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface AccountUsersDialogProps {
  account: Account
  children?: React.ReactNode
}

export function AccountUsersDialog({ account, children }: AccountUsersDialogProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<AccountUser[]>(account.account_users || [])
  const [newUser, setNewUser] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    profile_name: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("account_users")
      .select("*")
      .eq("account_id", account.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true })

    if (!error && data) {
      setUsers(data)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.user_name.trim()) return

    if (users.length >= account.user_capacity) {
      alert(`Esta cuenta solo permite ${account.user_capacity} usuarios`)
      return
    }

    setIsLoading(true)
    const { error } = await supabase.from("account_users").insert({
      account_id: account.id,
      user_name: newUser.user_name,
      user_email: newUser.user_email || null,
      user_phone: newUser.user_phone || null,
      profile_name: newUser.profile_name || null,
      is_primary: users.length === 0,
    })

    if (error) {
      console.error("Error adding user:", error)
      alert("Error al agregar usuario")
    } else {
      setNewUser({ user_name: "", user_email: "", user_phone: "", profile_name: "" })
      await loadUsers()
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return

    setIsLoading(true)
    const { error } = await supabase.from("account_users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      alert("Error al eliminar usuario")
    } else {
      await loadUsers()
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleSetPrimary = async (userId: string) => {
    setIsLoading(true)

    // Remove primary from all users
    await supabase.from("account_users").update({ is_primary: false }).eq("account_id", account.id)

    // Set new primary
    const { error } = await supabase.from("account_users").update({ is_primary: true }).eq("id", userId)

    if (error) {
      console.error("Error setting primary:", error)
      alert("Error al establecer usuario principal")
    } else {
      await loadUsers()
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" onClick={() => loadUsers()}>
            <Users className="h-4 w-4 mr-2" />
            Usuarios ({users.length}/{account.user_capacity})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Usuarios de la Cuenta - {account.streaming_services?.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Capacidad: {users.length} de {account.user_capacity} usuarios
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Users */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Usuarios Actuales</h3>
            {users.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay usuarios agregados</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.user_name}</span>
                            {user.is_primary && (
                              <Badge variant="default" className="text-xs">
                                Principal
                              </Badge>
                            )}
                          </div>
                          {user.profile_name && (
                            <p className="text-sm text-muted-foreground">Perfil: {user.profile_name}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {user.user_email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.user_email}
                              </div>
                            )}
                            {user.user_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.user_phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!user.is_primary && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSetPrimary(user.id)}
                              disabled={isLoading}
                              title="Establecer como principal"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add New User */}
          {users.length < account.user_capacity && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Agregar Nuevo Usuario</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="user_name">Nombre del Usuario *</Label>
                  <Input
                    id="user_name"
                    value={newUser.user_name}
                    onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile_name">Nombre del Perfil</Label>
                  <Input
                    id="profile_name"
                    value={newUser.profile_name}
                    onChange={(e) => setNewUser({ ...newUser, profile_name: e.target.value })}
                    placeholder="Juan (opcional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user_email">Email</Label>
                  <Input
                    id="user_email"
                    type="email"
                    value={newUser.user_email}
                    onChange={(e) => setNewUser({ ...newUser, user_email: e.target.value })}
                    placeholder="juan@ejemplo.com (opcional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user_phone">Teléfono</Label>
                  <Input
                    id="user_phone"
                    value={newUser.user_phone}
                    onChange={(e) => setNewUser({ ...newUser, user_phone: e.target.value })}
                    placeholder="+1234567890 (opcional)"
                  />
                </div>
                <Button onClick={handleAddUser} disabled={isLoading || !newUser.user_name.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
