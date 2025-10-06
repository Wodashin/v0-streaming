"use client"

import { useState } from "react"
import type { Account, Customer, StreamingService } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EditAccountDialog } from "@/components/edit-account-dialog"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import { SendNotificationDialog } from "@/components/send-notification-dialog"
import { EmptyState } from "@/components/empty-state"
import { AccountUsersDialog } from "@/components/account-users-dialog"
import {
  getDaysUntilExpiration,
  getStatusBadgeColor,
  getExpirationBadgeColor,
  formatDate,
} from "@/lib/utils/date-utils"
import { Search, Pencil, Trash2, Send, FileText } from "lucide-react"

interface AccountsTableProps {
  accounts: Account[]
  customers: Customer[]
  services: StreamingService[]
}

export function AccountsTable({ accounts, customers, services }: AccountsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.streaming_services?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customers?.phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || account.status === statusFilter
    const matchesService = serviceFilter === "all" || account.service_id === serviceFilter

    return matchesSearch && matchesStatus && matchesService
  })

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No hay cuentas registradas"
        description="Comienza agregando tu primera cuenta de streaming. Podrás gestionar clientes, servicios y recibir notificaciones automáticas de vencimiento."
        action={{
          label: "Agregar Primera Cuenta",
          onClick: () => {
            // This will be handled by the parent component's AddAccountDialog
            document.querySelector("[data-add-account-trigger]")?.dispatchEvent(new Event("click"))
          },
        }}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuentas de Streaming</CardTitle>
        <div className="flex flex-col gap-4 md:flex-row md:items-center mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, servicio o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="expired">Vencidas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los servicios</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Días Restantes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No se encontraron cuentas
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => {
                  const daysLeft = getDaysUntilExpiration(account.expiration_date)
                  const userCount = account.account_users?.length || 0
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.customers?.name}</TableCell>
                      <TableCell>{account.streaming_services?.name}</TableCell>
                      <TableCell>{account.customers?.phone}</TableCell>
                      <TableCell>
                        <AccountUsersDialog account={account}>
                          <Button variant="ghost" size="sm" className="h-8">
                            {userCount}/{account.user_capacity}
                          </Button>
                        </AccountUsersDialog>
                      </TableCell>
                      <TableCell>{formatDate(account.start_date)}</TableCell>
                      <TableCell>{formatDate(account.expiration_date)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getExpirationBadgeColor(daysLeft)}>
                          {daysLeft < 0 ? "Vencida" : `${daysLeft} días`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusBadgeColor(account.status)}>
                          {account.status === "active"
                            ? "Activa"
                            : account.status === "expired"
                              ? "Vencida"
                              : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <SendNotificationDialog account={account}>
                            <Button variant="ghost" size="icon">
                              <Send className="h-4 w-4" />
                            </Button>
                          </SendNotificationDialog>
                          <EditAccountDialog account={account} customers={customers} services={services}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </EditAccountDialog>
                          <DeleteAccountDialog accountId={account.id}>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DeleteAccountDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
