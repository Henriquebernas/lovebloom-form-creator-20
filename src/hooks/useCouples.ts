
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Couple, CouplePhoto } from '@/types/database';

export const useCouples = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRandomHash = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let hash = '';
    for (let i = 0; i < 5; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  };

  const generateUrlSlug = (coupleName: string): string => {
    const baseSlug = coupleName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '_') // Substitui espaços por underscores
      .replace(/_+/g, '_') // Remove underscores duplicados
      .replace(/^_+|_+$/g, '') || 'casal'; // Remove underscores no início/fim

    const hash = generateRandomHash();
    return `${baseSlug}_${hash}`;
  };

  const createCouple = useCallback(async (
    coupleData: Omit<Couple, 'id' | 'created_at' | 'updated_at'> & { email: string }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Gerar slug único com hash
      let urlSlug = generateUrlSlug(coupleData.couple_name);
      let counter = 1;

      // Verificar se o slug já existe e incrementar se necessário
      while (true) {
        const { data: existing } = await supabase
          .from('couples')
          .select('id')
          .eq('url_slug', urlSlug)
          .single();

        if (!existing) {
          break; // Slug disponível
        }

        // Se existir, gerar novo hash
        const baseSlug = coupleData.couple_name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '') || 'casal';
        
        const newHash = generateRandomHash();
        urlSlug = `${baseSlug}_${newHash}`;
        counter++;

        // Evitar loop infinito
        if (counter > 100) {
          urlSlug = `${baseSlug}_${Date.now().toString().slice(-5)}`;
          break;
        }
      }

      const { data, error } = await supabase
        .from('couples')
        .insert([{ ...coupleData, url_slug: urlSlug }])
        .select()
        .single();

      if (error) throw error;
      return data as Couple;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar casal';
      setError(errorMessage);
      console.error('Erro ao criar casal:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCoupleById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Couple;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar casal';
      setError(errorMessage);
      console.error('Erro ao buscar casal:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadPhoto = useCallback(async (file: File, coupleId: string, order: number): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${coupleId}-${order}-${Date.now()}.${fileExt}`;
      const filePath = `${coupleId}/${fileName}`;

      // Tentar fazer upload
      const { error: uploadError } = await supabase.storage
        .from('couple-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('couple-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Erro ao fazer upload da foto:', err);
      // Se falhar o upload, retornar uma URL de placeholder
      return `https://placehold.co/360x640/1a1a2e/ff007f?text=Foto+${order}`;
    }
  }, []);

  const savePhoto = useCallback(async (photoData: Omit<CouplePhoto, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('couple_photos')
        .insert([photoData])
        .select()
        .single();

      if (error) throw error;
      return data as CouplePhoto;
    } catch (err) {
      console.error('Erro ao salvar foto:', err);
      throw err;
    }
  }, []);

  const getPhotos = useCallback(async (coupleId: string) => {
    try {
      const { data, error } = await supabase
        .from('couple_photos')
        .select('*')
        .eq('couple_id', coupleId)
        .order('photo_order');

      if (error) throw error;
      return data as CouplePhoto[];
    } catch (err) {
      console.error('Erro ao buscar fotos:', err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    createCouple,
    getCoupleById,
    uploadPhoto,
    savePhoto,
    getPhotos
  };
};
