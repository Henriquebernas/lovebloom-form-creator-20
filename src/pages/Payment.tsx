
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';
import PlanSelector from '@/components/PlanSelector';
import { Loader2 } from 'lucide-react';

const Payment = () => {
  const { coupleId } = useParams();
  const navigate = useNavigate();
  const { createPayment } = usePayments();
  const { toast } = useToast();

  console.log('Payment page - coupleId:', coupleId);

  const { data: couple, isLoading, error } = useQuery({
    queryKey: ['couple', coupleId],
    queryFn: async () => {
      if (!coupleId) throw new Error('ID do casal não encontrado');
      
      console.log('Buscando casal com ID:', coupleId);
      
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId)
        .single();

      if (error) {
        console.error('Erro ao buscar casal:', error);
        throw error;
      }
      
      console.log('Casal encontrado:', data);
      return data;
    },
    enabled: !!coupleId
  });

  const handlePaymentClick = async (planType: string) => {
    console.log('Clicou em pagamento para plano:', planType);
    
    if (!couple) {
      console.error('Casal não encontrado para pagamento');
      toast({
        title: "Erro",
        description: "Casal não encontrado",
        variant: "destructive"
      });
      return;
    }

    const planAmounts = {
      basic: 1990, // R$ 19,90 em centavos
      premium: 2990 // R$ 29,90 em centavos
    };

    const amount = planAmounts[planType as keyof typeof planAmounts];
    
    if (!amount) {
      console.error('Plano inválido:', planType);
      toast({
        title: "Erro",
        description: "Plano inválido selecionado",
        variant: "destructive"
      });
      return;
    }

    console.log('Criando pagamento:', {
      coupleId: couple.id,
      planType,
      amount,
      coupleName: couple.couple_name
    });

    try {
      const result = await createPayment.mutateAsync({
        coupleId: couple.id,
        planType: planType as 'basic' | 'premium',
        amount: amount,
        coupleName: couple.couple_name
      });

      console.log('Resultado do pagamento:', result);

      if (result && result.init_point) {
        console.log('Redirecionando para:', result.init_point);
        // Redirecionar para o Mercado Pago
        window.location.href = result.init_point;
      } else {
        console.error('init_point não encontrado no resultado:', result);
        toast({
          title: "Erro",
          description: "Erro ao obter link de pagamento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error || !couple) {
    console.error('Erro ou casal não encontrado:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Casal não encontrado</h1>
          <p className="mb-4">{error?.message || 'Casal não encontrado'}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-neon-pink hover:bg-neon-pink/80 text-white px-6 py-2 rounded-lg"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-text-secondary">
            Para {couple.couple_name}
          </p>
        </div>

        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8">
          <PlanSelector
            selectedPlan=""
            onPlanSelect={() => {}}
            showPaymentButton={true}
            onPaymentClick={handlePaymentClick}
            isLoading={createPayment.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;
