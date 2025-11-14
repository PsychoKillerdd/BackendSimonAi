import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import empresaRouter from './routes/empresaRoutes';
import authRouter from './routes/authRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', empresaRouter);
app.use('/auth', authRouter);

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});


