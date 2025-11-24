/**
 * Simulador de dispositivo IoT para testing
 * Envía datos realistas de sensores cada X minutos
 */

interface SensorData {
  temperatura_c: number;
  humedad_h: number;
  peso_kg: number;
  sonido_hz: number;
  presion_hpa: number;
}

interface SimuladorConfig {
  codigo_dispositivo: string;
  intervalo_minutos: number;
  apiUrl: string;
}

class SimuladorDispositivoIoT {
  private config: SimuladorConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private baseTemperatura = 24; // °C base
  private baseHumedad = 60; // % base
  private basePeso = 45; // kg base
  private baseSonido = 200; // Hz base
  private basePresion = 1013; // hPa base

  constructor(config: SimuladorConfig) {
    this.config = config;
  }

  /**
   * Genera datos realistas con variaciones naturales
   */
  private generarDatosRealistas(): SensorData {
    const hora = new Date().getHours();
    
    // Variaciones según hora del día (colmenas más activas de día)
    const factorDia = Math.sin((hora - 6) * Math.PI / 12); // Pico al mediodía
    
    // Temperatura: varía con hora del día + ruido aleatorio
    const temperatura_c = Number(
      (this.baseTemperatura + 
       factorDia * 5 + // +/- 5°C según hora
       (Math.random() - 0.5) * 2) // ruido +/- 1°C
      .toFixed(1)
    );

    // Humedad: inversamente proporcional a temperatura
    const humedad_h = Number(
      (this.baseHumedad - 
       factorDia * 10 + // más seca de día
       (Math.random() - 0.5) * 5) // ruido
      .toFixed(1)
    );

    // Peso: varía levemente (abejas entran/salen, miel)
    const peso_kg = Number(
      (this.basePeso + 
       (Math.random() - 0.5) * 0.5) // variación +/- 0.25 kg
      .toFixed(2)
    );

    // Sonido: más alto durante el día (abejas activas)
    const sonido_hz = Number(
      (this.baseSonido + 
       factorDia * 100 + // más ruido de día
       (Math.random() - 0.5) * 50) // variación
      .toFixed(1)
    );

    // Presión atmosférica: varía poco, lentamente
    const presion_hpa = Number(
      (this.basePresion + 
       Math.sin(Date.now() / 3600000) * 5 + // ciclo lento
       (Math.random() - 0.5)) // ruido mínimo
      .toFixed(1)
    );

    return {
      temperatura_c,
      humedad_h,
      peso_kg,
      sonido_hz,
      presion_hpa
    };
  }

  /**
   * Envía datos al servidor
   */
  private async enviarDatos() {
    const datos = this.generarDatosRealistas();
    const payload = {
      codigo_dispositivo: this.config.codigo_dispositivo,
      ...datos
    };

    try {
      const response = await fetch(`${this.config.apiUrl}/api/lecturas/sensor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        const fecha = new Date().toLocaleString('es-CL', {
          timeZone: 'America/Santiago',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        console.log(`✅ [${fecha}] Datos enviados - Temp: ${datos.temperatura_c}°C, Humedad: ${datos.humedad_h}%, Peso: ${datos.peso_kg}kg`);
      } else {
        console.error('❌ Error al enviar datos:', result);
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
    }
  }

  /**
   * Inicia el simulador
   */
  iniciar() {
    if (this.intervalId) {
      console.log('⚠️  Simulador ya está ejecutándose');
      return;
    }

    console.log(`🚀 Simulador iniciado: ${this.config.codigo_dispositivo}`);
    console.log(`📡 Enviando datos cada ${this.config.intervalo_minutos} minutos a ${this.config.apiUrl}`);
    
    // Enviar datos inmediatamente
    this.enviarDatos();
    
    // Configurar intervalo
    const intervaloMs = this.config.intervalo_minutos * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.enviarDatos();
    }, intervaloMs);
  }

  /**
   * Detiene el simulador
   */
  detener() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Simulador detenido');
    }
  }
}

// Exportar para uso en otros módulos
export { SimuladorDispositivoIoT, type SimuladorConfig };

// Si se ejecuta directamente
if (import.meta.main) {
  const config: SimuladorConfig = {
    codigo_dispositivo: process.env.CODIGO_DISPOSITIVO || 'SIM-002',
    intervalo_minutos: Number(process.env.INTERVALO_MINUTOS) || 1,
    apiUrl: process.env.API_URL || 'http://localhost:3000'
  };

  const simulador = new SimuladorDispositivoIoT(config);
  simulador.iniciar();

  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log('\n🔚 Cerrando simulador...');
    simulador.detener();
    process.exit(0);
  });
}
