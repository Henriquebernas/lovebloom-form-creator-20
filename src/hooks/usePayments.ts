
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePaymentData {
  coupleId: string;
  planType: 'basic' | 'premium';
  amount: number;
  coupleName: string;
}

export const usePayments = () => {
  const { toast } = useToast();

  const createPayment = useMutation({
    mutationFn: async (data: CreatePaymentData) => {
      console.log('Criando pagamento com dados:', data);
      
      const { data: result, error } = await supabase.functions.invoke('create-mercado-pago-payment', {
        body: data
      });

      console.log('Resposta da função:', result, 'Erro:', error);

      if (error) {
        console.error('Erro na função edge:', error);
        throw new Error(error.message || 'Erro ao criar pagamento');
      }

      if (!result) {
        throw new Error('Nenhum resultado retornado da função');
      }

      return result;
    },
    onSuccess: (data) => {
      console.log('Pagamento criado com sucesso:', data);
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
