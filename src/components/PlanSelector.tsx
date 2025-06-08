
import { useState, useEffect } from 'react';

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanSelect: (plan: string) => void;
}

const PlanSelector = ({ selectedPlan, onPlanSelect }: PlanSelectorProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endDate = new Date('2025-06-11T23:59:59');
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft('Promoção encerrada');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Banner promocional mais discreto */}
      <div className="bg-gradient-to-r from-neon-pink/20 to-red-500/20 border border-neon-pink/30 text-white p-3 rounded-lg mb-4 text-center">
        <h3 className="font-bold text-lg">💕 PROMOÇÃO DIA DOS NAMORADOS</h3>
        <p className="text-sm text-text-secondary">Termina em 11/06! Desconto de até 40% OFF</p>
      </div>

      <label className="block text-sm font-medium text-text-secondary mb-2">Escolha um Plano</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`plan-card p-6 rounded-xl text-center cursor-pointer relative transition-all duration-300 ${
            selectedPlan === 'basic' 
              ? 'border-neon-pink bg-element-bg-lighter transform -translate-y-1' 
              : 'border-border-color bg-element-bg hover:border-neon-pink/50 hover:-translate-y-0.5'
          }`}
          onClick={() => onPlanSelect('basic')}
        >
          {/* Badge de desconto discreto */}
          <div className="absolute -top-2 -right-2 bg-neon-pink text-white text-xs px-2 py-1 rounded-full font-semibold">
            33% OFF
          </div>
          
          <h3 className="font-semibold text-xl text-white mb-2">Memórias</h3>
          <p className="text-sm text-text-secondary mb-4">1 ano, até 2 fotos, sem vídeo</p>
          
          {/* Preços mais limpos */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400 line-through">De R$29,90</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-sm text-text-secondary">Por</span>
              <p className="font-bold text-2xl text-neon-pink">R$19,90</p>
            </div>
            <p className="text-xs text-green-400">Economia de R$10,00</p>
          </div>
        </div>

        <div
          className={`plan-card p-6 rounded-xl text-center cursor-pointer relative transition-all duration-300 ${
            selectedPlan === 'premium' 
              ? 'border-neon-pink bg-element-bg-lighter transform -translate-y-1' 
              : 'border-border-color bg-element-bg hover:border-neon-pink/50 hover:-translate-y-0.5'
          }`}
          onClick={() => onPlanSelect('premium')}
        >
          {/* Badges mais discretos */}
          <div className="absolute -top-2 -right-2 bg-neon-pink text-white text-xs px-2 py-1 rounded-full font-semibold">
            40% OFF
          </div>
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            POPULAR
          </div>
          
          <h3 className="font-semibold text-xl text-white mb-2">Eternidade</h3>
          <p className="text-sm text-text-secondary mb-4">Para sempre, até 5 fotos, com vídeo</p>
          
          {/* Preços mais limpos */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400 line-through">De R$49,90</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-sm text-text-secondary">Por</span>
              <p className="font-bold text-2xl text-neon-pink">R$29,90</p>
            </div>
            <p className="text-xs text-green-400">Economia de R$20,00</p>
          </div>
          
          {/* Benefício extra mais discreto */}
          <div className="mt-3">
            <p className="text-xs text-blue-300">🎁 Brinde: Vídeo personalizado</p>
          </div>
        </div>
      </div>

      {/* Contador mais elegante */}
      <div className="mt-4 text-center p-4 bg-element-bg border border-border-color rounded-lg">
        <p className="text-sm text-text-secondary">
          ⏰ Promoção termina em: 
          <span className="text-neon-pink ml-1 font-semibold">{timeLeft}</span>
        </p>
        <p className="text-xs text-text-secondary mt-1 opacity-75">
          Termina dia 11/06 às 23:59
        </p>
      </div>

      {/* Social proof mais discreto */}
      <div className="mt-3 text-center">
        <p className="text-xs text-text-secondary opacity-60">
          Mais de 1.247 casais já aproveitaram esta oferta
        </p>
      </div>
    </div>
  );
};

export default PlanSelector;
