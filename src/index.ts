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

dotenv.config();

const startTime = Date.now();

const app = express();
app.use(cors());
app.use(express.json());

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
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
