import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AccountsTable } from "@/components/accounts-table"
import { StatsCards } from "@/components/stats-cards"
import { NotificationsPanel } from "@/components/notifications-panel"
import { NotificationHistory } from "@/components/notification-history"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { AddCustomerDialog } from "@/components/add-customer-dialog"
import { ManageServicesDialog } from "@/components/manage-services-dialog"
import { UserSearchDialog } from "@/components/user-search-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Users, Settings, LogOut } from "lucide-react"
import { InactiveUsersPanel } from "@/components/inactive-users-panel"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: accounts } = await supabase
    .from("accounts")
    .select(`
      *,
      customers ( id, name, phone, email ),
      streaming_services ( id, name, default_user_capacity ),
      account_users ( id, user_name, user_email, user_phone, profile_name, is_primary )
    `)
    .order("expiration_date", { ascending: true })

  const { data: customers } = await supabase.from("customers").select("*").order("name")

  const { data: services } = await supabase.from("streaming_services").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Panel de Cuentas</h1>
            <p className="text-muted-foreground mt-2">Gestiona tus cuentas de streaming y notificaciones</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <UserSearchDialog />
            <ManageServicesDialog services={services || []}>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Servicios
              </Button>
            </ManageServicesDialog>
            {/* CAMBIO: El texto del botón ahora es "Nuevo Usuario" */}
            <AddCustomerDialog>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </AddCustomerDialog>
            <AddAccountDialog services={services || []}>
              <Button size="sm" data-add-account-trigger>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cuenta
              </Button>
            </AddAccountDialog>
            <form action="/auth/logout" method="post">
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>

        <StatsCards accounts={accounts || []} />
        <InactiveUsersPanel />
        <NotificationsPanel />
        <AccountsTable accounts={accounts || []} customers={customers || []} services={services || []} />
        <NotificationHistory />
      </div>
    </div>
  )
}
