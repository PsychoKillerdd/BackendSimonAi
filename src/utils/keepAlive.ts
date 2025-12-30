/**
 * Keep-alive service para mantener el servidor y la conexión DB activos
 * Envía una solicitud al endpoint /health cada 2 minutos
 * (Las conexiones de Supabase Pooler se vuelven stale después de ~5 minutos)
 */

const PING_INTERVAL = 2 * 60 * 1000; // 2 minutos en milisegundos

export function startKeepAlive(port: number) {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

  console.log(`🔄 Keep-alive iniciado: ping cada 10 minutos a ${url}/health`);

  setInterval(async () => {
    try {
      const response = await fetch(`${url}/health`);
      const data = await response.json() as { status: string };
      console.log(`✅ Keep-alive ping: DB ${data.status}`);
    } catch (error) {
      console.error('❌ Keep-alive ping falló:', error);
    }
  }, PING_INTERVAL);
}
