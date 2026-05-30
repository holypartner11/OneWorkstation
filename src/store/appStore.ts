import { create } from 'zustand';
import type { Agent, Session, BrainConfig, ChatMessage, GroupChat, BrainSection } from '../types';

const STORAGE_KEY = 'one-workstation';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`[OneWorkstation] Failed to save "${key}" to localStorage:`, e);
  }
}

export const AGENT_MODELS = [
  'claude-sonnet-4', 'claude-opus-4', 'gpt-4o', 'gpt-4o-mini',
  'gemini-2.5-pro', 'gemini-2.5-flash', 'deepseek-v3', 'qwen3-30b-a3b',
];

const defaultOpenClawAgents: Agent[] = [
  { id: 'oc-1', name: 'COS', role: 'Sin 的放大器', description: 'Sin 的放大器', model: 'claude-sonnet-4' },
  { id: 'oc-2', name: 'Eason', role: '全栈工程师', description: '资深全栈工程师', model: 'claude-sonnet-4' },
  { id: 'oc-3', name: 'Steve', role: '产品负责人', description: '产品负责人', model: 'gpt-4o' },
  { id: 'oc-4', name: 'Eva', role: '设计总监', description: '设计总监', model: 'gpt-4o-mini' },
];

const defaultHermesAgents: Agent[] = [
  { id: 'he-1', name: 'COS', role: 'Sin 的放大器', description: 'Sin 的放大器', model: 'kimi-k2.6' },
  { id: 'he-2', name: 'Eason', role: '全栈工程师', description: '资深全栈工程师', model: 'kimi-k2.6' },
  { id: 'he-3', name: 'Steve', role: '产品负责人', description: '产品负责人', model: 'qwen3-30b-a3b' },
];

const defaultGroupChats: GroupChat[] = [
  { id: 'gc-1', name: 'AI视频工具脑爆', memberIds: ['oc-1', 'oc-2', 'oc-3'] },
];

const defaultHermesGroupChats: GroupChat[] = [
  { id: 'gc-h-1', name: 'Hermes 群聊', memberIds: ['he-1', 'he-2'] },
];

const defaultBrainConfigs: BrainConfig = {
  sections: [
    { id: 'global-prefs', title: '全局工作偏好', content: '## 全局工作偏好\n\n- 所有 Agent 共享相同的工作流规范\n- 任务完成后自动生成报告\n- 重要决策需多人共识', tool: 'openclaw' },
    { id: 'style', title: '风格与审美', content: '## 风格与审美\n\n- 少即是多（Less is More）\n- 形式追随功能\n- 不主动加 emoji\n- 简洁克制的视觉风格', tool: 'openclaw' },
  ],
};

const defaultAgentModels: Record<string, string> = {
  'oc-1': 'claude-sonnet-4', 'oc-2': 'claude-sonnet-4', 'oc-3': 'gpt-4o', 'oc-4': 'gpt-4o-mini',
  'he-1': 'kimi-k2.6', 'he-2': 'kimi-k2.6', 'he-3': 'qwen3-30b-a3b',
};

interface AppStore {
  activeTab: 'openclaw' | 'claude-code' | 'hermes';
  openclawAgents: Agent[];
  hermesAgents: Agent[];
  sessions: Session[];
  brainConfigs: BrainConfig;
  rightPanelOpen: boolean;
  leftSidebarOpen: boolean;
  // 'light' | 'dark' | 'system'
  colorMode: 'light' | 'dark' | 'system';
  openclawGroupChats: GroupChat[];
  hermesGroupChats: GroupChat[];
  openclawActiveGroupChatId: string | null;
  hermesActiveGroupChatId: string | null;
  claudeCodeSelectedProjectId: string | null;
  brainTab: 'openclaw' | 'claude-code' | 'hermes';
  // Per-platform active session (for popup / main view)
  openclawActiveSessionId: string | null;
  claudeCodeActiveSessionId: string | null;
  hermesActiveSessionId: string | null;
  // Agent modal (chat in popup)
  openclawActiveAgentModalId: string | null;
  hermesActiveAgentModalId: string | null;
  agentModels: Record<string, string>;
  chatMessages: Record<string, ChatMessage[]>;

  setActiveTab: (tab: 'openclaw' | 'claude-code' | 'hermes') => void;
  toggleRightPanel: () => void;
  toggleLeftSidebar: () => void;

  // Agent CRUD
  addOpenClawAgent: (agent: Omit<Agent, 'id'>) => void;
  updateOpenClawAgent: (id: string, updates: Partial<Agent>) => void;
  removeOpenClawAgent: (id: string) => void;
  addHermesAgent: (agent: Omit<Agent, 'id'>) => void;
  updateHermesAgent: (id: string, updates: Partial<Agent>) => void;
  removeHermesAgent: (id: string) => void;

  // Model
  setAgentModel: (agentId: string, model: string) => void;

  // Platform-specific active group chat
  setOpenClawActiveGroupChatId: (id: string | null) => void;
  setHermesActiveGroupChatId: (id: string | null) => void;
  // Agent modal
  setOpenClawActiveAgentModalId: (id: string | null) => void;
  setHermesActiveAgentModalId: (id: string | null) => void;
  // Color mode (light/dark/system)
  cycleColorMode: () => void;
  // Claude Code project selection
  setClaudeCodeSelectedProjectId: (id: string | null) => void;
  // Session management
  addSession: (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  setActiveSessionId: (platform: 'openclaw' | 'claude-code' | 'hermes', id: string | null) => void;

  // Chat
  addChatMessage: (agentId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;

  // Group chat
  addOpenClawGroupChat: (name: string, memberIds: string[]) => void;
  updateOpenClawGroupChat: (id: string, updates: Partial<GroupChat>) => void;
  removeOpenClawGroupChat: (id: string) => void;
  addHermesGroupChat: (name: string, memberIds: string[]) => void;
  updateHermesGroupChat: (id: string, updates: Partial<GroupChat>) => void;
  removeHermesGroupChat: (id: string) => void;

  // Brain config
  addBrainSection: (section: Omit<BrainSection, 'id'>) => { id: string };
  updateBrainSection: (id: string, updates: Partial<BrainSection>) => void;
  removeBrainSection: (id: string) => void;
  forkBrainSection: (fromId: string, toTool: string) => void;
  setBrainTab: (tab: 'openclaw' | 'claude-code' | 'hermes') => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeTab: loadFromStorage('activeTab', 'openclaw'),
  openclawAgents: loadFromStorage('openclawAgents', defaultOpenClawAgents),
  hermesAgents: loadFromStorage('hermesAgents', defaultHermesAgents),
  sessions: loadFromStorage('sessions', []),
  brainConfigs: loadFromStorage('brainConfigs', defaultBrainConfigs),
  rightPanelOpen: loadFromStorage('rightPanelOpen', true),
  leftSidebarOpen: loadFromStorage('leftSidebarOpen', true),
  colorMode: loadFromStorage<'light' | 'dark' | 'system'>('colorMode', 'system'),
  openclawGroupChats: loadFromStorage('openclawGroupChats', defaultGroupChats),
  hermesGroupChats: loadFromStorage('hermesGroupChats', defaultHermesGroupChats),
  openclawActiveGroupChatId: null,
  hermesActiveGroupChatId: null,
  claudeCodeSelectedProjectId: null,
  brainTab: 'openclaw',
  openclawActiveSessionId: null,
  claudeCodeActiveSessionId: null,
  hermesActiveSessionId: null,
  openclawActiveAgentModalId: null,
  hermesActiveAgentModalId: null,
  agentModels: loadFromStorage('agentModels', defaultAgentModels),
  chatMessages: loadFromStorage('chatMessages', {}),

  setActiveTab: (tab) => {
    localStorage.setItem(`${STORAGE_KEY}-activeTab`, JSON.stringify(tab));
    set({ activeTab: tab });
  },

  toggleRightPanel: () => {
    const next = !get().rightPanelOpen;
    localStorage.setItem(`${STORAGE_KEY}-rightPanelOpen`, JSON.stringify(next));
    set({ rightPanelOpen: next });
  },

  toggleLeftSidebar: () => {
    const next = !get().leftSidebarOpen;
    localStorage.setItem(`${STORAGE_KEY}-leftSidebarOpen`, JSON.stringify(next));
    set({ leftSidebarOpen: next });
  },

  cycleColorMode: () => {
    // Cycles: light → dark → system → light
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const current = get().colorMode;
    const next = order[(order.indexOf(current) + 1) % order.length];
    localStorage.setItem(`${STORAGE_KEY}-colorMode`, JSON.stringify(next));
    set({ colorMode: next });
  },

  // Agent CRUD
  addOpenClawAgent: (agent) => {
    const id = `oc-${Date.now()}`;
    const agents = [...get().openclawAgents, { ...agent, id }];
    localStorage.setItem(`${STORAGE_KEY}-openclawAgents`, JSON.stringify(agents));
    set({ openclawAgents: agents });
  },
  updateOpenClawAgent: (id, updates) => {
    const agents = get().openclawAgents.map((a) => a.id === id ? { ...a, ...updates } : a);
    localStorage.setItem(`${STORAGE_KEY}-openclawAgents`, JSON.stringify(agents));
    set({ openclawAgents: agents });
  },
  removeOpenClawAgent: (id) => {
    const agents = get().openclawAgents.filter((a) => a.id !== id);
    localStorage.setItem(`${STORAGE_KEY}-openclawAgents`, JSON.stringify(agents));
    set({ openclawAgents: agents });
  },
  addHermesAgent: (agent) => {
    const id = `he-${Date.now()}`;
    const agents = [...get().hermesAgents, { ...agent, id }];
    localStorage.setItem(`${STORAGE_KEY}-hermesAgents`, JSON.stringify(agents));
    set({ hermesAgents: agents });
  },
  updateHermesAgent: (id, updates) => {
    const agents = get().hermesAgents.map((a) => a.id === id ? { ...a, ...updates } : a);
    localStorage.setItem(`${STORAGE_KEY}-hermesAgents`, JSON.stringify(agents));
    set({ hermesAgents: agents });
  },
  removeHermesAgent: (id) => {
    const agents = get().hermesAgents.filter((a) => a.id !== id);
    localStorage.setItem(`${STORAGE_KEY}-hermesAgents`, JSON.stringify(agents));
    set({ hermesAgents: agents });
  },

  setAgentModel: (agentId, model) => {
    const updated = { ...get().agentModels, [agentId]: model };
    saveToStorage('agentModels', updated);
    set({ agentModels: updated });
  },

  setOpenClawActiveGroupChatId: (id) => set({ openclawActiveGroupChatId: id }),
  setHermesActiveGroupChatId: (id) => set({ hermesActiveGroupChatId: id }),
  setOpenClawActiveAgentModalId: (id) => set({ openclawActiveAgentModalId: id }),
  setHermesActiveAgentModalId: (id) => set({ hermesActiveAgentModalId: id }),
  setClaudeCodeSelectedProjectId: (id) => set({ claudeCodeSelectedProjectId: id }),

  addChatMessage: (sessionId, message) => {
    const id = Math.random().toString(16).slice(2, 10);
    const timestamp = Date.now();
    const prev = get().chatMessages;
    const updated = { ...prev, [sessionId]: [...(prev[sessionId] || []), { ...message, id, timestamp }] };
    saveToStorage('chatMessages', updated);
    set({ chatMessages: updated });
    // Update session's lastMessage and updatedAt
    const session = get().sessions.find((s) => s.id === sessionId);
    if (session && message.content) {
      const sessions = get().sessions.map((s) =>
        s.id === sessionId ? { ...s, lastMessage: message.content.slice(0, 80), updatedAt: timestamp } : s
      );
      saveToStorage('sessions', sessions);
      set({ sessions });
    }
  },

  addOpenClawGroupChat: (name, memberIds) => {
    const id = `gc-oc-${Date.now()}`;
    const chats = [...get().openclawGroupChats, { id, name, memberIds }];
    localStorage.setItem(`${STORAGE_KEY}-openclawGroupChats`, JSON.stringify(chats));
    set({ openclawGroupChats: chats });
  },
  updateOpenClawGroupChat: (id, updates) => {
    const chats = get().openclawGroupChats.map((g) => g.id === id ? { ...g, ...updates } : g);
    localStorage.setItem(`${STORAGE_KEY}-openclawGroupChats`, JSON.stringify(chats));
    set({ openclawGroupChats: chats });
  },
  removeOpenClawGroupChat: (id) => {
    const chats = get().openclawGroupChats.filter((g) => g.id !== id);
    localStorage.setItem(`${STORAGE_KEY}-openclawGroupChats`, JSON.stringify(chats));
    set({ openclawGroupChats: chats });
  },
  addHermesGroupChat: (name, memberIds) => {
    const id = `gc-he-${Date.now()}`;
    const chats = [...get().hermesGroupChats, { id, name, memberIds }];
    localStorage.setItem(`${STORAGE_KEY}-hermesGroupChats`, JSON.stringify(chats));
    set({ hermesGroupChats: chats });
  },
  updateHermesGroupChat: (id, updates) => {
    const chats = get().hermesGroupChats.map((g) => g.id === id ? { ...g, ...updates } : g);
    localStorage.setItem(`${STORAGE_KEY}-hermesGroupChats`, JSON.stringify(chats));
    set({ hermesGroupChats: chats });
  },
  removeHermesGroupChat: (id) => {
    const chats = get().hermesGroupChats.filter((g) => g.id !== id);
    localStorage.setItem(`${STORAGE_KEY}-hermesGroupChats`, JSON.stringify(chats));
    set({ hermesGroupChats: chats });
  },

  addSession: (session) => {
    const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    const newSession: Session = { ...session, id, createdAt: now, updatedAt: now };
    const sessions = [...get().sessions, newSession];
    saveToStorage('sessions', sessions);
    // Auto-select the new session as active
    const platform = session.tool;
    if (platform === 'openclaw') set({ sessions, openclawActiveSessionId: id });
    else if (platform === 'claude-code') set({ sessions, claudeCodeActiveSessionId: id });
    else if (platform === 'hermes') set({ sessions, hermesActiveSessionId: id });
    else set({ sessions });
  },
  removeSession: (id) => {
    const sessions = get().sessions.filter((s) => s.id !== id);
    saveToStorage('sessions', sessions);
    set({ sessions });
  },
  updateSession: (id, updates) => {
    const sessions = get().sessions.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
    );
    saveToStorage('sessions', sessions);
    set({ sessions });
  },
  setActiveSessionId: (platform, id) => {
    if (platform === 'openclaw') set({ openclawActiveSessionId: id });
    else if (platform === 'claude-code') set({ claudeCodeActiveSessionId: id });
    else if (platform === 'hermes') set({ hermesActiveSessionId: id });
  },

  // Brain config CRUD
  addBrainSection: (section): { id: string } => {
    const id = `brain-${Date.now()}`;
    const sections = [...get().brainConfigs.sections, { ...section, id }];
    const updated = { sections };
    saveToStorage('brainConfigs', updated);
    set({ brainConfigs: updated });
    return { id };
  },
  updateBrainSection: (id, updates) => {
    const sections = get().brainConfigs.sections.map((s) => s.id === id ? { ...s, ...updates } : s);
    const updated = { sections };
    saveToStorage('brainConfigs', updated);
    set({ brainConfigs: updated });
  },
  removeBrainSection: (id) => {
    const sections = get().brainConfigs.sections.filter((s) => s.id !== id);
    const updated = { sections };
    saveToStorage('brainConfigs', updated);
    set({ brainConfigs: updated });
  },
  forkBrainSection: (fromId, toTool) => {
    const fromSection = get().brainConfigs.sections.find((s) => s.id === fromId);
    if (!fromSection) return;
    // Complete copy — new section belongs to target platform only
    const newSection: BrainSection = {
      id: `brain-${Date.now()}`,
      title: fromSection.title,
      content: fromSection.content,
      tool: toTool as any,
    };
    const sections = [...get().brainConfigs.sections, newSection];
    const updated = { sections };
    saveToStorage('brainConfigs', updated);
    set({ brainConfigs: updated });
  },
  setBrainTab: (tab) => set({ brainTab: tab }),
}));