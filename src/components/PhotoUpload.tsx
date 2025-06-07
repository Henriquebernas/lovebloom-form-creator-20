
import { Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  selectedPlan: string;
  couplePhotos: File[];
  photoPreviews: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
}

const PhotoUpload = ({ 
  selectedPlan, 
  couplePhotos, 
  photoPreviews, 
  onFileChange, 
  onRemovePhoto 
}: PhotoUploadProps) => {
  const getPhotoLimit = () => {
    return selectedPlan === 'basic' ? 2 : selectedPlan === 'premium' ? 5 : 0;
  };

  const photoLimit = getPhotoLimit();

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        Fotos do Casal {selectedPlan && `(${couplePhotos.length}/${photoLimit})`}
      </label>
      
      {/* Photo Previews */}
      {photoPreviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {photoPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img 
                src={preview} 
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-border-color"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {couplePhotos.length < photoLimit && (
        <div className="relative">
          <input
            type="file"
            id="couplePhotos"
            name="couplePhotos"
            accept="image/*"
            multiple
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={!selectedPlan}
          />
          <button
            type="button"
            className={`w-full btn-secondary p-3 rounded-lg font-medium flex items-center justify-center ${!selectedPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!selectedPlan}
          >
            <Upload className="h-5 w-5 mr-2" />
            {selectedPlan ? 'Adicionar fotos' : 'Escolha um plano primeiro'}
          </button>
        </div>
      )}
      
      {selectedPlan && (
        <p className="text-xs text-text-secondary mt-1">
          Você pode adicionar até {photoLimit} fotos com o plano {selectedPlan === 'basic' ? 'Memórias' : 'Eternidade'}
        </p>
      )}
    </div>
  );
};

export default PhotoUpload;
