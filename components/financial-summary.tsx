"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp, Scale } from "lucide-react"

type Payment = { amount: number; payment_date: string };
type AccountCost = { total_cost: number | null; start_date: string };

interface FinancialSummaryProps {
  payments: Payment[];
  accounts: AccountCost[];
}

export function FinancialSummary({ payments, accounts }: FinancialSummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { collected: number; spent: number } } = {};
    
    payments.forEach(p => {
      const month = new Date(p.payment_date).toISOString().slice(0, 7); // "YYYY-MM"
      if (!data[month]) data[month] = { collected: 0, spent: 0 };
      data[month].collected += p.amount;
    });

    accounts.forEach(a => {
        const month = new Date(a.start_date).toISOString().slice(0, 7);
        if (!data[month]) data[month] = { collected: 0, spent: 0 };
        data[month].spent += a.total_cost || 0;
    });
    
    return data;
  }, [payments, accounts]);

  const availableMonths = Object.keys(monthlyData).sort().reverse();

  const totalCollected = selectedMonth === 'all'
    ? payments.reduce((sum, p) => sum + p.amount, 0)
    : monthlyData[selectedMonth]?.collected || 0;

  const totalSpent = selectedMonth === 'all'
    ? accounts.reduce((sum, a) => sum + (a.total_cost || 0), 0)
    : monthlyData[selectedMonth]?.spent || 0;
  
  const netProfit = totalCollected - totalSpent;

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
        <CardTitle>Resumen Financiero</CardTitle>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el tiempo</SelectItem>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month}>
                {new Date(month + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCollected.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <Scale className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${netProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
