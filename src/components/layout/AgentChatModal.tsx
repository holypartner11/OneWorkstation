import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { X, Send } from 'lucide-react';

interface AgentChatModalProps {
  agentId: string;
  platform: 'openclaw' | 'hermes';
}

export function AgentChatModal({ agentId, platform }: AgentChatModalProps) {
  const store = useAppStore();
  const agents = platform === 'openclaw' ? store.openclawAgents : store.hermesAgents;
  const agent = agents.find((a) => a.id === agentId);
  const setModalId = platform === 'openclaw' ? store.setOpenClawActiveAgentModalId : store.setHermesActiveAgentModalId;

  const sessionId = `agent-${agentId}`;
  const messages = store.chatMessages[sessionId] || [];
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const isHermes = platform === 'hermes';
  const accentColor = isHermes ? '#10b981' : '#3b82f6';

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    store.addChatMessage(sessionId, { role: 'user', content: input });
    setInput('');
    setTimeout(() => {
      store.addChatMessage(sessionId, { role: 'assistant', content: `收到：「${input}」\n（模拟回复）` });
    }, 600);
  };

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setModalId(null)}>
      <div
        className="w-[480px] h-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {agent.name.slice(0, 2)}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{agent.name}</div>
              <div className="text-xs text-gray-400">{agent.role}</div>
            </div>
          </div>
          <button
            onClick={() => setModalId(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-3"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                {agent.name.slice(0, 2)}
              </div>
              <div className="text-sm text-gray-500 font-medium mb-1">{agent.name}</div>
              <div className="text-xs text-gray-400 mb-6">{agent.role}</div>
              <div className="text-xs text-gray-300 text-center max-w-xs">
                {agent.description || '我是您的任务规划助手，可以帮您拆分任务、制定计划。'}
              </div>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="bg-gray-100 rounded-full flex items-center px-4 py-2.5 gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}