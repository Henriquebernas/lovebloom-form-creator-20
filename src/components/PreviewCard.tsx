
import { Video } from 'lucide-react';

interface PreviewCardProps {
  coupleName: string;
  message: string;
  photoPreviews: string[];
  countdown: string;
  selectedPlan: string;
  musicUrl: string;
}

const PreviewCard = ({ 
  coupleName, 
  message, 
  photoPreviews, 
  countdown, 
  selectedPlan, 
  musicUrl 
}: PreviewCardProps) => {
  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'seunome';
  };

  const getPlanDisplay = () => {
    if (selectedPlan === 'basic') return 'Plano: Memórias (R$29)';
    if (selectedPlan === 'premium') return 'Plano: Eternidade (R$40)';
    return '';
  };

  return (
    <div className="w-full max-w-md preview-card rounded-xl custom-shadow overflow-hidden">
      <div className="preview-header p-3 text-center">
        <span className="text-white text-sm font-medium">
          lovebloom.com/{getSlugFromName(coupleName)}
        </span>
      </div>
      <div className="p-6 text-center">
        <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-700 mx-auto rounded-lg mb-6 flex items-center justify-center overflow-hidden border-2 border-border-color">
          {photoPreviews.length > 0 ? (
            <img
              src={photoPreviews[0]}
              alt="Pré-visualização da foto"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://placehold.co/200x200/374151/e0e0e0?text=Foto+Casal"
              alt="Pré-visualização da foto"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {photoPreviews.length > 1 && (
          <p className="text-xs text-text-secondary mb-2">
            +{photoPreviews.length - 1} foto{photoPreviews.length > 2 ? 's' : ''}
          </p>
        )}

        <h3 className="text-2xl playfair-display font-bold text-white mb-1">
          {coupleName || 'Nome do Casal'}
        </h3>
        <p className="text-text-secondary text-sm mb-4 italic h-12 overflow-y-auto">
          {message || 'Sua mensagem especial aparecerá aqui.'}
        </p>

        <div className="preview-countdown-bg p-4 rounded-lg mb-4">
          <p className="text-lg font-semibold text-white mb-1">Juntos há:</p>
          <div 
            className="text-xl sm:text-2xl font-bold text-neon-pink"
            dangerouslySetInnerHTML={{ __html: countdown }}
          />
        </div>
        
        {selectedPlan === 'premium' && musicUrl && (
          <div className="flex items-center justify-center text-xs text-text-secondary mb-2">
            <Video className="h-3 w-3 mr-1" />
            <span>Com vídeo de fundo</span>
          </div>
        )}
        
        <p className="text-xs text-text-secondary">{getPlanDisplay()}</p>
      </div>
    </div>
  );
};

export default PreviewCard;
