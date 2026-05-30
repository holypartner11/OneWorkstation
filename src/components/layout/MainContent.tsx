import { useState, useEffect, useRef } from 'react';
import { useAppStore, AGENT_MODELS } from '../../store/appStore';
import { X, Send, MessageSquare } from 'lucide-react';
import { ClaudeCodeView } from '../../views/ClaudeCodeView';

// ── MainChatPanel (renders session chat in main area) ──────────────────────
function MainChatPanel({ sessionId, accentColor }: { sessionId: string; accentColor: string }) {
  const store = useAppStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  const [input, setInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(session?.title || '');
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = store.chatMessages[sessionId] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setTitleValue(session?.title || '');
  }, [session?.title]);

  const saveTitle = () => {
    if (session && titleValue.trim()) {
      store.updateSession(session.id, { title: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    store.addChatMessage(sessionId, { role: 'user', content: input });
    setInput('');
    setTimeout(() => {
      store.addChatMessage(sessionId, {
        role: 'assistant',
        content: `收到：「${input}」\n\n（模拟回复）`,
      });
    }, 600);
  };

  const handleClose = () => {
    store.setActiveSessionId(store.activeTab, null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: accentColor }}>
            {session ? session.title?.slice(0, 2) || 'S' : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {editingTitle ? (
                <input
                  autoFocus
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                  className="text-sm font-semibold text-gray-900 bg-transparent border-b border-blue-400 focus:outline-none w-full"
                />
              ) : (
                <div
                  onClick={() => setEditingTitle(true)}
                  className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-500 truncate"
                  title="点击修改标题"
                >
                  {session?.title || '会话'}
                </div>
              )}
              {session && (
                <select
                  value={session.model || 'claude-sonnet-4'}
                  onChange={(e) => store.updateSession(session.id, { model: e.target.value })}
                  className="text-xs px-1.5 py-0.5 rounded border border-gray-200 focus:outline-none focus:border-blue-400 bg-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {AGENT_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            </div>
            <div className="text-xs text-gray-400">{session ? new Date(session.createdAt).toLocaleString('zh-CN') : ''}</div>
          </div>
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-3"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
              {session ? session.title?.slice(0, 2) || 'S' : 'S'}
            </div>
            <div className="text-sm text-gray-500 font-medium mb-1">{session?.title || '会话'}</div>
            <div className="text-xs text-gray-400 mb-6">开始对话吧</div>
            <div className="text-xs text-gray-300 text-center max-w-xs">
              说点什么开始对话
            </div>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
                style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="bg-gray-100 rounded-full flex items-center px-4 py-2.5 gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入消息..." className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
          <button onClick={handleSend}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: accentColor }}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SessionList (main content when no session active) ─────────────────────
function SessionList() {
  const store = useAppStore();
  const { activeTab } = store;
  const allSessions = store.sessions.filter((s) => s.tool === activeTab);
  const sorted = [...allSessions].sort((a, b) => b.updatedAt - a.updatedAt);
  const accentColor = activeTab === 'hermes' ? '#10b981' : activeTab === 'claude-code' ? '#6b7280' : '#3b82f6';

  const handleOpenSession = (sessionId: string) => {
    store.setActiveSessionId(activeTab, sessionId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-md mx-auto space-y-2">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 py-1">会话历史</div>
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold mb-3" style={{ color: accentColor }}>
                {activeTab === 'openclaw' ? 'OC' : activeTab === 'hermes' ? 'HE' : 'CC'}
              </div>
              <div className="text-sm font-medium text-gray-500 mb-1">暂无会话</div>
              <div className="text-xs text-gray-400 mb-1">点击左侧 Agent 开始对话</div>
              <div className="text-xs text-gray-300">或点击上方 + 新建会话</div>
            </div>
          ) : sorted.map((session) => (
            <div key={session.id} onClick={() => handleOpenSession(session.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 cursor-pointer group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                S
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{session.title}</div>
                {session.lastMessage && (
                  <div className="text-xs text-gray-400 truncate">{session.lastMessage}</div>
                )}
              </div>
              <button onClick={(e) => { e.stopPropagation(); store.removeSession(session.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50">
                <X size={11} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PopupLayer (placeholder for future floating panels) ──────────────────
export function PopupLayer() {
  // Reserved for future floating panels (agent detail, settings, etc.)
  return null;
}

// ── GroupChatBubble (only floating) ───────────────────────────────────────
export function GroupChatBubble() {
  const { activeTab } = useAppStore();
  const store = useAppStore();

  const activeGroupChatId = activeTab === 'openclaw' ? store.openclawActiveGroupChatId : store.hermesActiveGroupChatId;
  const setActiveGroupChatId = activeTab === 'openclaw' ? store.setOpenClawActiveGroupChatId : store.setHermesActiveGroupChatId;
  const groupChats = activeTab === 'openclaw' ? store.openclawGroupChats : store.hermesGroupChats;
  const agents = activeTab === 'openclaw' ? store.openclawAgents : store.hermesAgents;
  const groupChat = groupChats.find((gc: any) => gc.id === activeGroupChatId);
  if (!groupChat) return null;

  const [input, setInput] = useState('');
  const [mentionPickerOpen, setMentionPickerOpen] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const groupChatId = `gc-${groupChat.id}`;
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messages = store.chatMessages[groupChatId] || [];
  const isHermes = activeTab === 'hermes';
  const accentColor = isHermes ? '#10b981' : '#3b82f6';

  // Agents in this group chat
  const groupAgents = agents.filter((a: any) => groupChat.memberIds.includes(a.id));
  const filteredAgents = mentionSearch
    ? groupAgents.filter((a: any) => a.name.toLowerCase().includes(mentionSearch.toLowerCase()))
    : groupAgents;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleInputChange = (value: string) => {
    setInput(value);
    // Detect @mention trigger
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && (lastAtIndex === 0 || value[lastAtIndex - 1] === ' ')) {
      const search = value.slice(lastAtIndex + 1);
      if (!search.includes(' ')) {
        setMentionSearch(search);
        setMentionPickerOpen(true);
        return;
      }
    }
    setMentionPickerOpen(false);
    setMentionSearch('');
  };

  const insertMention = (agentName: string) => {
    const lastAtIndex = input.lastIndexOf('@');
    const newInput = input.slice(0, lastAtIndex) + `@${agentName} `;
    setInput(newInput);
    setMentionPickerOpen(false);
    setMentionSearch('');
    inputRef.current?.focus();
  };

  const handleSend = () => {
    if (!input.trim()) return;
    // Prefix message with @mention tags for parsing
    const content = input;
    store.addChatMessage(groupChatId, { role: 'user', content });
    setInput('');
    setMentionPickerOpen(false);
    setTimeout(() => {
      store.addChatMessage(groupChatId, { role: 'assistant', content: `收到：「${input}」\n（群聊模拟回复）` });
    }, 600);
  };

  const renderMessageContent = (content: string) => {
    // Highlight @mentions in message content
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith('@') ? (
        <span key={i} className="font-medium text-blue-500 bg-blue-50 px-0.5 rounded">{part}</span>
      ) : part
    );
  };

  const getSenderInfo = (msg: any) => {
    // Check if this is an @mention prefixed message
    const mentionMatch = msg.content.match(/^@(\w+)\s/);
    if (mentionMatch) {
      const agentName = mentionMatch[1];
      const agent = groupAgents.find((a: any) => a.name === agentName);
      if (agent) {
        return { name: agent.name, color: accentColor };
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setActiveGroupChatId(null)}>
      <div className="w-[480px] h-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
              <MessageSquare size={12} />
            </div>
            <span className="text-sm font-semibold text-gray-800">{groupChat.name}</span>
            <span className="text-xs text-gray-400">
              ({groupAgents.map((a: any) => a.name).join(', ')})
            </span>
          </div>
          <button onClick={() => setActiveGroupChatId(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 && <div className="text-center text-xs text-gray-400 mt-8">开始群聊</div>}
          {messages.map((msg: any) => {
            const sender = getSenderInfo(msg);
            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${
                  msg.role === 'user' ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`} style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}>
                  {sender && (
                    <div className="text-[10px] font-medium mb-0.5 opacity-70">{sender.name}</div>
                  )}
                  <div className="leading-relaxed">{renderMessageContent(msg.content)}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 py-3 border-t border-gray-100 relative">
          {/* Mention picker */}
          {mentionPickerOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-32 overflow-y-auto">
              {filteredAgents.length === 0 ? (
                <div className="text-xs text-gray-400 px-3 py-1">未找到 Agent</div>
              ) : filteredAgents.map((agent: any) => (
                <button key={agent.id} onClick={() => insertMention(agent.name)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-left">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: accentColor }}>
                    {agent.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-800">{agent.name}</div>
                    <div className="text-[10px] text-gray-400">{agent.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="bg-gray-100 rounded-full flex items-center px-4 py-2 gap-3">
            <input ref={inputRef} value={input} onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !mentionPickerOpen && handleSend()}
              placeholder="输入 @ 提及 Agent..." className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
            <button onClick={handleSend}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: accentColor }}>
              <Send size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MainView: renders chat panel or session list ────────────────────────────
export function MainView() {
  const store = useAppStore();
  const { activeTab } = store;

  // Claude Code uses its own view
  if (activeTab === 'claude-code') {
    return <ClaudeCodeView />;
  }

  const activeSessionId = activeTab === 'openclaw' ? store.openclawActiveSessionId
    : activeTab === 'hermes' ? store.hermesActiveSessionId
    : null;

  if (activeSessionId) {
    const accentColor = activeTab === 'hermes' ? '#10b981' : '#3b82f6';
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <MainChatPanel sessionId={activeSessionId} accentColor={accentColor} />
      </div>
    );
  }

  return <SessionList />;
}