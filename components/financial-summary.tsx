"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Scale, FileDown } from "lucide-react"
import { generateFinancialReportPDF } from "@/lib/utils/generatePDF"

// Tipos completos para que coincidan con la función del PDF
type Payment = {
  amount: number;
  payment_date: string;
  customers: { name: string } | null;
  accounts: { streaming_services: { name: string } | null } | null;
};
type AccountCost = {
  total_cost: number | null;
  start_date: string;
  streaming_services: { name: string } | null;
};

interface FinancialSummaryProps {
  payments: Payment[];
  accounts: AccountCost[];
}

export function FinancialSummary({ payments, accounts }: FinancialSummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const monthlyData = useMemo(() => {
    // ... (lógica de cálculo sin cambios)
  }, [payments, accounts]);

  const availableMonths = Object.keys(monthlyData).sort().reverse();
  
  const filteredPayments = useMemo(() => {
    if (selectedMonth === 'all') return payments;
    return payments.filter(p => new Date(p.payment_date).toISOString().slice(0, 7) === selectedMonth);
  }, [payments, selectedMonth]);

  const filteredAccounts = useMemo(() => {
    if (selectedMonth === 'all') return accounts;
    return accounts.filter(a => new Date(a.start_date).toISOString().slice(0, 7) === selectedMonth);
  }, [accounts, selectedMonth]);

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalSpent = filteredAccounts.reduce((sum, a) => sum + (a.total_cost || 0), 0);
  const netProfit = totalCollected - totalSpent;
  
  const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('es-CL')}`;

  const handleDownloadPDF = () => {
    const monthLabel = selectedMonth === 'all' 
      ? 'Histórico' 
      : new Date(selectedMonth + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    
    // Pasamos los datos filtrados a la función de generación de PDF
    generateFinancialReportPDF(monthLabel, totalCollected, totalSpent, netProfit, filteredPayments, filteredAccounts);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
        <CardTitle>Resumen Financiero</CardTitle>
        <div className="flex gap-2 w-full md:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadPDF} variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Descargar PDF
            </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {/* ... (Las 3 tarjetas de resumen no cambian) ... */}
      </CardContent>
    </Card>
  )
}
