export interface StreamingService {
  id: string
  name: string
  default_user_capacity: number
  created_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  created_at: string
}

export interface Account {
  id: string
  customer_id: string | null
  service_id: string
  start_date: string
  duration_days: number
  expiration_date: string
  status: "active" | "expired" | "cancelled"
  payment_status: "paid" | "pending" // Nuevo campo
  account_email: string | null // Nuevo campo
  account_password: string | null // Nuevo campo
  account_pin: string | null // Nuevo campo
  notes: string | null
  user_capacity: number
  created_at: string
  updated_at: string
  customers?: Customer
  streaming_services?: StreamingService
  account_users?: AccountUser[]
  payments?: Payment[] // Nuevo campo
}

export interface AccountUser {
  id: string
  account_id: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  profile_name: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  // ... (sin cambios)
}

// NUEVOS TIPOS
export interface Payment {
    id: string;
    account_id: string;
    amount: number;
    payment_date: string;
    payment_method: string | null;
    notes: string | null;
}

export interface AccountHistoryEvent {
    id: number;
    account_id: string;
    event_type: string;
    description: string;
    created_at: string;
}
