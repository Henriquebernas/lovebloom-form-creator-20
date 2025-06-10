
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import PlanSelector from '@/components/PlanSelector';
import Footer from '@/components/Footer';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [coupleData, setCoupleData] = useState<any>(null);

  useEffect(() => {
    if (location.state) {
      setCoupleData(location.state);
    } else {
      // Se não há dados do estado, redirecionar para home
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!coupleData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-pink mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-text-secondary hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
            <h1 className="text-3xl sm:text-4xl playfair-display font-bold text-white mb-2">
              Finalize seu pedido
            </h1>
            <p className="text-lg text-text-secondary">
              Para o casal <span className="text-neon-pink">{coupleData.coupleName}</span>
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <div>
                <h3 className="text-green-400 font-semibold">Site criado com sucesso!</h3>
                <p className="text-text-secondary text-sm">
                  Seu site está pronto. Complete o pagamento para ativá-lo.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-6 sm:p-8 rounded-xl custom-shadow" style={{ backgroundColor: 'rgba(26, 26, 46, 0.7)' }}>
            <h2 className="text-2xl font-semibold text-white mb-6 playfair-display">
              Escolha seu plano e pague
            </h2>
            
            <PlanSelector 
              selectedPlan={coupleData.selectedPlan}
              onPlanSelect={() => {}} // Disabled in payment page
              disabled={false}
              coupleId={coupleData.coupleId}
              showPaymentButtons={true}
            />

            <div className="mt-8 p-4 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">Informações importantes:</h3>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• Após o pagamento, seu site será ativado automaticamente</li>
                <li>• Você receberá um email de confirmação</li>
                <li>• O link do seu site é: <span className="text-neon-pink">/{coupleData.urlSlug}</span></li>
                <li>• Pagamento 100% seguro via Mercado Pago</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;
