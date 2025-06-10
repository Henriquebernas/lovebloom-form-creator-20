
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePayments } from '@/hooks/usePayments';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');
  
  const { getPaymentStatus } = usePayments();
  const { data: payment, isLoading } = getPaymentStatus(paymentId || '');

  // Buscar dados do casal quando o pagamento estiver disponível
  const { data: couple } = useQuery({
    queryKey: ['couple', payment?.couple_id],
    queryFn: async () => {
      if (!payment?.couple_id) return null;
      
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', payment.couple_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!payment?.couple_id
  });

  useEffect(() => {
    if (payment && payment.status === 'succeeded' && couple) {
      // Redirecionar para o site do casal após 3 segundos
      const timer = setTimeout(() => {
        navigate(`/${couple.url_slug}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [payment, couple, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!payment || payment.status !== 'succeeded') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Pagamento não encontrado ou não aprovado</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Pagamento Aprovado!
        </h1>
        
        <p className="text-text-secondary mb-6">
          Seu pagamento foi processado com sucesso. Seu site personalizado foi criado e você será redirecionado em alguns segundos.
        </p>

        <div className="space-y-4">
          {couple && (
            <button
              onClick={() => navigate(`/${couple.url_slug}`)}
              className="w-full bg-neon-pink hover:bg-neon-pink/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Ir para meu site
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
