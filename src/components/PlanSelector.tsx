
interface PlanSelectorProps {
  selectedPlan: string;
  onPlanSelect: (plan: string) => void;
}

const PlanSelector = ({ selectedPlan, onPlanSelect }: PlanSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">Escolha um Plano</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`plan-card p-4 rounded-lg text-center cursor-pointer ${selectedPlan === 'basic' ? 'selected' : ''}`}
          onClick={() => onPlanSelect('basic')}
        >
          <h3 className="font-semibold text-lg text-white">Memórias</h3>
          <p className="text-sm text-text-secondary">1 ano, até 2 fotos, sem vídeo</p>
          <p className="font-bold text-xl text-neon-pink mt-1">R$29</p>
        </div>
        <div
          className={`plan-card p-4 rounded-lg text-center cursor-pointer ${selectedPlan === 'premium' ? 'selected' : ''}`}
          onClick={() => onPlanSelect('premium')}
        >
          <h3 className="font-semibold text-lg text-white">Eternidade</h3>
          <p className="text-sm text-text-secondary">Para sempre, até 5 fotos, com vídeo de fundo</p>
          <p className="font-bold text-xl text-neon-pink mt-1">R$40</p>
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;
