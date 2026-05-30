import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import { Clock, ExternalLink, RefreshCw, Search, FolderOpen, CheckCircle, XCircle, Plus } from 'lucide-react';

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function sizeLabel(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${(bytes / 1024).toFixed(0)}KB`;
}

export function ClaudeCodeView() {
  const { claudeCodeSelectedProjectId, setClaudeCodeSelectedProjectId } = useAppStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!claudeCodeSelectedProjectId) return;
    setLoading(true);
    api.claudeCode.listSessions(claudeCodeSelectedProjectId)
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [claudeCodeSelectedProjectId]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(q) || s.lastMessage.toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  const handleResume = useCallback((sessionId: string) => {
    showToast('success', 'iTerm2 正在打开...');
    api.claudeCode.resume(sessionId)
      .then((res: any) => {
        if (!res.ok) {
          showToast('error', res.error || '操作失败');
        }
      })
      .catch(() => showToast('error', '网络错误，请检查后端服务'));
  }, [showToast]);

  const handleNew = useCallback(() => {
    showToast('success', '正在打开新会话...');
    api.claudeCode.newSession()
      .then((res: any) => {
        if (!res.ok) {
          showToast('error', res.error || '操作失败');
        }
      })
      .catch(() => showToast('error', '网络错误，请检查后端服务'));
  }, [showToast]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">Claude Code</h1>
        <p className="text-xs text-gray-400">~/.claude/projects/</p>
      </div>

      {/* Search */}
      {claudeCodeSelectedProjectId && (
        <div className="px-5 py-2 border-b border-gray-50 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索会话..."
              className="w-full text-sm px-3 py-2 pl-9 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 bg-white"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!claudeCodeSelectedProjectId ? (
          <div className="flex flex-col items-center justify-center h-full">
            <FolderOpen size={32} className="text-gray-200 mb-3" />
            <div className="text-sm text-gray-400">← 从左侧选择项目</div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">会话列表</h2>
                <p className="text-xs text-gray-400">{filteredSessions.length} 个会话</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleNew}
                  className="flex items-center gap-1 text-xs px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                  <Plus size={11} /> New
                </button>
                <button
                  onClick={() => setClaudeCodeSelectedProjectId(null)}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  ← 返回项目
                </button>
                <button
                  onClick={() => {
                    setLoading(true);
                    api.claudeCode.listSessions(claudeCodeSelectedProjectId)
                      .then(setSessions)
                      .finally(() => setLoading(false));
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">加载中...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">暂无会话</div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-300 font-mono">#{session.id.slice(0, 8)}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={10} /> {timeAgo(session.modified)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 leading-snug line-clamp-2">
                      {session.title || '—'}
                    </p>
                    {session.lastMessage && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{session.lastMessage}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{sizeLabel(session.size)}</span>
                      <button
                        onClick={() => handleResume(session.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink size={11} /> Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle size={15} className="text-emerald-500 shrink-0" />
            : <XCircle size={15} className="text-red-500 shrink-0" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}