# Documentación Técnica: Simon Backend MVP

## 1. Descripción General
El backend de **Simon** es una API REST diseñada para la gestión inteligente de colmenas y apiarios. Permite la ingesta de datos provenientes de dispositivos IoT, el monitoreo en tiempo real de variables críticas (temperatura, humedad, peso, sonido, presión) y la generación automática de alertas basadas en reglas predefinidas.

## 2. Arquitectura del Proyecto
El proyecto sigue una arquitectura de capas para separar las responsabilidades:

- **Rutas (`/src/routes`):** Define los puntos de entrada de la API y asigna middlewares de autenticación.
- **Controladores (`/src/controllers`):** Orquestan la entrada de datos, llaman a los servicios y retornan las respuestas HTTP.
- **Servicios (`/src/services`):** Contienen la lógica de negocio (ej. cálculo de alertas, procesamiento de lecturas).
- **Configuración (`/src/config`):** Configuración de DB, esquema de Drizzle y variables de entorno.
- **Middlewares (`/src/middlewares`):** Validación de tokens JWT y manejo de errores.

## 3. Modelado de Datos (Entidades Core)
El sistema utiliza un modelo relacional gestionado por **Drizzle ORM**. Las entidades principales y su propósito son:

- **Empresa:** Entidad jurídica propietaria de los activos. Define el alcance de los datos (multi-tenant por `id_empresa`).
- **Usuario:** Personal con credenciales. Soporta roles (`admin`, `apicultor`).
- **Apiario:** Agrupación lógica de colmenas en una ubicación geográfica.
- **Dispositivo Simonia:** Hardware físico identificado por un `codigo_unico`. Puede estar en inventario (sin propietario) o asignado a una empresa.
- **Colmena:** La unidad de producción. Vincula un `dispositivo` con un `apiario` y una `empresa`.
- **Lectura Sensor:** Registro histórico de telemetría (punto en el tiempo).
- **Alerta:** Evento derivado del análisis de lecturas que requiere atención humana.

## 4. Endpoints Principales

### Autenticación
- `POST /auth/login`: Inicio de sesión y obtención de token JWT.
- `POST /auth/register`: Registro de nuevos usuarios y empresas (Onboarding).

### Gestión de Empresas y Usuarios
- `GET /api/empresas`: Listado paginado de empresas.
- `POST /api/empresas/:id/create-admin`: Endpoint semilla para crear el primer administrador de una empresa.
- `POST /api/empresas/:id/usuarios`: Gestión de personal de campo (apicultores).

### Inventario de Dispositivos
- `POST /api/dispositivos`: Registro de nuevo hardware en el inventario global de SimonIA.
- `GET /api/dispositivos/sin-asignar/lista`: Consulta de stock disponible para despacho.
- `PATCH /api/dispositivos/:id/asignar`: Vinculación de hardware a una empresa cliente.

### Gestión de Apiarios y Colmenas
- `GET /api/apiarios`: Listar apiarios de la empresa (requiere JWT).
- `POST /api/apiarios`: Crear apiario con ubicación geográfica inicial.
- `GET /api/apiarios/:id/detalles`: Vista 360° que incluye colmenas y sus dispositivos asociados.

### Lecturas y Telemetría IoT
- `POST /api/lecturas/sensor`: Ingesta de datos desde dispositivos. **Nota:** Este endpoint es público para facilitar la conexión directa de hardware, identificando la colmena mediante el `codigo_dispositivo`.
- `GET /api/lecturas/sensor/docs`: Documentación técnica en formato JSON para desarrolladores de hardware/firmware.
- `GET /api/lecturas/colmena/:id`: Historial de lecturas.
- `GET /api/lecturas/colmena/:id/graficos`: Datos optimizados para visualización en dashboards (series de tiempo).
- `GET /api/lecturas/colmena/:id/ultima`: Obtiene el estado más reciente de la colmena.
- `GET /api/lecturas/colmena/:id/estadisticas`: Resumen estadístico (mínimos, máximos, promedios).

### Alertas
- `GET /api/alertas/empresa/todas`: Lista todas las alertas pendientes para la empresa del usuario.
- `PATCH /api/alertas/atender/:id`: Marcar una alerta como atendida.

## 5. Sistema de Alertas Inteligente
El `AlertaService` evalúa cada lectura entrante contra un conjunto de reglas (actualmente definidas en el código para el MVP):
- **Térmicas:** Detecta frío o calor extremo (Umbrales: <5°C, >35°C, Extremo: <0°C o >40°C).
- **Humedad:** Monitorea condiciones de humedad crítica (Umbrales: <20%, >80%, Crítica: <10%).
- **Sonido:** Identifica posibles ataques o actividad inusual basada en frecuencia (Umbrales: >500Hz, <50Hz, Extremo: >1000Hz).
- **Peso:** Detecta cambios significativos (Umbrales: >10kg, <2kg, Crítico: <1kg).
- **Presión:** Monitorea cambios barométricos.

**Mecanismo Anti-Spam:** El sistema evita la inundación de alertas. Si ya existe una alerta del mismo tipo en estado "Pendiente" creada en las últimas 24 horas para la misma colmena, el sistema omitirá la creación de una nueva, optimizando la atención del apicultor.

## 6. Simulador IoT
El proyecto incluye un simulador avanzado (`src/utils/simuladorIoT.ts`) para pruebas y demostraciones:
- **Generación de Datos Realistas:** Los valores varían según la hora del día (simulando ciclos circadianos de las abejas).
- **Parámetros Configurables:** Permite ajustar el código del dispositivo, el intervalo de envío y la URL de la API mediante variables de entorno.
- **Uso:** `bun run src/utils/simuladorIoT.ts` o `npm run simulador`.

## 7. Utilidades y Mantenimiento
- **Keep-Alive:** Sistema automático que realiza peticiones al endpoint de health para evitar que el servicio entre en "suspensión" en plataformas como Render (Plan gratuito).
- **Health Check (`/health`):** Endpoint que verifica tanto la salud del servidor como la conectividad activa con la base de datos PostgreSQL.
- **Logging:** Registro detallado en consola que captura: Timestamp, Método, Path, y dimensiones del Payload, facilitando el debugging de sensores en campo.

## 8. Seguridad y Control de Acceso
El sistema implementa seguridad a nivel de aplicación mediante:
- **JWT (Stateless):** Los tokens contienen el `id_usuario`, `id_empresa` y `tipo_usuario`.
- **Multitenancy:** La mayoría de las consultas filtran automáticamente por `id_empresa` obtenido del token, asegurando aislamiento de datos entre clientes.
- **Roles:** 
    - `admin`: Puede crear apiarios, colmenas y gestionar personal.
    - `apicultor`: Acceso de solo lectura a telemetría y gestión de alertas atendidas.
- **Ingesta Protegida por Hardware:** El endpoint de lecturas valida la existencia del `codigo_dispositivo` y su vinculación activa a una colmena antes de persistir datos.

## 9. Lógica de Negocio Adicional (Por Definir en Test y Conversaciones con Clientes, de momento solo esta en desarrollo mvp)
- **Planes de Suscripción:** El sistema está preparado para manejar límites por empresa:
    - `Free`: Máximo 5 apiarios y 50 colmenas.
    - `Micro`: Máximo 10 apiarios y 100 colmenas.
    - `Pro`: Hasta 50 apiarios y 500 colmenas.
- **Paginación Uniforme:** Todos los listados de gran volumen (Empresas, Lecturas) implementan una utilidad de paginación estandarizada que retorna metratada de navegación (`currentPage`, `totalPages`, `hasNextPage`).

---
*Documentación Técnica Simon v1.0 - Backend API*