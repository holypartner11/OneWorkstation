import express from 'express';
import cors from 'cors';
import { claudeRouter } from './routes/claude-code.js';
import { openclawRouter } from './routes/openclaw.js';
import { hermesRouter } from './routes/hermes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/claude-code', claudeRouter);
app.use('/api/openclaw', openclawRouter);
app.use('/api/hermes', hermesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[OneWorkstation Server] http://localhost:${PORT}`);
  console.log(`  Claude Code:  http://localhost:${PORT}/api/claude-code`);
  console.log(`  OpenClaw:    http://localhost:${PORT}/api/openclaw`);
  console.log(`  Hermes:      http://localhost:${PORT}/api/hermes`);
});