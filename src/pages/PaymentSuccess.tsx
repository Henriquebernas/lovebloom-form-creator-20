
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { useCouples } from '@/hooks/useCouples';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getCoupleById } = useCouples();
  const [couple, setCouple] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const coupleId = searchParams.get('couple');

  useEffect(() => {
    const loadCouple = async () => {
      if (!coupleId) {
        navigate('/');
        return;
      }

      try {
        const coupleData = await getCoupleById(coupleId);
        setCouple(coupleData);
      } catch (error) {
        console.error('Erro ao carregar casal:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadCouple();
  }, [coupleId, navigate, getCoupleById]);

  const handleViewSite = () => {
    if (couple?.url_slug) {
      navigate(`/${couple.url_slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-pink mx-auto mb-4"></div>
          <p>Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-xl custom-shadow" style={{ backgroundColor: 'rgba(26, 26, 46, 0.7)' }}>
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2 playfair-display">
                Pagamento Aprovado!
              </h1>
              <p className="text-text-secondary">
                Parabéns! Seu site do casal foi ativado com sucesso.
              </p>
            </div>

            {couple && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4 mb-6">
                <h3 className="text-green-400 font-semibold mb-2">Site Ativado</h3>
                <p className="text-text-secondary text-sm mb-3">
                  O site do casal <span className="text-white font-semibold">{couple.couple_name}</span> está pronto!
                </p>
                <p className="text-text-secondary text-sm">
                  Link: <span className="text-neon-pink">/{couple.url_slug}</span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleViewSite}
                className="w-full btn-primary p-3 rounded-lg font-semibold flex items-center justify-center"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Ver Meu Site
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full text-text-secondary hover:text-white transition-colors p-3 border border-border-color rounded-lg"
              >
                Criar Outro Site
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">Próximos passos:</h3>
              <ul className="text-text-secondary text-sm space-y-1 text-left">
                <li>• Compartilhe o link com seus amigos e familiares</li>
                <li>• Use o QR Code para facilitar o compartilhamento</li>
                <li>• Você receberá um email de confirmação em breve</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
