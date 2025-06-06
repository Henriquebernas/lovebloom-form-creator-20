import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { extractYouTubeVideoId, createYouTubeEmbedUrl } from '../utils/youtubeUtils';

const Counter = () => {
  const location = useLocation();
  const state = location.state as any;
  
  const [countdown, setCountdown] = useState<string>('Calculando...');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Dados de exemplo ou do estado passado
  const data = state || {
    coupleName: "André & Carol",
    startDate: "2020-03-11",
    startTime: "12:35",
    message: "Eu te amo! E eu amo passar meu tempo com você! Contando nosso tempo juntos para sempre!",
    photoUrls: ["https://placehold.co/360x640/1a1a2e/e0e0e0?text=Andr%C3%A9+%26+Carol+9:16"],
    musicUrl: ""
  };

  const photos = data.photoUrls || ["https://placehold.co/360x640/1a1a2e/e0e0e0?text=Andr%C3%A9+%26+Carol+9:16"];
  const videoId = extractYouTubeVideoId(data.musicUrl);
  const embedUrl = videoId ? createYouTubeEmbedUrl(videoId) : null;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const toggleMute = () => {
    if (iframeRef.current) {
      // Send message to iframe to toggle mute
      const action = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"${action}","args":""}`,
        '*'
      );
      setIsMuted(!isMuted);
    }
  };

  const startDisplayCountdown = (startDate: string, startTime: string = "00:00") => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    if (!startDate) {
      setCountdown('Data de início não definida.');
      return;
    }

    const startDateTimeString = `${startDate}T${startTime}`;
    const relationshipStartDate = new Date(startDateTimeString);

    if (isNaN(relationshipStartDate.getTime())) {
      setCountdown('Data inválida.');
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - relationshipStartDate.getTime();

      if (diff < 0) {
        setCountdown('Contagem regressiva para o grande dia!');
        return;
      }

      let years = now.getFullYear() - relationshipStartDate.getFullYear();
      let months = now.getMonth() - relationshipStartDate.getMonth();
      let days = now.getDate() - relationshipStartDate.getDate();
      let hours = now.getHours() - relationshipStartDate.getHours();
      let minutes = now.getMinutes() - relationshipStartDate.getMinutes();
      let seconds = now.getSeconds() - relationshipStartDate.getSeconds();

      if (seconds < 0) { seconds += 60; minutes--; }
      if (minutes < 0) { minutes += 60; hours--; }
      if (hours < 0) { hours += 24; days--; }
      if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }
      if (months < 0) { months += 12; years--; }
      
      years = Math.max(0, years);

      setCountdown(`${years} anos, ${months} meses, ${days} dias<br>${hours} horas, ${minutes} minutos e ${seconds} segundos`);
    }, 1000);
  };

  useEffect(() => {
    startDisplayCountdown(data.startDate, data.startTime);
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [data.startDate, data.startTime]);

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
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-5 overflow-x-hidden relative">
      {/* YouTube Video Background */}
      {embedUrl && (
        <>
          <div className="fixed inset-0 w-full h-full z-0">
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="w-full h-full object-cover"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100vw',
                height: '56.25vw', // 16:9 aspect ratio
                minHeight: '100vh',
                minWidth: '177.77vh', // 16:9 aspect ratio
                transform: 'translate(-50%, -50%)',
              }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {/* Dark overlay for readability */}
          <div className="fixed inset-0 bg-black bg-opacity-40 z-10"></div>
        </>
      )}

      <header className="absolute top-0 left-0 right-0 p-4 text-center z-20">
        <Link to="/" className="text-2xl playfair-display font-bold text-white drop-shadow-lg">
          Love<span className="text-neon-pink">Bloom</span>
        </Link>
      </header>

      {/* Volume Controls */}
      {embedUrl && (
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-30 bg-black bg-opacity-50 p-3 rounded-full shadow-lg text-white hover:bg-opacity-70 transition-colors"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}

      <div className="counter-main-container bg-element-bg bg-opacity-90 p-5 rounded-xl shadow-2xl max-w-sm w-full text-center relative z-20">
        {/* Floating Hearts */}
        <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
          top: '8%', 
          left: '8%', 
          fontSize: '20px',
          animation: 'floatHeart 8s infinite ease-in-out 0s'
        }}>❤</span>
        <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
          top: '15%', 
          right: '12%', 
          fontSize: '14px',
          animation: 'floatHeart 8s infinite ease-in-out 1s'
        }}>💖</span>
        <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
          bottom: '25%', 
          left: '5%', 
          fontSize: '18px',
          animation: 'floatHeart 8s infinite ease-in-out 2s'
        }}>💕</span>
        <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
          bottom: '12%', 
          right: '8%', 
          fontSize: '22px',
          animation: 'floatHeart 8s infinite ease-in-out 3s'
        }}>💗</span>
        <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
          top: '35%', 
          left: '20%', 
          fontSize: '16px',
          animation: 'floatHeart 8s infinite ease-in-out 1.5s'
        }}>💓</span>
        <span className="floating-heart absolute opacity-0 pointer-events-none text-neon-pink" style={{
          top: '3%', 
          right: '25%', 
          fontSize: '18px',
          animation: 'floatHeart 8s infinite ease-in-out 2.5s'
        }}>💝</span>

        {/* Photo Container */}
        <div className="relative w-full rounded-lg overflow-hidden mb-5 border-2 border-neon-pink bg-element-bg-lighter" style={{ aspectRatio: '9/16' }}>
          <img 
            src={photos[currentPhotoIndex]}
            alt={`Foto ${currentPhotoIndex + 1} de ${data.coupleName || 'Casal'}`}
            className="w-full h-full object-cover block transition-opacity duration-500"
          />
          
          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Photo Indicators */}
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
            </>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2 text-text-primary playfair-display">
          Juntos
        </h2>
        
        <div 
          className="text-lg leading-relaxed text-neon-pink font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: countdown }}
        />

        <div className="text-sm text-text-secondary mt-4 pt-2 border-t border-opacity-20" style={{ borderColor: '#ff007f' }}>
          <p>{data.message}</p>
        </div>
      </div>

      <style>{`
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
          10%, 90% { opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(15deg) scale(1.1); opacity: 1; }
        }
        .counter-main-container {
          box-shadow: 0 0 25px rgba(0,0,0,0.3), 0 0 10px rgba(255, 0, 127, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Counter;
