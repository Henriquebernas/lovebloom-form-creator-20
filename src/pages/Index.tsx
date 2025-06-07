
import { useState, useEffect, useRef } from 'react';
import { Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormData, ModalContent } from '@/types/index';
import PlanSelector from '@/components/PlanSelector';
import PhotoUpload from '@/components/PhotoUpload';
import PreviewCard from '@/components/PreviewCard';
import Modal from '@/components/Modal';

const Index = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    coupleName: '',
    startDate: '',
    startTime: '',
    message: '',
    selectedPlan: '',
    couplePhotos: [],
    musicUrl: '',
  });

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<string>('0 anos, 0 meses, 0 dias<br>0 horas, 0 minutos, 0 segundos');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: '', message: '' });
  
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPhotoLimit = () => {
    return formData.selectedPlan === 'basic' ? 2 : formData.selectedPlan === 'premium' ? 5 : 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    // Reset file input
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
      // Clear music URL if switching to basic plan
      musicUrl: plan === 'basic' ? '' : prev.musicUrl
    }));
    
    // If switching to a plan with fewer photos, trim the photos array
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

  const handleCreateSite = () => {
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
    
    navigate('/counter', {
      state: {
        coupleName: formData.coupleName,
        startDate: formData.startDate,
        startTime: formData.startTime,
        message: formData.message,
        photoUrls: photoPreviews.length > 0 ? photoPreviews : ["https://placehold.co/360x640/1a1a2e/ff007f?text=Foto+9:16"],
        musicUrl: formData.musicUrl
      }
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
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
                />
              </div>

              {/* Plans */}
              <PlanSelector 
                selectedPlan={formData.selectedPlan}
                onPlanSelect={handlePlanSelect}
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
              onClick={handleCreateSite}
              className="btn-primary w-full max-w-md mt-6 p-4 rounded-lg text-lg font-semibold"
            >
              Criar Nosso Site Personalizado
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        content={modalContent}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default Index;
