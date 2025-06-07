
import { useLocation, Link } from 'react-router-dom';
import { extractYouTubeVideoId } from '../utils/youtubeUtils';
import { useCountdown } from '../hooks/useCountdown';
import FloatingHearts from '../components/FloatingHearts';
import PhotoGallery from '../components/PhotoGallery';
import YouTubePlayer from '../components/YouTubePlayer';

const Counter = () => {
  const location = useLocation();
  const state = location.state as any;
  
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
  const countdown = useCountdown(data.startDate, data.startTime);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-5 overflow-x-hidden relative">
      {/* YouTube Video Background */}
      {videoId && <YouTubePlayer musicUrl={data.musicUrl} isBackground={true} />}

      <header className="absolute top-0 left-0 right-0 p-4 text-center z-20 mb-8">
        <Link to="/" className="text-2xl playfair-display font-bold text-white drop-shadow-lg">
          Love<span className="text-neon-pink">Bloom</span>
        </Link>
      </header>

      <div className="counter-main-container bg-element-bg bg-opacity-90 p-5 rounded-xl shadow-2xl max-w-sm w-full text-center relative z-20 mt-20">
        <FloatingHearts />

        <PhotoGallery photos={photos} coupleName={data.coupleName} />

        <h2 className="text-2xl font-bold mb-2 text-text-primary playfair-display">
          {data.coupleName}
        </h2>
        
        <h3 className="text-lg font-semibold mb-2 text-white playfair-display">
          Juntos
        </h3>
        
        <div 
          className="text-lg leading-relaxed text-neon-pink font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: countdown }}
        />

        <div className="text-sm text-text-secondary mt-4 pt-2 border-t border-opacity-20" style={{ borderColor: '#ff007f' }}>
          <p>{data.message}</p>
        </div>

        {/* YouTube Player Visível */}
        {videoId && <YouTubePlayer musicUrl={data.musicUrl} />}
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
