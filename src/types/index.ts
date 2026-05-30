export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar?: string;
  model?: string;
}

export interface Session {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tool: 'openclaw' | 'claude-code' | 'hermes';
  model?: string; // selected model for this session
  agentId?: string; // which agent this session is with
  gitBranch?: string;
  dataSize?: string;
  itemCount?: string;
  unreadCount?: number;
  sessionKey?: string;
  platform?: string;
  cost?: number;
  lastMessage?: string;
}

export interface GroupChat {
  id: string;
  name: string;
  memberIds: string[];
}

export interface BrainSection {
  id: string;
  title: string;
  content: string;
  tool?: 'openclaw' | 'claude-code' | 'hermes' | 'claude';
  targetTool?: 'openclaw' | 'claude-code' | 'hermes'; // null means shared across all
}

export interface BrainConfig {
  sections: BrainSection[];
}

export interface AppState {
  activeTab: 'openclaw' | 'claude-code' | 'hermes';
  openclawAgents: Agent[];
  hermesAgents: Agent[];
  sessions: Session[];
  brainConfigs: BrainConfig;
  rightPanelOpen: boolean;
  openclawGroupChats: GroupChat[];
  hermesGroupChats: GroupChat[];
  // Active chat per platform
  openclawActiveChatId: string | null;
  hermesActiveChatId: string | null;
  claudeCodeActiveChatId: string | null;
  // Active group chat per platform
  openclawActiveGroupChatId: string | null;
  hermesActiveGroupChatId: string | null;
  // Selected project in claude-code
  claudeCodeSelectedProjectId: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}