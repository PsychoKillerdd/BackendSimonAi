import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import empresaRouter from './routes/empresaRoutes';
import authRouter from './routes/authRoutes';
import apiarioRouter from './routes/apiarioRoutes';
import dispositivoRouter from './routes/dispositivoRoutes';
import lecturaRouter from './routes/lecturaRoutes';
import { db } from './config/db';
import { sql } from 'drizzle-orm';
import { startKeepAlive } from './utils/keepAlive';

dotenv.config();

const startTime = Date.now();

const app = express();

// CORS configurado para producción
app.use(cors({
	origin: '*', // En producción, especifica dominios permitidos
}));

app.use(express.json());

// Logging de requests (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
	app.use((req, _res, next) => {
		console.log(`${req.method} ${req.path}`);
		next();
	});
}// Root endpoint
app.get('/', (_req, res) => {
	res.json({
		message: 'Simon Backend MVP API',
		version: '1.0.0',
		status: 'running',
		endpoints: {
			health: '/health',
			empresas: '/api/empresas',
			auth: '/auth/login',
			apiarios: '/api/apiarios',
			dispositivos: '/api/dispositivos',
			lecturas: '/api/lecturas/sensor'
		}
	});
});

// Rutas
app.use('/api', empresaRouter);
app.use('/auth', authRouter);
app.use('/api', apiarioRouter);
app.use('/api', dispositivoRouter);
app.use('/api', lecturaRouter);

// Health check endpoint mejorado
app.get('/health', async (_req, res) => {
	const healthCheck = {
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		serverUptime: Math.floor((Date.now() - startTime) / 1000),
		environment: process.env.NODE_ENV || 'development',
		version: '1.0.0',
		database: {
			status: 'unknown',
			responseTime: 0
		}
	};

	// Verificar conexión a la base de datos
	try {
		const dbStartTime = Date.now();
		await db.execute(sql`SELECT 1 as health`);
		healthCheck.database.status = 'connected';
		healthCheck.database.responseTime = Date.now() - dbStartTime;
	} catch (error) {
		healthCheck.status = 'degraded';
		healthCheck.database.status = 'disconnected';
		console.error('Database health check failed:', error);
	}

	const statusCode = healthCheck.status === 'ok' ? 200 : 503;
	res.status(statusCode).json(healthCheck);
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; // Necesario para Render y otros servicios de hosting

app.listen(PORT, HOST, () => {
	console.log(`✅ Server listening on ${HOST}:${PORT}`);
	console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
	
	// Iniciar keep-alive solo en producción (Render)
	if (process.env.RENDER_EXTERNAL_URL) {
		startKeepAlive(PORT);
	}
});
