# Simulador de Dispositivo IoT

Simula un dispositivo Simon enviando datos realistas cada X minutos.

## 🚀 Uso Rápido

### Iniciar simulador (30 minutos por defecto):
```bash
bun run simulador
```

### Con intervalo personalizado (ejemplo: cada 5 minutos):
```bash
# Windows PowerShell
$env:INTERVALO_MINUTOS="5"; bun run simulador

# Linux/Mac
INTERVALO_MINUTOS=5 bun run simulador
```

### Cambiar dispositivo:
```bash
# Windows PowerShell
$env:CODIGO_DISPOSITIVO="SIM-001"; bun run simulador

# Linux/Mac
CODIGO_DISPOSITIVO=SIM-001 bun run simulador
```

### Apuntar a servidor remoto:
```bash
# Windows PowerShell
$env:API_URL="https://tu-app.onrender.com"; bun run simulador

# Linux/Mac
API_URL=https://tu-app.onrender.com bun run simulador
```

## 📊 Datos Generados

El simulador genera datos realistas que varían según:
- **Hora del día**: Temperatura sube al mediodía, actividad aumenta de día
- **Temperatura**: 19-29°C con variación natural
- **Humedad**: 50-70% (inversa a temperatura)
- **Peso**: ~45kg con variaciones mínimas (+/- 0.25kg)
- **Sonido**: 150-350Hz (más alto de día)
- **Presión**: ~1013 hPa con variación mínima

## ⚙️ Configuración

Edita `.env.simulador` para valores por defecto:
```env
CODIGO_DISPOSITIVO=SIM-002
INTERVALO_MINUTOS=30
API_URL=http://localhost:3000
```

## 🛑 Detener

Presiona `Ctrl+C` para detener el simulador.
