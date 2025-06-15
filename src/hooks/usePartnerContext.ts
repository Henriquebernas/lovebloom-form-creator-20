
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Partner, PartnerPricing, PlanPricing } from '@/types/database';

interface PartnerContextData {
  partner: Partner | null;
  pricing: PlanPricing;
  isLoading: boolean;
  error: string | null;
  hasCustomPricing: boolean;
}

const DEFAULT_PRICING: PlanPricing = {
  basic: 1990, // R$ 19,90
  premium: 2990, // R$ 29,90
};

const STORAGE_KEY = 'partner_context';

export const usePartnerContext = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PartnerContextData>({
    partner: null,
    pricing: DEFAULT_PRICING,
    isLoading: false,
    error: null,
    hasCustomPricing: false,
  });

  // Salvar dados do parceiro no localStorage
  const savePartnerData = useCallback((partnerData: PartnerContextData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        partner: partnerData.partner,
        pricing: partnerData.pricing,
        hasCustomPricing: partnerData.hasCustomPricing,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Erro ao salvar dados do parceiro:', error);
    }
  }, []);

  // Carregar dados do parceiro do localStorage
  const loadSavedPartnerData = useCallback((): PartnerContextData | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const hoursDiff = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
      
      // Dados expiram em 24 horas
      if (hoursDiff > 24) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return {
        partner: parsed.partner,
        pricing: parsed.pricing || DEFAULT_PRICING,
        isLoading: false,
        error: null,
        hasCustomPricing: parsed.hasCustomPricing || false,
      };
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  // Buscar parceiro e preços personalizados
  const fetchPartnerData = useCallback(async (referralCode: string) => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Buscar dados do parceiro
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('referral_code', referralCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (partnerError) {
        throw new Error('Código de parceiro inválido');
      }

      // Converter o tipo de status para o tipo correto
      const partner: Partner = {
        ...partnerData,
        status: partnerData.status as 'pending' | 'active' | 'suspended' | 'inactive'
      };

      // Buscar preços personalizados do parceiro
      const { data: customPricing, error: pricingError } = await supabase
        .from('partner_pricing')
        .select('*')
        .eq('partner_id', partner.id)
        .eq('is_active', true);

      if (pricingError) {
        console.error('Erro ao buscar preços personalizados:', pricingError);
      }

      // Montar objeto de preços
      let pricing = { ...DEFAULT_PRICING };
      let hasCustomPricing = false;

      if (customPricing && customPricing.length > 0) {
        hasCustomPricing = true;
        customPricing.forEach((item: PartnerPricing) => {
          pricing[item.plan_type] = item.custom_price;
        });
      }

      const newData: PartnerContextData = {
        partner,
        pricing,
        isLoading: false,
        error: null,
        hasCustomPricing,
      };

      setData(newData);
      savePartnerData(newData);

      return newData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados do parceiro';
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return null;
    }
  }, [savePartnerData]);

  // Detectar parâmetros da URL na inicialização
  useEffect(() => {
    const vendedor = searchParams.get('vendedor') || searchParams.get('referral');
    
    if (vendedor) {
      console.log('Detectado código de vendedor na URL:', vendedor);
      fetchPartnerData(vendedor);
    } else {
      // Se não há parâmetro na URL, tentar carregar dados salvos
      const savedData = loadSavedPartnerData();
      if (savedData) {
        console.log('Carregando dados salvos do parceiro:', savedData.partner?.referral_code);
        setData(savedData);
      }
    }
  }, [searchParams, fetchPartnerData, loadSavedPartnerData]);

  // Limpar dados do parceiro
  const clearPartnerData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData({
      partner: null,
      pricing: DEFAULT_PRICING,
      isLoading: false,
      error: null,
      hasCustomPricing: false,
    });
  }, []);

  // Formatar preço para exibição
  const formatPrice = useCallback((price: number) => {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }, []);

  return {
    ...data,
    fetchPartnerData,
    clearPartnerData,
    formatPrice,
  };
};
