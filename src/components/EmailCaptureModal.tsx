
import { useState } from 'react';
import { X } from 'lucide-react';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isLoading?: boolean;
}

const EmailCaptureModal = ({ isOpen, onClose, onSubmit, isLoading = false }: EmailCaptureModalProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, digite seu e-mail');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Por favor, digite um e-mail válido');
      return;
    }

    setError('');
    onSubmit(email);
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-element-bg rounded-lg shadow-lg max-w-md w-full relative custom-shadow">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-3 right-3 p-1 rounded-full bg-neon-pink text-white hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-center playfair-display">
            Digite seu e-mail para receber o QR Code
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full p-3 input-field text-text-primary placeholder-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando...' : 'Pagar com Pix ou Cartão'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailCaptureModal;
