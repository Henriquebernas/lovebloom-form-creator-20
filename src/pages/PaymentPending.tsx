
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, Loader2 } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useEffect } from 'react';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');
  
  const { getPaymentStatus } = usePayments();
  const { data: payment, isLoading } = getPaymentStatus(paymentId || '');

  useEffect(() => {
    if (payment && payment.status === 'succeeded') {
      navigate(`/payment-success?payment_id=${paymentId}`);
    } else if (payment && payment.status === 'failed') {
      navigate(`/payment-failure?payment_id=${paymentId}`);
    }
  }, [payment, navigate, paymentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
        <Clock className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Pagamento Pendente
        </h1>
        
        <p className="text-text-secondary mb-6">
          Seu pagamento está sendo processado. Aguarde a confirmação ou verifique suas notificações.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-neon-pink hover:bg-neon-pink/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Verificar status
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full border border-border-color text-white hover:bg-white hover:text-black transition-colors py-3 px-6 rounded-lg"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
