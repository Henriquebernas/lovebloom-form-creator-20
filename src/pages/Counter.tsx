
import { useLocation, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { extractYouTubeVideoId } from '../utils/youtubeUtils';
import { useCountdown } from '../hooks/useCountdown';
import { useCouples } from '../hooks/useCouples';
import { supabase } from '@/integrations/supabase/client';
import FloatingHearts from '../components/FloatingHearts';
import PhotoGallery from '../components/PhotoGallery';
import YouTubePlayer from '../components/YouTubePlayer';
import QRCodeSection from '../components/QRCodeSection';
import Footer from '../components/Footer';

const Counter = () => {
  const location = useLocation();
  const { coupleId, coupleSlug } = useParams();
  const { getCoupleById, getPhotos } = useCouples();
  const [coupleData, setCoupleData] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Dados do estado passado pela navegação (para novos casais)
  const state = location.state as any;

  useEffect(() => {
    // Evitar múltiplas execuções se os dados já foram carregados
    if (dataLoaded) return;

    const loadCoupleData = async () => {
      // Se há um coupleId na URL, carregue do banco pelo ID
      if (coupleId) {
        setLoading(true);
        try {
          console.log('Carregando dados do casal:', coupleId);
          const couple = await getCoupleById(coupleId);
          const couplePhotos = await getPhotos(coupleId);
          
          setCoupleData({
            coupleName: couple.couple_name,
            startDate: couple.start_date,
            startTime: couple.start_time || '',
            message: couple.message || '',
            musicUrl: couple.music_url || ''
          });
          
          setPhotos(couplePhotos.map(photo => photo.photo_url));
          console.log('Dados carregados com sucesso');
        } catch (error) {
          console.error('Erro ao carregar dados do casal:', error);
          setCoupleData({
            coupleName: "Erro ao Carregar",
            startDate: new Date().toISOString().split('T')[0],
            startTime: "00:00",
            message: "Erro ao carregar dados do casal",
            musicUrl: ""
          });
          setPhotos(["https://placehold.co/360x640/1a1a2e/e0e0e0?text=Erro+ao+Carregar"]);
        } finally {
          setLoading(false);
          setDataLoaded(true);
        }
      }
      // Se há um coupleSlug na URL, carregue do banco pelo slug
      else if (coupleSlug) {
        setLoading(true);
        try {
          console.log('Carregando dados do casal pelo slug:', coupleSlug);
          const { data: couple, error } = await supabase
            .from('couples')
            .select('*')
            .eq('url_slug', coupleSlug)
            .single();

          if (error) throw error;

          const couplePhotos = await getPhotos(couple.id);
          
          setCoupleData({
            coupleName: couple.couple_name,
            startDate: couple.start_date,
            startTime: couple.start_time || '',
            message: couple.message || '',
            musicUrl: couple.music_url || ''
          });
          
          setPhotos(couplePhotos.map(photo => photo.photo_url));
          console.log('Dados carregados com sucesso pelo slug');
        } catch (error) {
          console.error('Erro ao carregar dados do casal pelo slug:', error);
          setCoupleData({
            coupleName: "Erro ao Carregar",
            startDate: new Date().toISOString().split('T')[0],
            startTime: "00:00",
            message: "Erro ao carregar dados do casal",
            musicUrl: ""
          });
          setPhotos(["https://placehold.co/360x640/1a1a2e/e0e0e0?text=Erro+ao+Carregar"]);
        } finally {
          setLoading(false);
          setDataLoaded(true);
        }
      }
      // Se há dados do estado (navegação direta), use-os
      else if (state) {
        console.log('Usando dados do estado:', state);
        setCoupleData(state);
        setPhotos(state.photoUrls || []);
        setDataLoaded(true);
      }
      // Fallback para dados padrão
      else {
        console.log('Usando dados padrão');
        setCoupleData({
          coupleName: "André & Carol",
          startDate: "2020-03-11",
          startTime: "12:35",
          message: "Eu te amo! E eu amo passar meu tempo com você! Contando nosso tempo juntos para sempre!",
          musicUrl: ""
        });
        setPhotos(["https://placehold.co/360x640/1a1a2e/e0e0e0?text=Andr%C3%A9+%26+Carol+9:16"]);
        setDataLoaded(true);
      }
    };

    loadCoupleData();
  }, [coupleId, coupleSlug, state, getCoupleById, getPhotos, dataLoaded]);

  const data = coupleData;
  const displayPhotos = photos.length > 0 ? photos : ["https://placehold.co/360x640/1a1a2e/e0e0e0?text=Sem+Fotos"];
  const videoId = data ? extractYouTubeVideoId(data.musicUrl) : null;
  const countdown = useCountdown(data?.startDate || '', data?.startTime || '');

  // Gerar URL da página atual
  const currentPageUrl = window.location.href;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Nenhum dado encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <header className="absolute top-0 left-0 right-0 p-3 text-center z-20">
        <Link to="/" className="text-lg sm:text-2xl playfair-display font-bold text-white drop-shadow-lg">
          Love<span className="text-neon-pink">Bloom</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 overflow-x-hidden relative">
        <div className="counter-main-container bg-element-bg bg-opacity-90 p-4 sm:p-5 rounded-xl shadow-2xl max-w-xs sm:max-w-sm w-full text-center relative z-20 mt-16 sm:mt-20">
          <FloatingHearts />

          <div className="relative w-full rounded-lg overflow-hidden mb-3 sm:mb-5 bg-element-bg-lighter shadow-lg" style={{ aspectRatio: '9/16', maxHeight: '240px' }}>
            <img 
              src={displayPhotos[0]}
              alt={`Foto de ${data.coupleName || 'Casal'}`}
              className="w-full h-full object-cover block transition-opacity duration-500"
            />
            
            {/* Photo Indicators - Only shown if there are multiple photos */}
            {displayPhotos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {displayPhotos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === 0 ? 'bg-neon-pink' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-text-primary playfair-display">
            {data.coupleName}
          </h2>
          
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-white playfair-display">
            Juntos
          </h3>
          
          <div 
            className="text-base sm:text-lg leading-relaxed text-neon-pink font-bold mb-3 sm:mb-4"
            dangerouslySetInnerHTML={{ __html: countdown }}
          />

          <div className="text-xs sm:text-sm text-text-secondary mt-3 sm:mt-4 pt-2 border-t border-opacity-20 line-clamp-3" style={{ borderColor: '#ff007f' }}>
            <p>{data.message}</p>
          </div>

          {/* YouTube Player Visível - mantido apenas este */}
          {videoId && <YouTubePlayer musicUrl={data.musicUrl} />}

          {/* QR Code Section */}
          <QRCodeSection 
            coupleName={data.coupleName} 
            pageUrl={currentPageUrl}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
          10%, 90% { opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(15deg) scale(1.1); opacity: 1; }
        }
        .counter-main-container {
          box-shadow: 0 0 25px rgba(0,0,0,0.3), 0 0 10px rgba(255, 0, 127, 0.4);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Counter;
