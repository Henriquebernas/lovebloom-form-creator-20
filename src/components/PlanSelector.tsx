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
      const endDate = new Date('2025-06-11T23:59:59'); // Termina em 11/06/2025
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
      {/* Banner promocional */}
      <div className="bg-gradient-to-r from-neon-pink to-red-500 text-white p-3 rounded-lg mb-4 text-center animate-pulse">
        <h3 className="font-bold text-lg">💕 PROMOÇÃO DIA DOS NAMORADOS 💕</h3>
        <p className="text-sm">Termina em 11/06! Desconto de até 40% OFF</p>
      </div>

      <label className="block text-sm font-medium text-text-secondary mb-2">Escolha um Plano</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`plan-card p-4 rounded-lg text-center cursor-pointer relative ${selectedPlan === 'basic' ? 'selected' : ''}`}
          onClick={() => onPlanSelect('basic')}
        >
          {/* Badge de desconto */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
            33% OFF
          </div>
          
          <h3 className="font-semibold text-lg text-white">Memórias</h3>
          <p className="text-sm text-text-secondary mb-2">1 ano, até 2 fotos, sem vídeo</p>
          
          {/* Preços */}
          <div className="space-y-1">
            <p className="text-sm text-gray-400 line-through">De R$29,90</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-300">Por apenas</span>
              <p className="font-bold text-xl text-neon-pink">R$19,90</p>
            </div>
            <p className="text-xs text-green-400 font-semibold">💸 Economia de R$10,00</p>
          </div>
          
          {/* Urgência */}
          <div className="mt-2 text-xs text-yellow-300">
            ⚡ Oferta por tempo limitado
          </div>
        </div>

        <div
          className={`plan-card p-4 rounded-lg text-center cursor-pointer relative ${selectedPlan === 'premium' ? 'selected' : ''}`}
          onClick={() => onPlanSelect('premium')}
        >
          {/* Badge de desconto e mais popular */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
            40% OFF
          </div>
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-bold">
            🔥 MAIS POPULAR
          </div>
          
          <h3 className="font-semibold text-lg text-white">Eternidade</h3>
          <p className="text-sm text-text-secondary mb-2">Para sempre, até 5 fotos, com vídeo de fundo</p>
          
          {/* Preços */}
          <div className="space-y-1">
            <p className="text-sm text-gray-400 line-through">De R$49,90</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-300">Por apenas</span>
              <p className="font-bold text-xl text-neon-pink">R$29,90</p>
            </div>
            <p className="text-xs text-green-400 font-semibold">💸 Economia de R$20,00</p>
          </div>
          
          {/* Benefícios exclusivos */}
          <div className="mt-2 space-y-1">
            <p className="text-xs text-yellow-300">⚡ Oferta por tempo limitado</p>
            <p className="text-xs text-blue-300">🎁 Brinde: Vídeo personalizado</p>
          </div>
        </div>
      </div>

      {/* Contador de urgência */}
      <div className="mt-4 text-center p-3 bg-red-900 bg-opacity-30 rounded-lg border border-red-500">
        <p className="text-sm text-red-300 font-semibold">
          ⏰ Promoção termina em: 
          <span className="text-red-200 ml-1 font-bold">{timeLeft}</span>
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Termina dia 11/06 às 23:59! Não perca esta oportunidade única 💕
        </p>
      </div>

      {/* Social proof */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-400">
          🔥 Mais de 1.247 casais já aproveitaram esta oferta especial
        </p>
      </div>
    </div>
  );
};

export default PlanSelector;
