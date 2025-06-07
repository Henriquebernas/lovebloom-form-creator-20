

import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { extractYouTubeVideoId, createYouTubeEmbedUrl, loadYouTubeAPI } from '../utils/youtubeUtils';

const Counter = () => {
  const location = useLocation();
  const { coupleData } = location.state || {};
  
  if (!coupleData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neon-pink mb-4">Dados não encontrados</h2>
          <Link to="/" className="btn-primary px-6 py-3 rounded-lg font-semibold">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const [countdown, setCountdown] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === coupleData.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? coupleData.photos.length - 1 : prev - 1
    );
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const initializePlayer = async () => {
      if (coupleData.youtubeUrl && playerContainerRef.current) {
        const videoId = extractYouTubeVideoId(coupleData.youtubeUrl);
        if (videoId) {
          try {
            await loadYouTubeAPI();
            
            playerRef.current = new window.YT.Player(playerContainerRef.current, {
              videoId: videoId,
              playerVars: {
                autoplay: 1,
                controls: 0,
                loop: 1,
                mute: 1,
                playlist: videoId,
                showinfo: 0,
                rel: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline: 1,
                origin: window.location.origin
              },
              events: {
                onReady: (event: any) => {
                  console.log('YouTube player ready');
                  event.target.setVolume(50);
                },
                onStateChange: (event: any) => {
                  if (event.data === window.YT.PlayerState.ENDED) {
                    event.target.playVideo();
                  }
                }
              }
            });
          } catch (error) {
            console.error('Erro ao carregar player do YouTube:', error);
          }
        }
      }
    };

    initializePlayer();
  }, [coupleData.youtubeUrl]);

  useEffect(() => {
    const calculateCountdown = () => {
      const startDate = new Date(coupleData.startDate);
      const now = new Date();
      
      // Calculate the difference in milliseconds
      const diffInMs = now.getTime() - startDate.getTime();
      
      // Convert to total days
      const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      // Calculate years, months, and remaining days
      let years = 0;
      let months = 0;
      let days = totalDays;
      
      // Calculate years (approximately 365.25 days per year)
      years = Math.floor(days / 365.25);
      days = days - Math.floor(years * 365.25);
      
      // Calculate months (approximately 30.44 days per month)
      months = Math.floor(days / 30.44);
      days = Math.floor(days - (months * 30.44));
      
      // Calculate hours, minutes, and seconds for the current day
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Ensure no negative values
      days = Math.max(0, days);
      months = Math.max(0, months);
      
      years = Math.max(0, years);

      // Construir a string de exibição apenas com valores não-zero
      const timeParts = [];
      
      if (years > 0) {
        timeParts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
      }
      
      if (months > 0) {
        timeParts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
      }
      
      if (days > 0) {
        timeParts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
      }

      const timeString = timeParts.join(', ');
      const detailString = `${hours} horas, ${minutes} minutos e ${seconds} segundos`;

      setCountdown(`${timeString}<br>${detailString}`);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [coupleData.startDate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Header com nome do site */}
      <header className="bg-element-bg border-b border-border-color px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neon-pink playfair-display">
            LoveBloom
          </h1>
          <Link 
            to="/" 
            className="btn-secondary px-4 py-2 rounded-lg font-semibold hover:bg-element-bg-lighter transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Cabeçalho do casal */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-neon-pink playfair-display mb-4">
            {coupleData.partner1} & {coupleData.partner2}
          </h2>
          <p className="text-xl text-text-secondary mb-6">
            Juntos desde {formatDate(coupleData.startDate)}
          </p>
          
          {/* Contador */}
          <div className="bg-element-bg rounded-2xl p-8 custom-shadow">
            <h3 className="text-2xl font-semibold text-neon-pink mb-4">Tempo Juntos</h3>
            <div 
              className="text-3xl md:text-4xl font-bold text-text-primary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: countdown }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Galeria de fotos */}
          <div className="bg-element-bg rounded-2xl p-6 custom-shadow">
            <h3 className="text-2xl font-semibold text-neon-pink mb-6">Nossas Memórias</h3>
            
            {coupleData.photos && coupleData.photos.length > 0 ? (
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-xl mb-4">
                  <img
                    src={coupleData.photos[currentImageIndex]}
                    alt={`Foto ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {coupleData.photos.length > 1 && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={prevImage}
                        className="btn-secondary p-3 rounded-full hover:bg-element-bg-lighter transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      
                      <span className="text-text-secondary">
                        {currentImageIndex + 1} de {coupleData.photos.length}
                      </span>
                      
                      <button
                        onClick={nextImage}
                        className="btn-secondary p-3 rounded-full hover:bg-element-bg-lighter transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="flex justify-center space-x-2">
                      {coupleData.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex 
                              ? 'bg-neon-pink' 
                              : 'bg-border-color hover:bg-text-secondary'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-text-secondary py-12">
                <p>Nenhuma foto foi adicionada ainda.</p>
              </div>
            )}
          </div>

          {/* Player de música */}
          <div className="bg-element-bg rounded-2xl p-6 custom-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-neon-pink">Nossa Música</h3>
              {coupleData.youtubeUrl && (
                <button
                  onClick={toggleMute}
                  className="btn-secondary p-3 rounded-full hover:bg-element-bg-lighter transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
            </div>
            
            {coupleData.youtubeUrl ? (
              <div className="aspect-video rounded-xl overflow-hidden">
                <div 
                  ref={playerContainerRef}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video bg-element-bg-lighter rounded-xl flex items-center justify-center">
                <p className="text-text-secondary text-center">
                  Nenhuma música foi adicionada ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counter;
