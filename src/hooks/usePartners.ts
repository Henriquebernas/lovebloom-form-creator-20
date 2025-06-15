
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Partner } from '@/types/database';

export const usePartners = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPartnerByReferralCode = useCallback(async (referralCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('referral_code', referralCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrado
          return null;
        }
        throw error;
      }
      
      return data as Partner;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar parceiro';
      setError(errorMessage);
      console.error('Erro ao buscar parceiro:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateReferralCode = useCallback(async (referralCode: string): Promise<boolean> => {
    if (!referralCode || referralCode.trim().length === 0) {
      return false;
    }

    const partner = await getPartnerByReferralCode(referralCode);
    return partner !== null;
  }, [getPartnerByReferralCode]);

  return {
    loading,
    error,
    getPartnerByReferralCode,
    validateReferralCode
  };
};
