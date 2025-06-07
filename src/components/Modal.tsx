
import { ModalContent } from '@/types/index';

interface ModalProps {
  isOpen: boolean;
  content: ModalContent;
  onClose: () => void;
}

const Modal = ({ isOpen, content, onClose }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal flex items-center justify-center">
      <div className="modal-content">
        <span
          className="float-right text-2xl font-bold cursor-pointer text-text-secondary hover:text-neon-pink"
          onClick={onClose}
        >
          &times;
        </span>
        <h3 className="text-2xl font-bold playfair-display text-white mb-3">{content.title}</h3>
        <p className="text-md text-text-secondary">{content.message}</p>
        <button
          onClick={onClose}
          className="btn-primary mt-4 px-6 py-2 rounded-lg"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Modal;
