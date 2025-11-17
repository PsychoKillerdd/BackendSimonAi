import supabase from '../config/db/supbase';

export type ApiarioInput = {
  nombre: string;
  limite_colmenas?: number;
  locacion: string; // ubicación inicial del apiario
};

export type ColmenaInput = {
  nombre_colmena: string;
  id_apiario_actual: string;
  id_dispositivo?: string;
  fecha_instalacion?: string;
};

export async function createApiarioWithUbicacion(empresaId: string, payload: ApiarioInput) {
  // Crear apiario
  const apiarioPayload = {
    id_empresa: empresaId,
    nombre: payload.nombre,
    limite_colmenas: payload.limite_colmenas ?? 100,
  };

  const { data: apiarioData, error: apiarioError } = await supabase
    .from('apiario')
    .insert([apiarioPayload])
    .select()
    .single();

  if (apiarioError) throw apiarioError;

  // Crear ubicación inicial del apiario
  const ubicacionPayload = {
    id_apiario: apiarioData.id,
    locacion: payload.locacion,
  };

  const { data: ubicacionData, error: ubicacionError } = await supabase
    .from('ubicacion_apiario')
    .insert([ubicacionPayload])
    .select()
    .single();

  if (ubicacionError) throw ubicacionError;

  return {
    apiario: apiarioData,
    ubicacion: ubicacionData,
  };
}

export async function getApiariosByEmpresa(empresaId: string) {
  const { data, error } = await supabase
    .from('apiario')
    .select(`
      *,
      ubicacion_apiario(*)
    `)
    .eq('id_empresa', empresaId)
    .order('fecha_creacion', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getApiarioById(apiarioId: string) {
  const { data, error } = await supabase
    .from('apiario')
    .select(`
      *,
      ubicacion_apiario(*),
      colmena(*)
    `)
    .eq('id', apiarioId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createColmena(empresaId: string, payload: ColmenaInput) {
  const colmenaPayload: any = {
    nombre_colmena: payload.nombre_colmena,
    id_apiario_actual: payload.id_apiario_actual,
    id_empresa: empresaId,
  };

  if (payload.id_dispositivo) {
    colmenaPayload.id_dispositivo = payload.id_dispositivo;
  }

  if (payload.fecha_instalacion) {
    colmenaPayload.fecha_instalacion = payload.fecha_instalacion;
  }

  const { data, error } = await supabase
    .from('colmena')
    .insert([colmenaPayload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getColmenasByApiario(apiarioId: string) {
  const { data, error } = await supabase
    .from('colmena')
    .select(`
      *,
      dispositivo_simonia(*)
    `)
    .eq('id_apiario_actual', apiarioId)
    .order('fecha_creacion', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getColmenasByEmpresa(empresaId: string) {
  const { data, error } = await supabase
    .from('colmena')
    .select(`
      *,
      apiario(*),
      dispositivo_simonia(*)
    `)
    .eq('id_empresa', empresaId)
    .order('fecha_creacion', { ascending: false });

  if (error) throw error;
  return data;
}
