"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Account, Customer } from "@/lib/types"; // Importar Customer
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Importar Select

interface RegisterPaymentDialogProps {
  account: Account;
  customers: Customer[]; // Necesitamos la lista de todos los clientes/usuarios
  children: React.ReactNode;
}

export function RegisterPaymentDialog({ account, customers, children }: RegisterPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const userId = formData.get("user_id") as string;

    const { error: paymentError } = await supabase.from("payments").insert({
      account_id: account.id,
      // --- CAMBIO AQUÍ: Guardamos el ID del usuario que pagó ---
      user_id: userId === "null" ? null : userId,
      amount: Number(formData.get("amount")),
      payment_date: formData.get("payment_date") as string,
      payment_method: formData.get("payment_method") as string,
      notes: formData.get("notes") as string,
    });
    
    if (paymentError) {
      toast({ title: "Error", description: "No se pudo registrar el pago.", variant: "destructive" });
      console.error("Error creating payment:", paymentError);
      setLoading(false);
      return;
    }

    const { error: accountError } = await supabase
      .from("accounts")
      .update({ payment_status: 'paid' })
      .eq('id', account.id);

    setLoading(false);

    if (accountError) {
        toast({ title: "Advertencia", description: "Pago registrado, pero no se pudo actualizar el estado de la cuenta." });
    } else {
        toast({ title: "¡Pago Registrado!", description: `Se registró el pago para la cuenta de ${account.streaming_services?.name}.` });
    }
    
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Registra un nuevo pago para la cuenta de {account.streaming_services?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            {/* --- CAMBIO AQUÍ: Añadimos un selector de usuario --- */}
            <div className="grid gap-2">
              <Label htmlFor="user_id">Pagado por</Label>
              <Select name="user_id" defaultValue={account.customer_id || "null"}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el usuario que pagó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Anónimo / No especificado</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="10.00" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_date">Fecha de Pago</Label>
              <Input id="payment_date" name="payment_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_method">Método de Pago</Label>
              <Input id="payment_method" name="payment_method" placeholder="Transferencia, Efectivo..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" name="notes" placeholder="Notas adicionales sobre el pago..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Registrando..." : "Registrar Pago"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
