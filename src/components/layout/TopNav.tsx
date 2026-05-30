import { useAppStore } from '../../store/appStore';
import { LayoutGrid, Code2, Cpu, Moon, Sun, Monitor } from 'lucide-react';

const tabs = [
  { id: 'openclaw' as const, label: 'OpenClaw', icon: LayoutGrid },
  { id: 'claude-code' as const, label: 'Claude Code', icon: Code2 },
  { id: 'hermes' as const, label: 'Hermes', icon: Cpu },
];

function ColorModeIcon({ mode }: { mode: string }) {
  if (mode === 'light') return <Sun size={14} />;
  if (mode === 'dark') return <Moon size={14} />;
  return <Monitor size={14} />;
}

export function TopNav() {
  const { activeTab, setActiveTab, colorMode, cycleColorMode } = useAppStore();

  return (
    <div className="h-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 gap-1">
      <div className="text-sm font-bold text-gray-700 dark:text-gray-200 mr-4 tracking-wide">OneWorkstation</div>
      <div className="flex-1" />
      <button
        onClick={cycleColorMode}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-1"
        title={
          colorMode === 'light' ? '浅色模式，点击切换' :
          colorMode === 'dark' ? '深色模式，点击切换' : '跟随系统，点击切换'
        }
      >
        <ColorModeIcon mode={colorMode} />
        <span className="text-xs">
          {colorMode === 'light' ? '浅' : colorMode === 'dark' ? '深' : '自动'}
        </span>
      </button>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
            ${activeTab === id
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-b-2 border-blue-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }
          `}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}