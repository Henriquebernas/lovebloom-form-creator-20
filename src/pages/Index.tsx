import { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  coupleName: string;
  startDate: string;
  startTime: string;
  message: string;
  selectedPlan: string;
  couplePhoto: File | null;
}

const Index = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    coupleName: '',
    startDate: '',
    startTime: '',
    message: '',
    selectedPlan: '',
    couplePhoto: null,
  });

  const [photoPreview, setPhotoPreview] = useState<string>('https://placehold.co/200x200/374151/e0e0e0?text=Foto+Casal');
  const [fileName, setFileName] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('0 anos, 0 meses, 0 dias<br>0 horas, 0 minutos, 0 segundos');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string }>({ title: '', message: '' });
  
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, couplePhoto: file }));
      setFileName(file.name);
    } else {
      setPhotoPreview('https://placehold.co/200x200/374151/e0e0e0?text=Foto+Casal');
      setFormData(prev => ({ ...prev, couplePhoto: null }));
      setFileName('');
    }
  };

  const handlePlanSelect = (plan: string) => {
    setFormData(prev => ({ ...prev, selectedPlan: plan }));
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

      setCountdown(`${years} anos, ${months} meses, ${days} dias<br>${hours} horas, ${minutes} minutos, ${seconds} segundos`);
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

  const getSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'seunome';
  };

  const getPlanDisplay = () => {
    if (formData.selectedPlan === 'basic') return 'Plano: Memórias (R$29)';
    if (formData.selectedPlan === 'premium') return 'Plano: Eternidade (R$40)';
    return '';
  };

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
        photoUrl: photoPreview !== 'https://placehold.co/200x200/374151/e0e0e0?text=Foto+Casal' ? photoPreview : "https://placehold.co/360x640/1a1a2e/ff007f?text=Foto+9:16"
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
                  placeholder="Ex: João & Maria"
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
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Escolha um Plano</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`plan-card p-4 rounded-lg text-center ${formData.selectedPlan === 'basic' ? 'selected' : ''}`}
                    onClick={() => handlePlanSelect('basic')}
                  >
                    <h3 className="font-semibold text-lg text-white">Memórias</h3>
                    <p className="text-sm text-text-secondary">1 ano, 1 foto, sem música</p>
                    <p className="font-bold text-xl text-neon-pink mt-1">R$29</p>
                  </div>
                  <div
                    className={`plan-card p-4 rounded-lg text-center ${formData.selectedPlan === 'premium' ? 'selected' : ''}`}
                    onClick={() => handlePlanSelect('premium')}
                  >
                    <h3 className="font-semibold text-lg text-white">Eternidade</h3>
                    <p className="text-sm text-text-secondary">Para sempre, 3 fotos, com música</p>
                    <p className="font-bold text-xl text-neon-pink mt-1">R$40</p>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Foto do Casal</label>
                <div className="relative">
                  <input
                    type="file"
                    id="couplePhoto"
                    name="couplePhoto"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <button
                    type="button"
                    className="w-full btn-secondary p-3 rounded-lg font-medium flex items-center justify-center"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Escolher arquivo
                  </button>
                </div>
                {fileName && <p className="text-xs text-text-secondary mt-1">{fileName}</p>}
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="lg:w-1/2 flex flex-col items-center">
            <p className="text-sm text-text-secondary mb-2">Como vai ficar:</p>
            <div className="w-full max-w-md preview-card rounded-xl custom-shadow overflow-hidden">
              <div className="preview-header p-3 text-center">
                <span className="text-white text-sm font-medium">
                  lovebloom.com/{getSlugFromName(formData.coupleName)}
                </span>
              </div>
              <div className="p-6 text-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-700 mx-auto rounded-lg mb-6 flex items-center justify-center overflow-hidden border-2 border-border-color">
                  <img
                    src={photoPreview}
                    alt="Pré-visualização da foto"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-2xl playfair-display font-bold text-white mb-1">
                  {formData.coupleName || 'Nome do Casal'}
                </h3>
                <p className="text-text-secondary text-sm mb-4 italic h-12 overflow-y-auto">
                  {formData.message || 'Sua mensagem especial aparecerá aqui.'}
                </p>

                <div className="preview-countdown-bg p-4 rounded-lg mb-4">
                  <p className="text-lg font-semibold text-white mb-1">Juntos há:</p>
                  <div 
                    className="text-xl sm:text-2xl font-bold text-neon-pink"
                    dangerouslySetInnerHTML={{ __html: countdown }}
                  />
                </div>
                <p className="text-xs text-text-secondary">{getPlanDisplay()}</p>
              </div>
            </div>
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
      {showModal && (
        <div className="modal flex items-center justify-center">
          <div className="modal-content">
            <span
              className="float-right text-2xl font-bold cursor-pointer text-text-secondary hover:text-neon-pink"
              onClick={() => setShowModal(false)}
            >
              &times;
            </span>
            <h3 className="text-2xl font-bold playfair-display text-white mb-3">{modalContent.title}</h3>
            <p className="text-md text-text-secondary">{modalContent.message}</p>
            <button
              onClick={() => setShowModal(false)}
              className="btn-primary mt-4 px-6 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
