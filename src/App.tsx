import { TopNav } from './components/layout/TopNav';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightPanel } from './components/layout/RightPanel';
import { GroupChatBubble, MainView, PopupLayer } from './components/layout/MainContent';
import { AgentChatModal } from './components/layout/AgentChatModal';
import { useAppStore } from './store/appStore';
import { PanelRightOpen } from 'lucide-react';

function getDarkClass(colorMode: string) {
  if (colorMode === 'dark') return true;
  if (colorMode === 'light') return false;
  // system
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function App() {
  const { activeTab, rightPanelOpen, toggleRightPanel, colorMode } = useAppStore();
  const store = useAppStore();
  const isDark = getDarkClass(colorMode);

  const isGroupChatOpen = activeTab !== 'claude-code' && (
    activeTab === 'openclaw' ? !!store.openclawActiveGroupChatId
    : !!store.hermesActiveGroupChatId
  );

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden ${isDark ? 'dark' : ''}`}>
      <TopNav />
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        <LeftSidebar />
        <main className="flex-1 flex overflow-hidden bg-bg min-w-0">
          {/* Main area: chat panel or session list */}
          <MainView />
        </main>
        {rightPanelOpen && <RightPanel />}
        {!rightPanelOpen && (
          <button onClick={toggleRightPanel}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-l-0 border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-l-md px-1 py-3 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 z-10">
            <PanelRightOpen size={14} className="text-gray-400" />
          </button>
        )}
      </div>
      {/* Popups rendered at App level (outside main flow) */}
      {isGroupChatOpen && <GroupChatBubble />}
      <PopupLayer />
      {store.openclawActiveAgentModalId && (
        <AgentChatModal agentId={store.openclawActiveAgentModalId} platform="openclaw" />
      )}
      {store.hermesActiveAgentModalId && (
        <AgentChatModal agentId={store.hermesActiveAgentModalId} platform="hermes" />
      )}
    </div>
  );
}