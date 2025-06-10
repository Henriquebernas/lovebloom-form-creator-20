
import { Check } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanSelect: (plan: string) => void;
  disabled?: boolean;
  showPaymentButton?: boolean;
  onPaymentClick?: (plan: string) => void;
  isLoading?: boolean;
}

const PlanSelector = ({ 
  selectedPlan, 
  onPlanSelect, 
  disabled = false, 
  showPaymentButton = false,
  onPaymentClick,
  isLoading = false
}: PlanSelectorProps) => {
  const plans = [
    {
      id: 'basic',
      name: 'Memórias',
      price: 'R$ 19,90',
      amount: 1990, // em centavos
      features: [
        'Contador de tempo personalizado',
        'Até 2 fotos do casal',
        'Mensagem especial',
        'QR Code para compartilhar',
        'Um ano de acesso'
      ]
    },
    {
      id: 'premium',
      name: 'Eternidade',
      price: 'R$ 29,90',
      amount: 2990, // em centavos
      features: [
        'Contador de tempo personalizado',
        'Até 5 fotos do casal',
        'Mensagem especial',
        'Música/vídeo de fundo',
        'QR Code para compartilhar',
        'Acesso permanente'
      ]
    }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-3">
        Escolha seu plano
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => !disabled && !showPaymentButton && onPlanSelect(plan.id)}
            className={`p-4 border-2 rounded-xl transition-all ${
              selectedPlan === plan.id 
                ? 'border-neon-pink bg-neon-pink bg-opacity-10' 
                : 'border-border-color hover:border-neon-pink hover:border-opacity-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : showPaymentButton ? '' : 'cursor-pointer'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              {!showPaymentButton && (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.id ? 'border-neon-pink bg-neon-pink' : 'border-border-color'
                }`}>
                  {selectedPlan === plan.id && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-neon-pink mb-4">{plan.price}</p>
            <ul className="space-y-2 mb-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-sm text-text-secondary flex items-center">
                  <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            {showPaymentButton && (
              <button
                onClick={() => onPaymentClick && onPaymentClick(plan.id)}
                disabled={isLoading}
                className="w-full bg-neon-pink hover:bg-neon-pink/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processando...' : 'Escolher Plano'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSelector;
