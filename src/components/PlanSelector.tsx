
import { Check } from 'lucide-react';
import { PlanPricing } from '@/types/database';

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanSelect: (plan: string) => void;
  disabled?: boolean;
  pricing: PlanPricing;
  formatPrice: (price: number) => string;
  hasCustomPricing?: boolean;
}

const PlanSelector = ({ 
  selectedPlan, 
  onPlanSelect, 
  disabled = false, 
  pricing,
  formatPrice,
  hasCustomPricing = false 
}: PlanSelectorProps) => {
  const plans = [
    {
      id: 'basic',
      name: 'Memórias',
      price: pricing.basic,
      originalPrice: hasCustomPricing ? 1990 : null,
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
      price: pricing.premium,
      originalPrice: hasCustomPricing ? 2990 : null,
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
        {hasCustomPricing && (
          <span className="ml-2 text-xs bg-neon-pink/20 text-neon-pink px-2 py-1 rounded-full">
            Preços Especiais!
          </span>
        )}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => !disabled && onPlanSelect(plan.id)}
            className={`
              relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${selectedPlan === plan.id
                ? 'border-neon-pink bg-neon-pink/10'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {/* Radio button indicator */}
            <div className="absolute top-4 right-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === plan.id 
                  ? 'border-neon-pink bg-neon-pink' 
                  : 'border-gray-400'
              }`}>
                {selectedPlan === plan.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>

            {/* Plan Info */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neon-pink">
                  {formatPrice(plan.price)}
                </span>
                {plan.originalPrice && plan.originalPrice !== plan.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(plan.originalPrice)}
                  </span>
                )}
              </div>
              {hasCustomPricing && plan.originalPrice && plan.originalPrice !== plan.price && (
                <p className="text-xs text-green-400 mt-1">
                  Economia de {formatPrice(plan.originalPrice - plan.price)}!
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-neon-pink mr-2 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSelector;
