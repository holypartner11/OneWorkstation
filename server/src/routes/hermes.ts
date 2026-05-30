import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Router } from 'express';

const router = Router();
const HERMES_DIR = path.join(process.env.HOME || '/Users/lalalu', '.hermes');
const SESSIONS_DIR = path.join(HERMES_DIR, 'sessions');

// List all sessions from sessions.json
router.get('/sessions', (_req, res) => {
  try {
    const sessionsFile = path.join(SESSIONS_DIR, 'sessions.json');
    if (!fs.existsSync(sessionsFile)) {
      return res.json([]);
    }
    const allSessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf-8'));
    const sessionsList = Object.entries(allSessions).map(([key, val]: [string, any]) => ({
      key,
      sessionId: val.session_id,
      createdAt: val.created_at,
      updatedAt: val.updated_at,
      platform: val.platform,
      chatType: val.chat_type,
      displayName: val.display_name,
      estimatedCost: val.estimated_cost_usd,
    }));
    // Sort by updated_at desc
    sessionsList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json(sessionsList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get session messages from individual session file
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.startsWith(`session_${sessionId}`));
    if (!files.length) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const sessionPath = path.join(SESSIONS_DIR, files[0]);
    const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
    res.json({
      sessionId,
      model: sessionData.model,
      platform: sessionData.platform,
      startTime: sessionData.session_start,
      lastUpdated: sessionData.last_updated,
      messageCount: sessionData.message_count,
      messages: sessionData.messages?.map((m: any, idx: number) => ({
        idx,
        role: m.role,
        content: typeof m.content === 'string' ? m.content.slice(0, 300) : JSON.stringify(m.content).slice(0, 300),
      })) || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Hermes gateway if not running
router.post('/gateway/start', (_req, res) => {
  try {
    execSync('openclaw gateway start', { stdio: 'ignore' });
    res.json({ success: true, message: 'Gateway start requested' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Open Hermes TUI in terminal
router.post('/open-tui', (_req, res) => {
  try {
    execSync('osascript -e \'tell application "iTerm2" to activate\' -e \'tell application "System Events" to keystroke "t" using command down\' -e \'delay 0.5\' -e \'tell application "iTerm2" to tell current session of current window to write text "hermes tui"\' 2>/dev/null || open -a iTerm', { stdio: 'ignore' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resume a session (opens terminal with resume command)
router.post('/sessions/:sessionId/resume', (req, res) => {
  try {
    const { sessionId } = req.params;
    execSync('osascript -e \'tell application "iTerm2" to activate\' -e \'tell application "System Events" to keystroke "t" using command down\' -e \'delay 0.5\' -e \'tell application "iTerm2" to tell current session of current window to write text "hermes --session ' + sessionId + '"\' 2>/dev/null || open -a iTerm', { stdio: 'ignore' });
    res.json({ success: true, sessionId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List Hermes agents
router.get('/agents', async (_req, res) => {
  try {
    const agentsDir = path.join(HERMES_DIR, 'agents');
    if (!fs.existsSync(agentsDir)) {
      return res.json([]);
    }
    const agents = fs.readdirSync(agentsDir).filter(f => !f.startsWith('.'));
    res.json(agents.map((name: string) => ({ id: name, name })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List available models
router.get('/models', async (_req, res) => {
  try {
    const configFile = path.join(HERMES_DIR, 'config.yaml');
    if (!fs.existsSync(configFile)) {
      return res.json([{ id: 'default', name: 'default' }]);
    }
    // Parse YAML lightly (just extract model name)
    const config = fs.readFileSync(configFile, 'utf-8');
    const match = config.match(/default:\s*(\S+)/);
    res.json([{ id: match?.[1] || 'kimi-k2.6', name: match?.[1] || 'kimi-k2.6' }]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as hermesRouter };