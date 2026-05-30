import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Router } from 'express';

const router = Router();
const OPENCLAW_CONFIG = path.join(process.env.HOME || '/Users/lalalu', '.openclaw', 'openclaw.json');

// Load gateway config
function getGatewayConfig() {
  const config = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG, 'utf-8'));
  return {
    port: config.gateway?.port || 18789,
    token: config.gateway?.auth?.token || '',
    baseUrl: `http://127.0.0.1:${config.gateway?.port || 18789}`,
  };
}

// Proxy: List agents
router.get('/agents', async (_req, res) => {
  try {
    const { baseUrl, token } = getGatewayConfig();
    const r = await fetch(`${baseUrl}/v1/agents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy: List sessions
router.get('/sessions', async (_req, res) => {
  try {
    const { baseUrl, token } = getGatewayConfig();
    const r = await fetch(`${baseUrl}/v1/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy: Send message to agent
router.post('/agents/:agentId/message', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;
    const { baseUrl, token } = getGatewayConfig();
    const r = await fetch(`${baseUrl}/v1/agents/${agentId}/message`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    const data = await r.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy: List models
router.get('/models', async (_req, res) => {
  try {
    const { baseUrl, token } = getGatewayConfig();
    const r = await fetch(`${baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy: Agent spawn (start a new agent task)
router.post('/agents/spawn', async (req, res) => {
  try {
    const { prompt, model, runtime } = req.body;
    const { baseUrl, token } = getGatewayConfig();
    const r = await fetch(`${baseUrl}/v1/agents/spawn`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model, runtime }),
    });
    const data = await r.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Local: Open OpenClaw dashboard in browser
router.post('/open-dashboard', (_req, res) => {
  try {
    execSync('open http://127.0.0.1:18789', { stdio: 'ignore' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as openclawRouter };