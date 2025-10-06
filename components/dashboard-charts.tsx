"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Account } from "@/lib/types"
import { getDaysUntilExpiration } from "@/lib/utils/date-utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { useMemo } from "react"
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react"

interface DashboardChartsProps {
  accounts: Account[]
}

// CAMBIO 1: Paleta de colores más vibrante y variada
const COLORS = [
  "#3b82f6", // blue-500
  "#22c55e", // green-500
  "#f97316", // orange-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
  "#f43f5e", // rose-500
];

export function DashboardCharts({ accounts }: DashboardChartsProps) {
  const expiringData = useMemo(() => {
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return {
        date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        Vencen: 0
      }
    })

    accounts.forEach(account => {
      if (account.status === 'active') {
        const daysLeft = getDaysUntilExpiration(account.expiration_date)
        if (daysLeft >= 0 && daysLeft < 7) {
          if (next7Days[daysLeft]) {
            next7Days[daysLeft].Vencen++;
          }
        }
      }
    })
    return next7Days
  }, [accounts])

  const serviceDistributionData = useMemo(() => {
    const serviceCount: { [key: string]: number } = {}
    accounts.forEach(account => {
      const serviceName = account.streaming_services?.name || 'Desconocido'
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1
    })
    return Object.entries(serviceCount).map(([name, value]) => ({ name, value }))
  }, [accounts])

  // CAMBIO 2: Se ajusta el estilo del Tooltip para que el texto sea visible
  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.5rem',
    color: 'hsl(var(--foreground))' // <-- Añadido para el color del texto
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Vencimientos Próximos</CardTitle>
          <CardDescription>Cuentas que vencen en los próximos 7 días.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expiringData}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={tooltipStyle} />
              <Bar dataKey="Vencen" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5" /> Distribución de Cuentas</CardTitle>
          <CardDescription>Distribución de cuentas por servicio.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={serviceDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold">{(percent * 100).toFixed(0)}%</text> : null;
              }}>
                {serviceDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
