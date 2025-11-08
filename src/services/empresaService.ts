import supabase from '../config/db/supbase';

export type EmpresaInput = {
  nombre: string;
  pais?: string;
  direccion?: string;
  numero_telefono?: number | string;
  correo_contacto?: string;
  estado_empresa?: string;
};

export async function createEmpresa(payload: EmpresaInput) {
  const insertPayload = {
    nombre: payload.nombre,
    pais: payload.pais ?? null,
    direccion: payload.direccion ?? null,
    numero_telefono: payload.numero_telefono ?? null,
    correo_contacto: payload.correo_contacto ?? null,
    estado_empresa: payload.estado_empresa ?? 'activa',
  };

  const { data, error } = await supabase.from('empresa').insert([insertPayload]).select().single();

  if (error) {
    throw error;
  }

  return data;
}
