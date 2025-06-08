
import { useState, useEffect } from 'react';

interface PhotoGalleryProps {
  photos: string[];
  coupleName: string;
}

const PhotoGallery = ({ photos, coupleName }: PhotoGalleryProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  // Auto-advance photos every 5 seconds if there are multiple photos
  useEffect(() => {
    if (photos.length > 1) {
      const interval = setInterval(() => {
        nextPhoto();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [photos.length]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden mb-5 bg-element-bg-lighter shadow-lg" style={{ aspectRatio: '9/16' }}>
      <img 
        src={photos[currentPhotoIndex]}
        alt={`Foto ${currentPhotoIndex + 1} de ${coupleName || 'Casal'}`}
        className="w-full h-full object-cover block transition-opacity duration-500"
      />
      
      {/* Photo Indicators - Only shown if there are multiple photos */}
      {photos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPhotoIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPhotoIndex ? 'bg-neon-pink' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
