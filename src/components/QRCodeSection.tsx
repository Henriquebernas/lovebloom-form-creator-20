
import React, { useRef } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

interface QRCodeSectionProps {
  coupleName: string;
  pageUrl: string;
}

const QRCodeSection = ({ coupleName, pageUrl }: QRCodeSectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    if (canvasRef.current) {
      try {
        await QRCode.toCanvas(canvasRef.current, pageUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    }
  };

  const downloadQRCode = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 300;
      canvas.height = 350;
      
      if (ctx) {
        // Fundo branco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Gerar QR code em um canvas temporário
        const tempCanvas = document.createElement('canvas');
        await QRCode.toCanvas(tempCanvas, pageUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Desenhar o QR code centralizado
        const qrX = (canvas.width - tempCanvas.width) / 2;
        const qrY = 30;
        ctx.drawImage(tempCanvas, qrX, qrY);
        
        // Adicionar texto abaixo do QR code
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(coupleName, canvas.width / 2, qrY + tempCanvas.height + 40);
        
        ctx.font = '14px Arial';
        ctx.fillText('Escaneie para acessar nossa página', canvas.width / 2, qrY + tempCanvas.height + 65);
        
        // Criar link de download
        const link = document.createElement('a');
        link.download = `qrcode-${coupleName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
    }
  };

  // Gerar QR code quando o componente montar
  React.useEffect(() => {
    generateQRCode();
  }, [pageUrl]);

  return (
    <div className="mt-8 pt-6 border-t border-border-color text-center">
      <h3 className="text-lg font-semibold text-white mb-4 playfair-display">
        Compartilhe nossa página
      </h3>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <canvas 
            ref={canvasRef}
            className="block"
          />
        </div>
        
        <p className="text-sm text-text-secondary max-w-xs">
          Escaneie o QR Code para acessar nossa página do amor
        </p>
        
        <Button
          onClick={downloadQRCode}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Baixar QR Code
        </Button>
      </div>
    </div>
  );
};

export default QRCodeSection;
