
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePaymentData {
  coupleName: string;
  startDate: string;
  startTime?: string;
  message?: string;
  planType: 'basic' | 'premium';
  amount: number;
  couplePhotos: File[];
  musicUrl?: string;
  email: string;
}

export const usePayments = () => {
  const { toast } = useToast();

  const createPayment = useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      console.log('Criando pagamento...', data);
      
      const { data: result, error } = await supabase.functions.invoke('create-mercado-pago-payment', {
        body: {
          coupleName: data.coupleName,
          startDate: data.startDate,
          startTime: data.startTime,
          message: data.message,
          planType: data.planType,
          amount: data.amount,
          email: data.email,
          musicUrl: data.musicUrl,
          photosCount: data.couplePhotos.length
        }
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(error.message);
      }

      console.log('Resultado do pagamento:', result);
      return result;
    },
    onError: (error) => {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro ao criar pagamento",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getPaymentStatus = (paymentId: string) => {
    return useQuery({
      queryKey: ['payment', paymentId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .single();

        if (error) throw error;
        return data;
      },
      enabled: !!paymentId
    });
  };

  return {
    createPayment,
    getPaymentStatus
  };
};
