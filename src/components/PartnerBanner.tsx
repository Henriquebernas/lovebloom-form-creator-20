
import { Partner } from '@/types/database';

interface PartnerBannerProps {
  partner: Partner;
  hasCustomPricing: boolean;
}

const PartnerBanner = ({ partner, hasCustomPricing }: PartnerBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-neon-pink/20 to-purple-600/20 border border-neon-pink/30 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            🎉 Oferta Especial de {partner.name}
          </h3>
          <p className="text-text-secondary text-sm">
            {hasCustomPricing 
              ? 'Preços exclusivos para você!' 
              : 'Você está sendo atendido por nosso parceiro'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary">Código do Vendedor</p>
          <p className="text-neon-pink font-mono font-bold">{partner.referral_code}</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerBanner;
