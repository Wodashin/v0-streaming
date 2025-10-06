"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Account, AccountUser } from "@/lib/types";
// --- LA CORRECCIÓN ESTÁ AQUÍ ---
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, // <-- Se añade la importación que faltaba
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
// ------------------------------
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Check, Loader2 } from "lucide-react";

interface RegisterPaymentDialogProps {
  account: Account;
  children: React.ReactNode;
}

export function RegisterPaymentDialog({ account, children }: RegisterPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegisterPayment = async (user: AccountUser) => {
    setLoadingUserId(user.id);
    
    const supabase = createClient();
    const price = account.streaming_services?.price_per_user || 0;

    // 1. Registrar el pago en la tabla 'payments'
    const { error: paymentError } = await supabase.from("payments").insert({
      account_id: account.id,
      user_id: user.id,
      amount: price,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: 'Manual'
    });

    if (paymentError) {
      toast({ title: "Error", description: "No se pudo registrar el pago.", variant: "destructive" });
      setLoadingUserId(null);
      return;
    }

    // 2. Actualizar el estado del usuario a 'paid'
    const { error: userError } = await supabase
      .from("account_users")
      .update({ payment_status: 'paid' })
      .eq('id', user.id);

    if (userError) {
        toast({ title: "Advertencia", description: "Pago registrado, pero no se pudo actualizar el estado del usuario." });
    } else {
        toast({ title: "¡Pago Registrado!", description: `Pago de ${user.user_name} registrado por $${price.toFixed(2)}.` });
    }

    setLoadingUserId(null);
    router.refresh(); 
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagos para {account.streaming_services?.name}</DialogTitle>
          <DialogDescription>
            Marca los usuarios que han pagado por el ciclo actual. El monto a registrar por usuario es de **${(account.streaming_services?.price_per_user || 0).toFixed(2)}**.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3 max-h-96 overflow-y-auto">
            {(account.account_users && account.account_users.length > 0) ? (
                account.account_users.map(user => (
                    <div key={user.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                            <p className="font-medium">{user.user_name}</p>
                            <p className="text-sm text-muted-foreground">{user.user_phone || user.user_email}</p>
                        </div>
                        {user.payment_status === 'paid' ? (
                            <Badge variant="secondary"><Check className="h-4 w-4 mr-1"/> Pagado</Badge>
                        ) : (
                            <Button 
                                size="sm" 
                                onClick={() => handleRegisterPayment(user)}
                                disabled={loadingUserId === user.id}
                            >
                                {loadingUserId === user.id ? 
                                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                                    <><DollarSign className="h-4 w-4 mr-1"/> Registrar Pago</>
                                }
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground">No hay usuarios en esta cuenta.</p>
            )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
