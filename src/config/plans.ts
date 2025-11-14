export type PlanDefinition = {
  id: string;
  name: string;
  precio_mensual: number; // currency units (project uses precio_mensual as number)
  max_usuarios?: number | null;
  max_colmenas?: number | null;
  max_apiarios?: number | null;
  description?: string;
};

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    precio_mensual: 0,
    max_usuarios: 100,
    max_colmenas: 50,
    max_apiarios: 5,
    description: 'Capa gratuita: hasta 100 usuarios y 50 sensores. Ideal para pruebas y pequeños equipos.'
  },
  micro: {
    id: 'micro',
    name: 'Micro',
    precio_mensual: 4990,
    max_usuarios: 200,
    max_colmenas: 100,
    max_apiarios: 10,
    description: 'Plan económico para equipos pequeños — ejemplo costo aproximado.'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    precio_mensual: 29990,
    max_usuarios: 1000,
    max_colmenas: 500,
    max_apiarios: 50,
    description: 'Plan pro para clientes con grandes despliegues.'
  }
};

export default PLANS;
