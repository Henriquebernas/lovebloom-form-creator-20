
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Footer from '@/components/Footer';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const coupleId = searchParams.get('couple');

  const handleRetryPayment = () => {
    if (coupleId) {
      navigate('/payment', { 
        state: { 
          coupleId,
          retry: true 
        } 
      });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-xl custom-shadow" style={{ backgroundColor: 'rgba(26, 26, 46, 0.7)' }}>
            <div className="mb-6">
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2 playfair-display">
                Pagamento não aprovado
              </h1>
              <p className="text-text-secondary">
                Houve um problema com seu pagamento. Não se preocupe, você pode tentar novamente.
              </p>
            </div>

            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
              <h3 className="text-red-400 font-semibold mb-2">O que aconteceu?</h3>
              <ul className="text-text-secondary text-sm space-y-1 text-left">
                <li>• O pagamento pode ter sido rejeitado pelo banco</li>
                <li>• Dados do cartão podem estar incorretos</li>
                <li>• Limite insuficiente</li>
                <li>• Você cancelou o pagamento</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleRetryPayment}
                className="w-full btn-primary p-3 rounded-lg font-semibold flex items-center justify-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Tentar Novamente
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full text-text-secondary hover:text-white transition-colors p-3 border border-border-color rounded-lg flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Início
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-text-secondary text-sm">
                Se o problema persistir, entre em contato conosco pelo email: 
                <span className="text-neon-pink ml-1">suporte@lovebloom.com.br</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentFailure;
