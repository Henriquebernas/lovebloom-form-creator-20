
export interface Couple {
  id: string;
  couple_name: string;
  start_date: string;
  start_time?: string;
  message?: string;
  selected_plan: 'basic' | 'premium';
  music_url?: string;
  email?: string;
  url_slug?: string;
  created_at: string;
  updated_at: string;
}

export interface CouplePhoto {
  id: string;
  couple_id: string;
  photo_url: string;
  photo_order: number;
  file_name?: string;
  file_size?: number;
  created_at: string;
}

export interface Payment {
  id: string;
  couple_id: string | null;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  plan_type: 'basic' | 'premium';
  payment_method?: string;
  partner_id?: string;
  referral_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  referral_code: string;
  commission_percentage: number;
  stripe_account_id?: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  partner_id: string;
  payment_id: string;
  commission_amount: number;
  commission_percentage: number;
  status: 'pending' | 'paid' | 'cancelled';
  stripe_transfer_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}
