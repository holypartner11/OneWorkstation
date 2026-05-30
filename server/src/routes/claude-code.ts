import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Router } from 'express';

const router = Router();
const CLAUDE_DIR = path.join(process.env.HOME || '/Users/lalalu', '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

// List all projects
router.get('/projects', (_req, res) => {
  try {
    if (!fs.existsSync(PROJECTS_DIR)) {
      return res.json([]);
    }
    const projects = fs.readdirSync(PROJECTS_DIR)
      .filter(f => !f.startsWith('.'))
      .map(dir => ({
        id: dir,
        // Decode path: -Users-lalalu → /Users/lalalu
        path: dir.replace(/-{2,}/g, '/').replace(/^-/, ''),
        sessionsPath: path.join(PROJECTS_DIR, dir),
      }));
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List sessions for a project (decoded path)
router.get('/projects/:id/sessions', (req, res) => {
  try {
    const projectId = req.params.id;
    const sessionsDir = path.join(PROJECTS_DIR, projectId);
    if (!fs.existsSync(sessionsDir)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));
    const sessions = files.map(file => {
      const sessionPath = path.join(sessionsDir, file);
      const stat = fs.statSync(sessionPath);
      // Last user message as title
      const lines = fs.readFileSync(sessionPath, 'utf-8').trim().split('\n');
      let title = file.replace('.jsonl', '').slice(0, 8);
      let lastMessage = '';
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const msg = JSON.parse(lines[i]);
          if (msg.type === 'user' && !msg.isMeta) {
            const content = typeof msg.message?.content === 'string'
              ? msg.message.content.slice(0, 80)
              : '';
            if (content) {
              lastMessage = content;
              title = content.slice(0, 60);
              break;
            }
          }
        } catch {}
      }
      return {
        id: file.replace('.jsonl', ''),
        file,
        title: title.slice(0, 60),
        lastMessage,
        modified: stat.mtime.toISOString(),
        size: stat.size,
      };
    });
    sessions.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get session messages
router.get('/sessions/:sessionId/messages', (req, res) => {
  try {
    const { sessionId } = req.params;
    // Find the session file across all projects
    const projects = fs.readdirSync(PROJECTS_DIR).filter(f => !f.startsWith('.'));
    let sessionPath = '';
    for (const proj of projects) {
      const testPath = path.join(PROJECTS_DIR, proj, `${sessionId}.jsonl`);
      if (fs.existsSync(testPath)) {
        sessionPath = testPath;
        break;
      }
    }
    if (!sessionPath) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const lines = fs.readFileSync(sessionPath, 'utf-8').trim().split('\n');
    const messages = lines
      .map((line, idx) => {
        try {
          const msg = JSON.parse(line);
          if (msg.type === 'user' || msg.type === 'assistant') {
            return {
              idx,
              type: msg.type,
              role: msg.message?.role || msg.type,
              content: extractContent(msg),
              timestamp: msg.timestamp,
              model: msg.message?.model,
            };
          }
        } catch {}
        return null;
      })
      .filter(Boolean);
    res.json({ sessionId, messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resume a session in terminal (opens iTerm2 with a new tab)
router.post('/sessions/:sessionId/resume', (req, res) => {
  try {
    const { sessionId } = req.params;
    // Check if session exists first
    const projects = fs.readdirSync(PROJECTS_DIR).filter(f => !f.startsWith('.'));
    let found = false;
    for (const proj of projects) {
      if (fs.existsSync(path.join(PROJECTS_DIR, proj, `${sessionId}.jsonl`))) {
        found = true;
        break;
      }
    }
    if (!found) {
      return res.status(404).json({ ok: false, error: 'Session not found' });
    }
    // Open a new terminal tab and run claude --resume
    try {
      const cmd = `osascript -e 'tell application "iTerm2" to activate' -e 'tell application "System Events" to keystroke "t" using command down' -e 'delay 0.5' -e 'tell application "iTerm2" to tell current session of current window to write text "claude --resume ${sessionId}"'`;
      execSync(cmd, { stdio: 'ignore' });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: 'iTerm2 is not running. Please open iTerm2 first.' });
    }
    res.json({ ok: true, sessionId, message: 'iTerm2 opened with resume' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start a new Claude Code session in iTerm2
router.post('/new', (_req, res) => {
  try {
    try {
      const cmd = `osascript -e 'tell application "iTerm2" to activate' -e 'tell application "System Events" to keystroke "t" using command down' -e 'delay 0.5' -e 'tell application "iTerm2" to tell current session of current window to write text "claude"'`;
      execSync(cmd, { stdio: 'ignore' });
    } catch {
      return res.status(500).json({ ok: false, error: 'iTerm2 is not running. Please open iTerm2 first.' });
    }
    res.json({ ok: true, message: 'New Claude Code session started' });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

function extractContent(msg: any): string {
  const content = msg.message?.content;
  if (!content) return '';
  if (typeof content === 'string') return content.slice(0, 200);
  if (Array.isArray(content)) {
    return content
      .map((block: any) => {
        if (block.type === 'text') return block.text?.slice(0, 200) || '';
        if (block.type === 'thinking') return `[思考] ${block.thinking?.slice(0, 100) || ''}`;
        return '';
      })
      .join(' ')
      .slice(0, 200);
  }
  return '';
}

export { router as claudeRouter };