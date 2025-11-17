import supabase from '../config/db/supbase';

export type DispositivoInput = {
  codigo_unico: string;
  modelo?: string;
  firmware_version?: string;
  estado?: string;
};

export async function createDispositivo(payload: DispositivoInput) {
  const dispositivoPayload: any = {
    codigo_unico: payload.codigo_unico,
  };

  if (payload.modelo) {
    dispositivoPayload.modelo = payload.modelo;
  }

  if (payload.firmware_version) {
    dispositivoPayload.firmware_version = payload.firmware_version;
  }

  if (payload.estado) {
    dispositivoPayload.estado = payload.estado;
  }

  const { data, error } = await supabase
    .from('dispositivo_simonia')
    .insert([dispositivoPayload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDispositivoById(dispositivoId: string) {
  const { data, error } = await supabase
    .from('dispositivo_simonia')
    .select('*')
    .eq('id', dispositivoId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getDispositivoByCodigo(codigoUnico: string) {
  const { data, error } = await supabase
    .from('dispositivo_simonia')
    .select('*')
    .eq('codigo_unico', codigoUnico)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllDispositivos() {
  const { data, error } = await supabase
    .from('dispositivo_simonia')
    .select('*')
    .order('fecha_registro', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateDispositivoEstado(dispositivoId: string, estado: string) {
  const { data, error } = await supabase
    .from('dispositivo_simonia')
    .update({ estado })
    .eq('id', dispositivoId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
