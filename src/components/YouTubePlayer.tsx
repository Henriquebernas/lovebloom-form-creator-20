
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { extractYouTubeVideoId, loadYouTubeAPI } from '../utils/youtubeUtils';

interface YouTubePlayerProps {
  musicUrl: string;
  isBackground?: boolean;
}

const YouTubePlayer = ({ musicUrl, isBackground = false }: YouTubePlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  
  const videoId = extractYouTubeVideoId(musicUrl);

  const toggleMute = () => {
    if (youtubePlayer && isPlayerReady) {
      if (isMuted) {
        youtubePlayer.unMute();
        youtubePlayer.setVolume(50);
      } else {
        youtubePlayer.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  // Inicializar YouTube Player
  useEffect(() => {
    if (!videoId) return;

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();
        
        if (playerContainerRef.current && window.YT && window.YT.Player) {
          const player = new window.YT.Player(playerContainerRef.current, {
            height: isBackground ? '200' : '200',
            width: '100%',
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              mute: isMuted ? 1 : 0,
              loop: 1,
              playlist: videoId,
              controls: 1,
              showinfo: 1,
              rel: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              playsinline: 1,
              enablejsapi: 1
            },
            events: {
              onReady: (event: any) => {
                console.log('YouTube player ready');
                setYoutubePlayer(event.target);
                setIsPlayerReady(true);
                
                if (!isMuted) {
                  event.target.unMute();
                  event.target.setVolume(50);
                }
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  event.target.playVideo();
                }
              },
              onError: (event: any) => {
                console.error('YouTube player error:', event.data);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    };

    initializePlayer();
  }, [videoId, isMuted, isBackground]);

  if (!videoId) return null;

  if (isBackground) {
    return (
      <>
        <div className="fixed inset-0 w-full h-full z-0">
          <div
            ref={playerContainerRef}
            className="w-full h-full"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.77vh',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
        <div className="fixed inset-0 bg-black bg-opacity-40 z-10"></div>
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-30 bg-black bg-opacity-50 p-3 rounded-full shadow-lg text-white hover:bg-opacity-70 transition-colors"
          title={isMuted ? 'Ativar som' : 'Desativar som'}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border-2 border-neon-pink bg-black relative">
      <div
        ref={playerContainerRef}
        className="w-full"
        style={{ height: '200px' }}
      />
      
      <button
        onClick={toggleMute}
        className="absolute top-2 right-2 bg-black bg-opacity-70 p-2 rounded-full shadow-lg text-white hover:bg-opacity-90 transition-colors z-10"
        title={isMuted ? 'Ativar som' : 'Desativar som'}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default YouTubePlayer;
