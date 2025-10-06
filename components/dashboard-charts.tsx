"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Account } from "@/lib/types"
import { getDaysUntilExpiration } from "@/lib/utils/date-utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { useMemo } from "react"

interface DashboardChartsProps {
  accounts: Account[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function DashboardCharts({ accounts }: DashboardChartsProps) {
  // Datos para el gráfico de próximos vencimientos
  const expiringData = useMemo(() => {
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return {
        date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        count: 0
      }
    })

    accounts.forEach(account => {
      if (account.status === 'active') {
        const daysLeft = getDaysUntilExpiration(account.expiration_date)
        if (daysLeft >= 0 && daysLeft < 7) {
          const expirationDayIndex = 6 - (6 - daysLeft); // Alinea el día correcto en el array
          if (next7Days[expirationDayIndex]) {
            next7Days[expirationDayIndex].count++;
          }
        }
      }
    })
    return next7Days
  }, [accounts])

  // Datos para el gráfico de distribución de servicios
  const serviceDistributionData = useMemo(() => {
    const serviceCount: { [key: string]: number } = {}
    accounts.forEach(account => {
      const serviceName = account.streaming_services?.name || 'Desconocido'
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1
    })
    return Object.entries(serviceCount).map(([name, value]) => ({ name, value }))
  }, [accounts])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Vencimientos en los Próximos 7 Días</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expiringData}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }} />
              <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={serviceDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {serviceDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
