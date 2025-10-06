"use client"

import { useState } from "react"
import type { Account, Customer, StreamingService } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// ... (otros imports sin cambios)
import { RenewAccountDialog } from "@/components/renew-account-dialog"
import { RegisterPaymentDialog } from "@/components/register-payment-dialog" // <-- Importar diálogo de pago
import {
  // ... (otras funciones de fecha sin cambios)
} from "@/lib/utils/date-utils"
import { Search, Pencil, Trash2, Send, FileText, RefreshCw, DollarSign, History } from "lucide-react" // <-- Importar íconos nuevos

// ... (resto del componente hasta la tabla)

// Dentro del `return` del componente AccountsTable:
            <TableHeader>
              <TableRow>
                <TableHead>Cliente / Cuenta</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead> {/* <-- Nueva Columna */}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => {
                  const daysLeft = getDaysUntilExpiration(account.expiration_date)
                  const userCount = account.account_users?.length || 0
                  return (
                    <TableRow key={account.id}>
                      {/* ... (celdas de Cliente, Servicio, Usuarios sin cambios) */}
                      <TableCell>{formatDate(account.expiration_date)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusBadgeColor(account.status)}>
                          {account.status === "active" ? "Activa" : account.status === "expired" ? "Vencida" : "Cancelada"}
                        </Badge>
                      </TableCell>
                      {/* -- NUEVA CELDA DE ESTADO DE PAGO -- */}
                      <TableCell>
                        <Badge variant={account.payment_status === 'paid' ? 'default' : 'destructive'}>
                          {account.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* -- NUEVO BOTÓN DE REGISTRAR PAGO -- */}
                          <RegisterPaymentDialog account={account}>
                            <Button variant="ghost" size="icon" title="Registrar Pago">
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </RegisterPaymentDialog>
                          <RenewAccountDialog account={account}>
                            <Button variant="ghost" size="icon" title="Renovar cuenta">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </RenewAccountDialog>
                          {/* ... (resto de botones sin cambios) ... */}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
// ... (resto del componente)
