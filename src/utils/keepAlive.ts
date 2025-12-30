/**
 * Keep-alive service para mantener el servidor activo en Render (plan free)
 * Envía una solicitud al endpoint /health cada 10 minutos
 */

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutos en milisegundos

export function startKeepAlive(port: number) {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

  console.log(`🔄 Keep-alive iniciado: ping cada 10 minutos a ${url}/health`);

  setInterval(async () => {
    try {
      const response = await fetch(`${url}/health`);
      const data = await response.json();
      console.log(`✅ Keep-alive ping exitoso - Status: ${data.status}`);
    } catch (error) {
      console.error('❌ Keep-alive ping falló:', error);
    }
  }, PING_INTERVAL);
}
