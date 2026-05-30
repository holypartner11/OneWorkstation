const BASE = 'http://localhost:3001/api';

async function request(method: string, path: string, body?: object) {
  const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${BASE}${path}`, opts);
  if (!r.ok) throw new Error(`API ${method} ${path} failed: ${r.status}`);
  return r.json();
}

export const api = {
  // Claude Code
  claudeCode: {
    listProjects: () => request('GET', '/claude-code/projects'),
    listSessions: (projectId: string) => request('GET', `/claude-code/projects/${projectId}/sessions`),
    getMessages: (sessionId: string) => request('GET', `/claude-code/sessions/${sessionId}/messages`),
    resume: (sessionId: string) => request('POST', `/claude-code/sessions/${sessionId}/resume`),
    newSession: () => request('POST', '/claude-code/new'),
  },
  // OpenClaw
  openclaw: {
    listAgents: () => request('GET', '/openclaw/agents'),
    listSessions: () => request('GET', '/openclaw/sessions'),
    listModels: () => request('GET', '/openclaw/models'),
    sendMessage: (agentId: string, message: string) =>
      request('POST', `/openclaw/agents/${agentId}/message`, { message }),
    spawn: (prompt: string, model?: string) =>
      request('POST', '/openclaw/agents/spawn', { prompt, model }),
    openDashboard: () => request('POST', '/openclaw/open-dashboard'),
  },
  // Hermes
  hermes: {
    listSessions: () => request('GET', '/hermes/sessions'),
    getSession: (sessionId: string) => request('GET', `/hermes/sessions/${sessionId}`),
    listAgents: () => request('GET', '/hermes/agents'),
    listModels: () => request('GET', '/hermes/models'),
    openTui: () => request('POST', '/hermes/open-tui'),
    resume: (sessionId: string) => request('POST', `/hermes/sessions/${sessionId}/resume`),
  },
};