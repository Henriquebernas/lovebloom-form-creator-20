
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Pagamento Não Aprovado
        </h1>
        
        <p className="text-text-secondary mb-6">
          Houve um problema com seu pagamento. Você pode tentar novamente ou escolher outro método de pagamento.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate(`/payment/${paymentId?.split('_')[1]}`)}
            className="w-full bg-neon-pink hover:bg-neon-pink/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Tentar novamente
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

export default PaymentFailure;
