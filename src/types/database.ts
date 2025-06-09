
export interface Couple {
  id: string;
  couple_name: string;
  start_date: string;
  start_time?: string;
  message?: string;
  selected_plan: 'basic' | 'premium';
  music_url?: string;
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
  couple_id: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  plan_type: 'basic' | 'premium';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}
