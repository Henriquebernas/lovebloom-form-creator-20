
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePaymentData {
  coupleId: string;
  planType: 'basic' | 'premium';
  amount: number;
  coupleName: string;
  formData?: {
    coupleName: string;
    startDate: string;
    startTime: string;
    message: string;
    selectedPlan: string;
    musicUrl: string;
    email: string;
    photosBase64: string[];
  };
}

export const usePayments = () => {
  const { toast } = useToast();

  const createPayment = useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      const { data: result, error } = await supabase.functions.invoke('create-mercado-pago-payment', {
        body: data
      });

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
    onError: (error) => {
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
