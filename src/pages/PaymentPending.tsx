
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, ExternalLink, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const coupleId = searchParams.get('couple');

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-xl custom-shadow" style={{ backgroundColor: 'rgba(26, 26, 46, 0.7)' }}>
            <div className="mb-6">
              <Clock className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2 playfair-display">
                Pagamento Pendente
              </h1>
              <p className="text-text-secondary">
                Seu pagamento está sendo processado. Aguarde a confirmação.
              </p>
            </div>

            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-400 font-semibold mb-2">Status: Processando</h3>
              <ul className="text-text-secondary text-sm space-y-1 text-left">
                <li>• Seu pagamento está sendo verificado</li>
                <li>• Isso pode levar alguns minutos</li>
                <li>• Você receberá um email quando for aprovado</li>
                <li>• Não é necessário pagar novamente</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn-primary p-3 rounded-lg font-semibold flex items-center justify-center"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Verificar Status
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
              <h3 className="text-blue-400 font-semibold mb-2">O que fazer agora?</h3>
              <ul className="text-text-secondary text-sm space-y-1 text-left">
                <li>• Aguarde o email de confirmação</li>
                <li>• Verifique sua caixa de spam</li>
                <li>• O site será ativado automaticamente após aprovação</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentPending;
