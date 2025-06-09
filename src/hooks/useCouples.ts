
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Couple, CouplePhoto } from '@/types/database';

export const useCouples = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCouple = async (coupleData: Omit<Couple, 'id' | 'created_at' | 'updated_at'>) => {
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
      setError(err instanceof Error ? err.message : 'Erro ao criar casal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCoupleById = async (id: string) => {
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
      setError(err instanceof Error ? err.message : 'Erro ao buscar casal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File, coupleId: string, order: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${coupleId}-${order}-${Date.now()}.${fileExt}`;
    const filePath = `${coupleId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('couple-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('couple-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const savePhoto = async (photoData: Omit<CouplePhoto, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('couple_photos')
      .insert([photoData])
      .select()
      .single();

    if (error) throw error;
    return data as CouplePhoto;
  };

  const getPhotos = async (coupleId: string) => {
    const { data, error } = await supabase
      .from('couple_photos')
      .select('*')
      .eq('couple_id', coupleId)
      .order('photo_order');

    if (error) throw error;
    return data as CouplePhoto[];
  };

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
