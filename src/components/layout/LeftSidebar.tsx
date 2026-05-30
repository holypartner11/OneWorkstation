import { useState, useEffect } from 'react';
import { useAppStore, AGENT_MODELS } from '../../store/appStore';
import { MessageSquare, ChevronRight, ChevronDown, ChevronLeft, Folder, FolderOpen, Trash2, Plus, Settings, X, Check } from 'lucide-react';
import { api } from '../../services/api';

export function LeftSidebar() {
  const { activeTab, leftSidebarOpen, toggleLeftSidebar } = useAppStore();
  return (
    <div className="flex flex-col flex-shrink-0 overflow-hidden bg-white dark:bg-gray-900">
      {/* Collapse toggle */}
      <button onClick={toggleLeftSidebar}
        className="w-full h-8 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        title={leftSidebarOpen ? '收起侧边栏' : '展开侧边栏'}>
        {leftSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
      {leftSidebarOpen ? (
        <div className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {activeTab === 'openclaw' && <OpenClawSidebar />}
          {activeTab === 'hermes' && <HermesSidebar />}
          {activeTab === 'claude-code' && <ClaudeCodeSidebar />}
        </div>
      ) : (
        <div className="w-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-2 gap-1">
          {activeTab === 'openclaw' && <OpenClawCollapsedSidebar />}
          {activeTab === 'hermes' && <HermesCollapsedSidebar />}
          {activeTab === 'claude-code' && <ClaudeCodeCollapsedSidebar />}
        </div>
      )}
    </div>
  );
}

// ── Agent edit panel ──────────────────────────────────────────────────────────
function AgentEditPanel({ agent, onSave, onDelete, onClose, accentColor }: {
  agent: any; onSave: (name: string, role: string, model: string) => void;
  onDelete: () => void; onClose: () => void; accentColor: string;
}) {
  const [name, setName] = useState(agent.name);
  const [role, setRole] = useState(agent.role);
  const [model, setModel] = useState(agent.model || 'claude-sonnet-4');
  return (
    <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-700">
      <div className="text-xs font-medium mb-1.5" style={{ color: accentColor }}>编辑 Agent</div>
      <input value={name} onChange={(e) => setName(e.target.value)}
        className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:outline-none mb-1" />
      <input value={role} onChange={(e) => setRole(e.target.value)}
        className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:outline-none mb-1" />
      <select value={model} onChange={(e) => setModel(e.target.value)}
        className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 focus:outline-none mb-2">
        {AGENT_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <div className="flex gap-2">
        <button onClick={() => onSave(name, role, model)}
          className="flex-1 flex items-center justify-center gap-1 text-xs py-1 text-white rounded hover:opacity-90"
          style={{ backgroundColor: accentColor }}>
          <Check size={10} /> 保存
        </button>
        <button onClick={onDelete}
          className="px-3 text-xs py-1 bg-red-50 dark:bg-red-900 text-red-500 rounded hover:bg-red-100 dark:hover:bg-red-800">
          <Trash2 size={10} />
        </button>
        <button onClick={onClose}
          className="px-3 text-xs py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <X size={10} />
        </button>
      </div>
    </div>
  );
}

// ── Shared session section (used by both OpenClaw and Hermes) ─────────────────
function SessionSection({ sessions, onOpen, tool, accentColor }: {
  sessions: any[]; onOpen: (id: string) => void; tool: string; accentColor: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const store = useAppStore();

  const toolSessions = sessions.filter((s) => s.tool === tool);
  const sorted = [...toolSessions].sort((a, b) => b.updatedAt - a.updatedAt);
  const MAX_VISIBLE = 5;
  const visible = expanded ? sorted : sorted.slice(0, MAX_VISIBLE);
  const hidden = sorted.length - MAX_VISIBLE;

  const handleCreate = () => {
    if (title.trim()) {
      store.addSession({ title: title.trim(), content: '', tool: tool as any });
      setTitle('');
      setCreating(false);
    }
  };

  return (
    <div className="border-t border-gray-100 flex-shrink-0">
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
          {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          会话管理
        </button>
        <button onClick={() => setCreating(true)} className="text-gray-400 hover:text-gray-600">
          <Plus size={12} />
        </button>
      </div>

      {/* New session input */}
      {creating && (
        <div className="px-2 pb-1.5">
          <div className="flex items-center gap-1">
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="会话标题..."
              className="flex-1 text-xs px-2 py-1 rounded border border-gray-200 focus:outline-none focus:border-blue-400" />
            <button onClick={handleCreate} className="text-blue-500 hover:text-blue-600 text-xs px-1">✓</button>
            <button onClick={() => { setCreating(false); setTitle(''); }} className="text-gray-400 hover:text-gray-600 text-xs px-1">✕</button>
          </div>
        </div>
      )}

      <div className="px-2 pb-1.5 space-y-0.5">
        {visible.map((s) => {
          const isActive = store.openclawActiveSessionId === s.id ||
            store.hermesActiveSessionId === s.id ||
            store.claudeCodeActiveSessionId === s.id;
          return (
            <div key={s.id}
              onClick={() => onOpen(s.id)}
              className={`group flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`}
              style={isActive ? { backgroundColor: `${accentColor}10` } : {}}>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 truncate">{s.title}</div>
                <div className="text-[10px] text-gray-400">{new Date(s.updatedAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); store.removeSession(s.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50">
                <Trash2 size={9} className="text-red-400" />
              </button>
            </div>
          );
        })}
        {hidden > 0 && !expanded && (
          <button onClick={() => setExpanded(true)}
            className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 py-0.5">
            还有 {hidden} 个会话 ↓
          </button>
        )}
        {expanded && sorted.length > MAX_VISIBLE && (
          <button onClick={() => setExpanded(false)}
            className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 py-0.5">
            收起 ↑
          </button>
        )}
        {sorted.length === 0 && !creating && (
          <div className="text-xs text-gray-300 text-center py-2">暂无会话</div>
        )}
      </div>
    </div>
  );
}

// ── OpenClaw Sidebar ─────────────────────────────────────────────────────────
function OpenClawSidebar() {
  const store = useAppStore();
  const {
    openclawAgents, openclawGroupChats,
    setOpenClawActiveGroupChatId, addOpenClawGroupChat, updateOpenClawGroupChat,
    sessions,
  } = store;

  const [agentsExpanded, setAgentsExpanded] = useState(true);
  const [groupExpanded, setGroupExpanded] = useState(true);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [addingAgent, setAddingAgent] = useState(false);
  const [newAgentModel, setNewAgentModel] = useState('claude-sonnet-4');

  const handleOpenAgent = (agentId: string) => store.setOpenClawActiveAgentModalId(agentId);
  const handleOpenSession = (sessionId: string) => store.setActiveSessionId('openclaw', sessionId);

  const openEditMembers = (gc: any) => {
    setEditingGroup(gc.id);
    setEditMembers([...gc.memberIds]);
  };

  const saveEditMembers = () => {
    if (editingGroup) {
      updateOpenClawGroupChat(editingGroup, { memberIds: editMembers });
      setEditingGroup(null);
    }
  };

  const confirmCreateGroup = () => {
    if (newGroupName.trim()) {
      addOpenClawGroupChat(newGroupName.trim(), openclawAgents.slice(0, 2).map((a) => a.id));
      setNewGroupName('');
      setCreatingGroup(false);
    }
  };

  const confirmAddAgent = () => {
    if (newAgentName.trim() && newAgentRole.trim()) {
      store.addOpenClawAgent({ name: newAgentName.trim(), role: newAgentRole.trim(), description: newAgentRole.trim(), model: newAgentModel });
      setNewAgentName('');
      setNewAgentRole('');
      setNewAgentModel('claude-sonnet-4');
      setAddingAgent(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agents */}
      {agentsExpanded && (
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <button onClick={() => setAgentsExpanded(false)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200">
              <ChevronDown size={10} /> Agents
            </button>
            <button onClick={() => setAddingAgent(true)} className="text-gray-400 hover:text-blue-500">
              <Plus size={12} />
            </button>
          </div>
          <div className="py-1">
            {openclawAgents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-2 px-3 py-2 group relative">
                <div onClick={() => handleOpenAgent(agent.id)}
                  className="flex-1 flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 rounded px-1 py-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-blue-100 text-blue-600 flex-shrink-0">
                    {agent.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{agent.name}</div>
                    <select
                      value={agent.model || 'claude-sonnet-4'}
                      onChange={(e) => { e.stopPropagation(); store.updateOpenClawAgent(agent.id, { model: e.target.value }); }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-xs text-gray-400 dark:text-gray-500 bg-transparent focus:outline-none cursor-pointer hover:text-blue-500"
                    >
                      {AGENT_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setEditingAgent(agent.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-100">
                  <Settings size={11} className="text-blue-400" />
                </button>
              </div>
            ))}
          </div>

          {/* Add agent form */}
          {addingAgent && (
            <div className="px-2 py-2 bg-blue-50 dark:bg-gray-800">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5">新建 Agent</div>
              <input autoFocus value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmAddAgent()}
                placeholder="名称 (如: COS)" className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 mb-1" />
              <input value={newAgentRole} onChange={(e) => setNewAgentRole(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmAddAgent()}
                placeholder="角色 (如: 全栈工程师)" className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 mb-1" />
              <select value={newAgentModel} onChange={(e) => setNewAgentModel(e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 mb-2">
                {AGENT_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={confirmAddAgent}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  <Check size={10} /> 创建
                </button>
                <button onClick={() => { setAddingAgent(false); setNewAgentName(''); setNewAgentRole(''); setNewAgentModel('claude-sonnet-4'); }}
                  className="px-3 text-xs py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                  <X size={10} />
                </button>
              </div>
            </div>
          )}

          {/* Agent edit panel */}
          {editingAgent && (
            <AgentEditPanel
              agent={store.openclawAgents.find((a) => a.id === editingAgent)!}
              onSave={(name, role, model) => {
                store.updateOpenClawAgent(editingAgent, { name, role, model });
                setEditingAgent(null);
              }}
              onDelete={() => { store.removeOpenClawAgent(editingAgent); setEditingAgent(null); }}
              onClose={() => setEditingAgent(null)}
              accentColor="#3b82f6"
            />
          )}
        </div>
      )}
      {!agentsExpanded && (
        <div className="px-3 py-2 border-b border-gray-100">
          <button onClick={() => setAgentsExpanded(true)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
            <ChevronRight size={10} /> Agents
          </button>
        </div>
      )}

      {/* Group chats */}
      {groupExpanded && (
        <div className="border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2">
            <button onClick={() => setGroupExpanded(false)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
              <ChevronDown size={10} /> 群聊
            </button>
            <button onClick={() => setCreatingGroup(true)}
              className="text-gray-400 hover:text-blue-500">
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
          <div className="pb-1">
            {openclawGroupChats.map((gc) => (
              <div key={gc.id} onClick={() => setOpenClawActiveGroupChatId(gc.id)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer group relative">
                <MessageSquare size={13} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 truncate">{gc.name}</div>
                  <div className="flex -space-x-1 mt-0.5">
                    {openclawAgents.filter((a) => gc.memberIds.includes(a.id)).slice(0, 4).map((a) => (
                      <div key={a.id} className="w-4 h-4 rounded-full bg-blue-100 text-blue-500 border border-white flex items-center justify-center text-[8px] font-bold">
                        {a.name[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); openEditMembers(gc); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-100">
                  <Settings size={11} className="text-blue-400" />
                </button>
                <ChevronRight size={11} className="text-gray-300 opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>

          {/* Member edit modal */}
          {editingGroup && (
            <div className="px-2 py-2 border-t border-gray-100 bg-blue-50">
              <div className="text-xs font-medium text-blue-600 mb-1.5">编辑群聊成员</div>
              <div className="space-y-1">
                {openclawAgents.map((agent) => (
                  <label key={agent.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white cursor-pointer">
                    <input type="checkbox" checked={editMembers.includes(agent.id)}
                      onChange={(e) => {
                        if (e.target.checked) setEditMembers([...editMembers, agent.id]);
                        else setEditMembers(editMembers.filter((id) => id !== agent.id));
                      }}
                      className="rounded border-gray-300" />
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold bg-blue-100 text-blue-600`}>
                      {agent.name.slice(0, 2)}
                    </div>
                    <span className="text-xs text-gray-700">{agent.name}</span>
                    <span className="text-xs text-gray-400">{agent.role}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={saveEditMembers}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  <Check size={10} /> 保存
                </button>
                <button onClick={() => setEditingGroup(null)}
                  className="px-3 text-xs py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  <X size={10} />
                </button>
              </div>
            </div>
          )}

          {/* Create group form */}
          {creatingGroup && (
            <div className="px-2 py-2 border-t border-gray-100 bg-blue-50">
              <div className="text-xs font-medium text-blue-600 mb-1.5">新建群聊</div>
              <input autoFocus value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmCreateGroup()}
                placeholder="群聊名称..." className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 focus:outline-none focus:border-blue-400 mb-2" />
              <div className="flex gap-2">
                <button onClick={confirmCreateGroup}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  <Check size={10} /> 创建
                </button>
                <button onClick={() => { setCreatingGroup(false); setNewGroupName(''); }}
                  className="px-3 text-xs py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {!groupExpanded && (
        <div className="border-t border-gray-100 px-3 py-2">
          <button onClick={() => setGroupExpanded(true)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
            <ChevronRight size={10} /> 群聊
          </button>
        </div>
      )}

      {/* Session management */}
      <SessionSection sessions={sessions} onOpen={handleOpenSession} tool="openclaw" accentColor="#3b82f6" />
    </div>
  );
}

// ── Hermes Sidebar ───────────────────────────────────────────────────────────
function HermesSidebar() {
  const store = useAppStore();
  const {
    hermesAgents, hermesGroupChats,
    setHermesActiveGroupChatId, addHermesGroupChat, updateHermesGroupChat,
    sessions,
  } = store;

  const [agentsExpanded, setAgentsExpanded] = useState(true);
  const [groupExpanded, setGroupExpanded] = useState(true);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [addingAgent, setAddingAgent] = useState(false);
  const [newAgentModel, setNewAgentModel] = useState('claude-sonnet-4');

  const handleOpenAgent = (agentId: string) => store.setHermesActiveAgentModalId(agentId);
  const handleOpenSession = (sessionId: string) => store.setActiveSessionId('hermes', sessionId);

  const openEditMembers = (gc: any) => {
    setEditingGroup(gc.id);
    setEditMembers([...gc.memberIds]);
  };

  const saveEditMembers = () => {
    if (editingGroup) {
      updateHermesGroupChat(editingGroup, { memberIds: editMembers });
      setEditingGroup(null);
    }
  };

  const confirmCreateGroup = () => {
    if (newGroupName.trim()) {
      addHermesGroupChat(newGroupName.trim(), hermesAgents.slice(0, 2).map((a) => a.id));
      setNewGroupName('');
      setCreatingGroup(false);
    }
  };

  const confirmAddAgent = () => {
    if (newAgentName.trim() && newAgentRole.trim()) {
      store.addHermesAgent({ name: newAgentName.trim(), role: newAgentRole.trim(), description: newAgentRole.trim(), model: newAgentModel });
      setNewAgentName('');
      setNewAgentRole('');
      setNewAgentModel('claude-sonnet-4');
      setAddingAgent(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agents */}
      {agentsExpanded && (
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <button onClick={() => setAgentsExpanded(false)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
              <ChevronDown size={10} /> Agents
            </button>
            <button onClick={() => setAddingAgent(true)} className="text-gray-400 hover:text-emerald-500">
              <Plus size={12} />
            </button>
          </div>
          <div className="py-1">
            {hermesAgents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-2 px-3 py-2 group relative">
                <div onClick={() => handleOpenAgent(agent.id)}
                  className="flex-1 flex items-center gap-2 cursor-pointer hover:bg-emerald-50 rounded px-1 py-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-100 text-emerald-600 flex-shrink-0">
                    {agent.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{agent.name}</div>
                    <select
                      value={agent.model || 'claude-sonnet-4'}
                      onChange={(e) => { e.stopPropagation(); store.updateHermesAgent(agent.id, { model: e.target.value }); }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-xs text-gray-400 bg-transparent focus:outline-none cursor-pointer hover:text-emerald-500"
                    >
                      {AGENT_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setEditingAgent(agent.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-emerald-100">
                  <Settings size={11} className="text-emerald-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Add agent form */}
          {addingAgent && (
            <div className="px-2 py-2 bg-emerald-50">
              <div className="text-xs font-medium text-emerald-600 mb-1.5">新建 Agent</div>
              <input autoFocus value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmAddAgent()}
                placeholder="名称 (如: COS)" className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 focus:outline-none focus:border-emerald-400 mb-1" />
              <input value={newAgentRole} onChange={(e) => setNewAgentRole(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmAddAgent()}
                placeholder="角色 (如: 全栈工程师)" className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 focus:outline-none focus:border-emerald-400 mb-1" />
              <select value={newAgentModel} onChange={(e) => setNewAgentModel(e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 focus:outline-none focus:border-emerald-400 mb-2">
                {AGENT_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={confirmAddAgent}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600">
                  <Check size={10} /> 创建
                </button>
                <button onClick={() => { setAddingAgent(false); setNewAgentName(''); setNewAgentRole(''); setNewAgentModel('claude-sonnet-4'); }}
                  className="px-3 text-xs py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  <X size={10} />
                </button>
              </div>
            </div>
          )}

          {/* Agent edit panel */}
          {editingAgent && (
            <AgentEditPanel
              agent={store.hermesAgents.find((a) => a.id === editingAgent)!}
              onSave={(name, role, model) => {
                store.updateHermesAgent(editingAgent, { name, role, model });
                setEditingAgent(null);
              }}
              onDelete={() => { store.removeHermesAgent(editingAgent); setEditingAgent(null); }}
              onClose={() => setEditingAgent(null)}
              accentColor="#10b981"
            />
          )}
        </div>
      )}
      {!agentsExpanded && (
        <div className="px-3 py-2 border-b border-gray-100">
          <button onClick={() => setAgentsExpanded(true)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
            <ChevronRight size={10} /> Agents
          </button>
        </div>
      )}

      {/* Group chats */}
      {groupExpanded && (
        <div className="border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between px-3 py-2">
            <button onClick={() => setGroupExpanded(false)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
              <ChevronDown size={10} /> 群聊
            </button>
            <button onClick={() => setCreatingGroup(true)}
              className="text-gray-400 hover:text-emerald-500">
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
          <div className="pb-1">
            {hermesGroupChats.map((gc) => (
              <div key={gc.id} onClick={() => setHermesActiveGroupChatId(gc.id)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 cursor-pointer group relative">
                <MessageSquare size={13} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 truncate">{gc.name}</div>
                  <div className="flex -space-x-1 mt-0.5">
                    {hermesAgents.filter((a) => gc.memberIds.includes(a.id)).slice(0, 4).map((a) => (
                      <div key={a.id} className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-500 border border-white flex items-center justify-center text-[8px] font-bold">
                        {a.name[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); openEditMembers(gc); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-emerald-100">
                  <Settings size={11} className="text-emerald-500" />
                </button>
                <ChevronRight size={11} className="text-gray-300 opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>

          {/* Member edit modal */}
          {editingGroup && (
            <div className="px-2 py-2 border-t border-gray-100 bg-emerald-50">
              <div className="text-xs font-medium text-emerald-600 mb-1.5">编辑群聊成员</div>
              <div className="space-y-1">
                {hermesAgents.map((agent) => (
                  <label key={agent.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white cursor-pointer">
                    <input type="checkbox" checked={editMembers.includes(agent.id)}
                      onChange={(e) => {
                        if (e.target.checked) setEditMembers([...editMembers, agent.id]);
                        else setEditMembers(editMembers.filter((id) => id !== agent.id));
                      }}
                      className="rounded border-gray-300" />
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold bg-emerald-100 text-emerald-600`}>
                      {agent.name.slice(0, 2)}
                    </div>
                    <span className="text-xs text-gray-700">{agent.name}</span>
                    <span className="text-xs text-gray-400">{agent.role}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={saveEditMembers}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600">
                  <Check size={10} /> 保存
                </button>
                <button onClick={() => setEditingGroup(null)}
                  className="px-3 text-xs py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  <X size={10} />
                </button>
              </div>
            </div>
          )}

          {/* Create group form */}
          {creatingGroup && (
            <div className="px-2 py-2 border-t border-gray-100 bg-emerald-50">
              <div className="text-xs font-medium text-emerald-600 mb-1.5">新建群聊</div>
              <input autoFocus value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmCreateGroup()}
                placeholder="群聊名称..." className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 focus:outline-none focus:border-emerald-400 mb-2" />
              <div className="flex gap-2">
                <button onClick={confirmCreateGroup}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600">
                  <Check size={10} /> 创建
                </button>
                <button onClick={() => { setCreatingGroup(false); setNewGroupName(''); }}
                  className="px-3 text-xs py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {!groupExpanded && (
        <div className="border-t border-gray-100 px-3 py-2">
          <button onClick={() => setGroupExpanded(true)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700">
            <ChevronRight size={10} /> 群聊
          </button>
        </div>
      )}

      {/* Session management */}
      <SessionSection sessions={sessions} onOpen={handleOpenSession} tool="hermes" accentColor="#10b981" />
    </div>
  );
}

// ── Collapsed sidebars ─────────────────────────────────────────────────────────
function OpenClawCollapsedSidebar() {
  const store = useAppStore();
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {store.openclawAgents.map((agent) => (
        <button key={agent.id} onClick={() => store.setOpenClawActiveAgentModalId(agent.id)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold bg-blue-100 text-blue-600 hover:bg-blue-200"
          title={agent.name}>
          {agent.name.slice(0, 2)}
        </button>
      ))}
    </div>
  );
}

function HermesCollapsedSidebar() {
  const store = useAppStore();
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {store.hermesAgents.map((agent) => (
        <button key={agent.id} onClick={() => store.setHermesActiveAgentModalId(agent.id)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
          title={agent.name}>
          {agent.name.slice(0, 2)}
        </button>
      ))}
    </div>
  );
}

function ClaudeCodeCollapsedSidebar() {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 text-gray-500">CC</div>
    </div>
  );
}

// ── Claude Code Sidebar ─────────────────────────────────────────────────────
function ClaudeCodeSidebar() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { claudeCodeSelectedProjectId, setClaudeCodeSelectedProjectId } = useAppStore();

  useEffect(() => {
    setLoading(true);
    api.claudeCode.listProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projectSearch.trim()
    ? projects.filter((p) => p.id.toLowerCase().includes(projectSearch.toLowerCase()))
    : projects;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">项目</span>
        <span className="text-xs text-gray-300">{projects.length}</span>
      </div>
      <div className="px-2 py-1.5 border-b border-gray-100">
        <input value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)}
          placeholder="搜索项目..." className="w-full text-xs px-2 py-1 rounded border border-gray-200 focus:outline-none focus:border-blue-400 bg-gray-50" />
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="text-center py-6 text-gray-400 text-xs">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs">暂无项目</div>
        ) : filtered.map((p) => (
          <div key={p.id} onClick={() => setClaudeCodeSelectedProjectId(p.id)}
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer group ${claudeCodeSelectedProjectId === p.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
            {claudeCodeSelectedProjectId === p.id ? (
              <FolderOpen size={13} className="text-gray-500 flex-shrink-0" />
            ) : (
              <Folder size={13} className="text-gray-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">{p.id.split('/').pop()}</div>
              <div className="text-xs text-gray-400 truncate">{p.id}</div>
            </div>
            <ChevronRight size={11} className="text-gray-300 opacity-0 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  );
}