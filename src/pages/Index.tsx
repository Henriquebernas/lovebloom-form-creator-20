
import { useState, useEffect, useRef } from 'react';
import { Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormData, ModalContent } from '@/types/index';
import { usePayments } from '@/hooks/usePayments';
import PlanSelector from '@/components/PlanSelector';
import PhotoUpload from '@/components/PhotoUpload';
import PreviewCard from '@/components/PreviewCard';
import Modal from '@/components/Modal';
import EmailCaptureModal from '@/components/EmailCaptureModal';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createPayment } = usePayments();
  
  const [formData, setFormData] = useState<FormData>({
    coupleName: '',
    startDate: '',
    startTime: '',
    message: '',
    selectedPlan: '',
    couplePhotos: [],
    musicUrl: '',
    email: '',
    urlSlug: ''
  });

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<string>('0 anos, 0 meses, 0 dias<br>0 horas, 0 minutos, 0 segundos');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: '', message: '' });
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPhotoLimit = () => {
    return formData.selectedPlan === 'basic' ? 2 : formData.selectedPlan === 'premium' ? 5 : 0;
  };

  const formatCoupleName = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'coupleName') {
      const formattedValue = formatCoupleName(value);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const photoLimit = getPhotoLimit();
    
    if (!photoLimit) {
      setModalContent({ title: 'Ops!', message: 'Por favor, escolha um plano primeiro.' });
      setShowModal(true);
      return;
    }

    const currentPhotos = formData.couplePhotos;
    const newPhotos = [...currentPhotos, ...files].slice(0, photoLimit);
    
    if (files.length > photoLimit - currentPhotos.length) {
      setModalContent({ 
        title: 'Limite de fotos', 
        message: `Você pode adicionar no máximo ${photoLimit} fotos com este plano.` 
      });
      setShowModal(true);
    }

    setFormData(prev => ({ ...prev, couplePhotos: newPhotos }));
    
    const newPreviews = newPhotos.map(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
      });
    });

    Promise.all(newPreviews).then(previews => {
      setPhotoPreviews(previews);
    });

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.couplePhotos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, couplePhotos: newPhotos }));
    setPhotoPreviews(newPreviews);
  };

  const handlePlanSelect = (plan: string) => {
    setFormData(prev => ({ 
      ...prev, 
      selectedPlan: plan,
      musicUrl: plan === 'basic' ? '' : prev.musicUrl
    }));
    
    const newLimit = plan === 'basic' ? 2 : plan === 'premium' ? 5 : 0;
    if (formData.couplePhotos.length > newLimit) {
      const trimmedPhotos = formData.couplePhotos.slice(0, newLimit);
      const trimmedPreviews = photoPreviews.slice(0, newLimit);
      setFormData(prev => ({ ...prev, couplePhotos: trimmedPhotos }));
      setPhotoPreviews(trimmedPreviews);
    }
  };

  const calculateCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    const { startDate, startTime } = formData;
    
    if (!startDate) {
      setCountdown('0 anos, 0 meses, 0 dias<br>0 horas, 0 minutos, 0 segundos');
      return;
    }

    const timeStr = startTime || "00:00";
    const startDateTimeString = `${startDate}T${timeStr}`;
    const relationshipStartDate = new Date(startDateTimeString);

    if (isNaN(relationshipStartDate.getTime())) {
      setCountdown('<span class="text-red-400">Data inválida</span>');
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
    calculateCountdown();
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [formData.startDate, formData.startTime]);

  const handlePaymentClick = () => {
    if (!formData.coupleName) {
      setModalContent({ title: 'Ops!', message: 'Por favor, informe o nome do casal.' });
      setShowModal(true);
      return;
    }
    if (!formData.startDate) {
      setModalContent({ title: 'Ops!', message: 'Por favor, informe a data de início do relacionamento.' });
      setShowModal(true);
      return;
    }
    if (!formData.selectedPlan) {
      setModalContent({ title: 'Ops!', message: 'Por favor, escolha um plano.' });
      setShowModal(true);
      return;
    }

    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email: string) => {
    setIsCreatingPayment(true);
    
    try {
      console.log('Iniciando processo de pagamento...');
      
      const planAmounts = {
        basic: 1990, // R$ 19,90 em centavos
        premium: 2990 // R$ 29,90 em centavos
      };

      const result = await createPayment.mutateAsync({
        coupleName: formData.coupleName,
        startDate: formData.startDate,
        startTime: formData.startTime,
        message: formData.message,
        planType: formData.selectedPlan as 'basic' | 'premium',
        amount: planAmounts[formData.selectedPlan as keyof typeof planAmounts],
        couplePhotos: formData.couplePhotos,
        musicUrl: formData.musicUrl,
        email: email
      });

      console.log('Redirecionando para o Mercado Pago...');
      
      // Redirecionar para o Mercado Pago
      window.location.href = result.init_point;

    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      setModalContent({ 
        title: 'Erro!', 
        message: 'Ocorreu um erro ao processar seu pagamento. Tente novamente.' 
      });
      setShowModal(true);
      setShowEmailModal(false);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl playfair-display font-bold text-white">
              Love<span className="text-neon-pink">Bloom</span>
            </h1>
            <p className="text-lg text-text-secondary mt-2">Celebre cada momento do seu amor.</p>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form Section */}
            <div className="lg:w-1/2 p-6 sm:p-8 rounded-xl custom-shadow" style={{ backgroundColor: 'rgba(26, 26, 46, 0.7)' }}>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 playfair-display">Quase lá!</h2>
              <p className="text-text-secondary mb-6">Preencha os dados para criar seu contador personalizado.</p>

              <form className="space-y-5">
                {/* Couple Name */}
                <div>
                  <label htmlFor="coupleName" className="block text-sm font-medium text-text-secondary mb-1">
                    Nome do Casal
                  </label>
                  <input
                    type="text"
                    id="coupleName"
                    name="coupleName"
                    value={formData.coupleName}
                    onChange={handleInputChange}
                    className="w-full p-3 input-field"
                    placeholder="Ex: João & Maria (Não use emoji)"
                    disabled={isCreatingPayment}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary mb-1">
                      Início do Relacionamento
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full p-3 input-field"
                      disabled={isCreatingPayment}
                    />
                  </div>
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-text-secondary mb-1">
                      Hora (opcional)
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full p-3 input-field"
                      disabled={isCreatingPayment}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">
                    Mensagem Especial
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full p-3 input-field resize-none"
                    placeholder="Escreva sua linda mensagem aqui..."
                    disabled={isCreatingPayment}
                  />
                </div>

                {/* Plans */}
                <PlanSelector 
                  selectedPlan={formData.selectedPlan}
                  onPlanSelect={handlePlanSelect}
                  disabled={isCreatingPayment}
                />

                {/* Video URL - Only shown for premium plan */}
                {formData.selectedPlan === 'premium' && (
                  <div>
                    <label htmlFor="musicUrl" className="block text-sm font-medium text-text-secondary mb-1">
                      Link do Vídeo YouTube (opcional)
                    </label>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                      <input
                        type="url"
                        id="musicUrl"
                        name="musicUrl"
                        value={formData.musicUrl}
                        onChange={handleInputChange}
                        className="w-full p-3 pl-12 input-field"
                        placeholder="https://www.youtube.com/watch?v=..."
                        disabled={isCreatingPayment}
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Cole o link do YouTube que será reproduzido como fundo do contador</p>
                  </div>
                )}

                {/* Photo Upload */}
                <PhotoUpload
                  selectedPlan={formData.selectedPlan}
                  couplePhotos={formData.couplePhotos}
                  photoPreviews={photoPreviews}
                  onFileChange={handleFileChange}
                  onRemovePhoto={removePhoto}
                  disabled={isCreatingPayment}
                />
              </form>
            </div>

            {/* Preview Section */}
            <div className="lg:w-1/2 flex flex-col items-center">
              <p className="text-sm text-text-secondary mb-2">Como vai ficar:</p>
              <PreviewCard
                coupleName={formData.coupleName}
                message={formData.message}
                photoPreviews={photoPreviews}
                countdown={countdown}
                selectedPlan={formData.selectedPlan}
                musicUrl={formData.musicUrl}
              />
              <button
                type="button"
                onClick={handlePaymentClick}
                disabled={isCreatingPayment}
                className="btn-primary w-full max-w-md mt-6 p-4 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingPayment ? 'Processando...' : 'Pagar com PIX ou Cartão'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        isLoading={isCreatingPayment}
      />

      {/* Error Modal */}
      <Modal
        isOpen={showModal}
        content={modalContent}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default Index;
