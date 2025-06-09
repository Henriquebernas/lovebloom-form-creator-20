
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Couple, CouplePhoto } from '@/types/database';

export const useCouples = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCouple = useCallback(async (coupleData: Omit<Couple, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('couples')
        .insert([coupleData])
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
