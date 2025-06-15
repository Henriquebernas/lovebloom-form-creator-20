
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';
import { usePartnerContext } from '@/hooks/usePartnerContext';
import PlanSelector from '@/components/PlanSelector';
import PartnerBanner from '@/components/PartnerBanner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const Payment = () => {
  const { coupleId } = useParams();
  const navigate = useNavigate();
  const { createPayment } = usePayments();
  const { toast } = useToast();
  const { 
    partner, 
    pricing, 
    hasCustomPricing, 
    isLoading: partnerLoading, 
    formatPrice 
  } = usePartnerContext();
  
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const { data: couple, isLoading } = useQuery({
    queryKey: ['couple', coupleId],
    queryFn: async () => {
      if (!coupleId) throw new Error('ID do casal não encontrado');
      
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!coupleId
  });

  const handlePaymentClick = async (planType: string) => {
    if (!couple) return;

    try {
      // SEGURANÇA: Não enviamos mais o valor do frontend
      const result = await createPayment.mutateAsync({
        planType: planType as 'basic' | 'premium',
        coupleName: couple.couple_name,
        referralCode: partner?.referral_code, // Incluir código do parceiro se presente
      });

      // Redirecionar para o Stripe Checkout
      window.location.href = result.url;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
    }
  };

  if (isLoading || partnerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Casal não encontrado</h1>
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

        {/* Partner Banner */}
        {partner && (
          <PartnerBanner partner={partner} hasCustomPricing={hasCustomPricing} />
        )}

        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8">
          <PlanSelector
            selectedPlan={selectedPlan}
            onPlanSelect={setSelectedPlan}
            pricing={pricing}
            formatPrice={formatPrice}
            hasCustomPricing={hasCustomPricing}
          />
          
          {selectedPlan && (
            <div className="mt-6">
              <button
                onClick={() => handlePaymentClick(selectedPlan)}
                disabled={createPayment.isPending}
                className="w-full bg-neon-pink hover:bg-neon-pink/80 text-white px-6 py-4 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPayment.isPending ? 'Processando...' : `Pagar ${formatPrice(pricing[selectedPlan as keyof typeof pricing])}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
