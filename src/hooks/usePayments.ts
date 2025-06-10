
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMercadoPagoPayment = async (coupleId: string, planType: 'basic' | 'premium') => {
    setLoading(true);
    setError(null);

    try {
      console.log('Criando pagamento MP para:', { coupleId, planType });

      const { data, error } = await supabase.functions.invoke('create-mercado-pago-payment', {
        body: { coupleId, planType }
      });

      if (error) {
        console.error('Erro na função:', error);
        throw error;
      }

      console.log('Resposta do MP:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar pagamento';
      setError(errorMessage);
      console.error('Erro ao criar pagamento MP:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao verificar status do pagamento:', err);
      throw err;
    }
  };

  return {
    loading,
    error,
    createMercadoPagoPayment,
    checkPaymentStatus
  };
};
