
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePayments } from '@/hooks/usePayments';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');
  const [coupleSlug, setCoupleSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getPaymentStatus } = usePayments();
  const { data: payment, isLoading: paymentLoading } = getPaymentStatus(paymentId || '');

  useEffect(() => {
    if (payment && payment.status === 'succeeded' && payment.couple_id) {
      // Buscar o slug do casal
      const fetchCoupleSlug = async () => {
        try {
          const { data: couple, error } = await supabase
            .from('couples')
            .select('url_slug')
            .eq('id', payment.couple_id)
            .single();

          if (error) {
            console.error('Erro ao buscar casal:', error);
          } else {
            setCoupleSlug(couple.url_slug);
            // Redirecionar após 3 segundos
            setTimeout(() => {
              navigate(`/${couple.url_slug}`);
            }, 3000);
          }
        } catch (error) {
          console.error('Erro:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCoupleSlug();
    } else if (!paymentLoading) {
      setIsLoading(false);
    }
  }, [payment, navigate, paymentLoading]);

  if (paymentLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Pagamento Aprovado!
        </h1>
        
        <p className="text-text-secondary mb-6">
          Seu pagamento foi processado com sucesso e seu site foi criado! 
          {coupleSlug && " Você será redirecionado em alguns segundos."}
        </p>

        <div className="space-y-4">
          {coupleSlug && (
            <button
              onClick={() => navigate(`/${coupleSlug}`)}
              className="w-full bg-neon-pink hover:bg-neon-pink/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Ver meu site
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="w-full border border-border-color text-white hover:bg-white hover:text-black transition-colors py-3 px-6 rounded-lg"
          >
            Criar outro site
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
