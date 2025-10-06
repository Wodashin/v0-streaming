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
import { DashboardCharts } from "@/components/dashboard-charts" // <-- Importar componente de gráficos

export default async function Home() {
  const supabase = await createClient()

  // ... (código de autenticación sin cambios)

  const { data: accounts } = await supabase
    .from("accounts")
    .select(`
      *,
      customers ( id, name, phone, email ),
      streaming_services ( id, name, default_user_capacity ),
      account_users ( * ),
      payments ( * )
    `)
    .order("expiration_date", { ascending: true })

  const { data: customers } = await supabase.from("customers").select("*").order("name")
  const { data: services } = await supabase.from("streaming_services").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header (sin cambios) */}

        <StatsCards accounts={accounts || []} />
        
        {/* NUEVO: Gráficos del Dashboard */}
        <DashboardCharts accounts={accounts || []} />

        <InactiveUsersPanel />
        <NotificationsPanel />
        <AccountsTable accounts={accounts || []} customers={customers || []} services={services || []} />
        <NotificationHistory />
      </div>
    </div>
  )
}
