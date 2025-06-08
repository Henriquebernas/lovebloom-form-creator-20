
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
    <div className="space-y-6">
      {/* Banner promocional melhorado */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-red-500 to-purple-600 text-white p-4 rounded-xl shadow-lg animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-transparent to-purple-600/20 animate-pulse"></div>
        <div className="relative text-center">
          <h3 className="font-bold text-xl mb-1">💕 PROMOÇÃO DIA DOS NAMORADOS 💕</h3>
          <p className="text-sm font-medium">Termina em 11/06! Desconto de até 40% OFF</p>
        </div>
      </div>

      <label className="block text-lg font-semibold text-center text-text-primary mb-4">
        ✨ Escolha seu Plano de Amor ✨
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plano Memórias */}
        <div
          className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
            selectedPlan === 'basic' 
              ? 'scale-105 ring-2 ring-neon-pink ring-opacity-50' 
              : ''
          }`}
          onClick={() => onPlanSelect('basic')}
        >
          {/* Badge de desconto animado */}
          <div className="absolute -top-3 -right-3 z-10">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-2 rounded-full font-bold shadow-lg animate-bounce">
              <span className="text-yellow-200">⚡</span> 33% OFF
            </div>
          </div>
          
          <div className={`h-full bg-gradient-to-br from-element-bg to-element-bg-lighter p-6 rounded-xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
            selectedPlan === 'basic' 
              ? 'border-neon-pink bg-gradient-to-br from-element-bg-lighter to-element-bg shadow-neon-pink/20 shadow-xl' 
              : 'border-border-color hover:border-neon-pink/60'
          }`}>
            
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-2xl text-white flex items-center justify-center gap-2">
                  <span className="text-pink-400">💝</span> Memórias
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  1 ano, até 2 fotos, sem vídeo
                </p>
              </div>
              
              {/* Preços com visual melhorado */}
              <div className="space-y-3 py-4">
                <p className="text-base text-gray-400 line-through">De R$29,90</p>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-sm text-gray-300 font-medium">Por apenas</span>
                  </div>
                  <p className="font-bold text-3xl text-transparent bg-gradient-to-r from-neon-pink to-pink-400 bg-clip-text">
                    R$19,90
                  </p>
                </div>
                <div className="inline-block bg-gradient-to-r from-green-500 to-green-400 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                  💰 Economize R$10,00
                </div>
              </div>
              
              {/* Urgência */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-300 font-semibold flex items-center justify-center gap-2">
                  <span className="animate-pulse">⚡</span> Oferta por tempo limitado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plano Eternidade */}
        <div
          className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
            selectedPlan === 'premium' 
              ? 'scale-105 ring-2 ring-neon-pink ring-opacity-50' 
              : ''
          }`}
          onClick={() => onPlanSelect('premium')}
        >
          {/* Badge "Mais Popular" */}
          <div className="absolute -top-3 -left-3 z-10">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs px-3 py-2 rounded-full font-bold shadow-lg">
              🔥 MAIS POPULAR
            </div>
          </div>
          
          {/* Badge de desconto */}
          <div className="absolute -top-3 -right-3 z-10">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-2 rounded-full font-bold shadow-lg animate-bounce">
              <span className="text-yellow-200">⚡</span> 40% OFF
            </div>
          </div>
          
          <div className={`h-full bg-gradient-to-br from-element-bg to-element-bg-lighter p-6 rounded-xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
            selectedPlan === 'premium' 
              ? 'border-neon-pink bg-gradient-to-br from-element-bg-lighter to-element-bg shadow-neon-pink/20 shadow-xl' 
              : 'border-border-color hover:border-neon-pink/60'
          }`}>
            
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-2xl text-white flex items-center justify-center gap-2">
                  <span className="text-purple-400">💖</span> Eternidade
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Para sempre, até 5 fotos, com vídeo de fundo
                </p>
              </div>
              
              {/* Preços com visual melhorado */}
              <div className="space-y-3 py-4">
                <p className="text-base text-gray-400 line-through">De R$49,90</p>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-sm text-gray-300 font-medium">Por apenas</span>
                  </div>
                  <p className="font-bold text-3xl text-transparent bg-gradient-to-r from-neon-pink to-purple-400 bg-clip-text">
                    R$29,90
                  </p>
                </div>
                <div className="inline-block bg-gradient-to-r from-green-500 to-green-400 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                  💰 Economize R$20,00
                </div>
              </div>
              
              {/* Benefícios exclusivos */}
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-2">
                  <p className="text-xs text-yellow-300 font-semibold flex items-center justify-center gap-1">
                    <span className="animate-pulse">⚡</span> Oferta por tempo limitado
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-2">
                  <p className="text-xs text-blue-300 font-semibold flex items-center justify-center gap-1">
                    🎁 Brinde: Vídeo personalizado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de urgência melhorado */}
      <div className="bg-gradient-to-r from-red-900/40 to-red-800/40 backdrop-blur-sm border border-red-500/50 rounded-xl p-4 text-center shadow-lg">
        <div className="space-y-2">
          <p className="text-lg text-red-300 font-bold flex items-center justify-center gap-2">
            <span className="animate-pulse text-xl">⏰</span> 
            Promoção termina em:
          </p>
          <div className="bg-red-900/60 rounded-lg px-4 py-2 inline-block">
            <span className="text-red-100 text-xl font-bold tracking-wider">{timeLeft}</span>
          </div>
          <p className="text-sm text-gray-300 max-w-md mx-auto">
            <span className="text-red-400 font-semibold">Termina dia 11/06 às 23:59!</span> 
            <br />Não perca esta oportunidade única 💕
          </p>
        </div>
      </div>

      {/* Social proof melhorado */}
      <div className="text-center bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-3 border border-purple-500/20">
        <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
          <span className="text-orange-400">🔥</span>
          <span className="font-semibold text-purple-300">1.247 casais</span>
          já aproveitaram esta oferta especial
          <span className="text-pink-400">💕</span>
        </p>
      </div>
    </div>
  );
};

export default PlanSelector;
