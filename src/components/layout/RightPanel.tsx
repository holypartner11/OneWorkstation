import { useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { PanelRightClose, Copy, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

type ToolTab = 'openclaw' | 'claude-code' | 'hermes';

function parseSection(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <h3 key={i} className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2 first:mt-0">{line.replace('## ', '')}</h3>;
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-2 text-gray-600 dark:text-gray-400 list-disc list-inside">{line.replace('- ', '')}</li>;
    }
    if (line.trim()) {
      return <p key={i} className="text-gray-600 dark:text-gray-400 mb-1">{line}</p>;
    }
    return null;
  });
}

const TOOL_TABS: { id: ToolTab; label: string; color: string }[] = [
  { id: 'openclaw', label: 'OpenClaw', color: 'blue' },
  { id: 'claude-code', label: 'Claude Code', color: 'gray' },
  { id: 'hermes', label: 'Hermes', color: 'emerald' },
];

export function RightPanel() {
  const store = useAppStore();
  const { rightPanelOpen, toggleRightPanel, brainConfigs, addBrainSection, updateBrainSection, removeBrainSection, forkBrainSection } = store;

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [forkingSection, setForkingSection] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!rightPanelOpen) return null;

  const { brainTab } = store;
  // Show sections that belong to this brainTab
  const sections = (brainConfigs?.sections || []).filter((s) =>
    !brainTab || s.tool === brainTab
  );

  const currentSection = sections.find((s) => s.id === selectedSection) || sections[0];
  const sectionToFork = sections.find((s) => s.id === forkingSection);

  const handleFork = (toTool: ToolTab) => {
    if (sectionToFork) {
      forkBrainSection(sectionToFork.id, toTool);
      setForkingSection(null);
    }
  };

  // For fork buttons, we want to fork FROM current section's tool TO the other tabs

  return (
    <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col relative">
      {/* Header with tool tabs */}
      <div className="border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Brain</span>
          <button onClick={toggleRightPanel} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <PanelRightClose size={14} />
          </button>
        </div>
        <div className="flex px-2 pb-1.5 gap-0.5">
          {TOOL_TABS.map((tab) => {
            const isActive = brainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => store.setBrainTab(tab.id)}
                className={`flex-1 text-xs py-1 rounded transition-colors text-center ${
                  isActive
                    ? tab.color === 'blue' ? 'bg-blue-500 text-white' : tab.color === 'emerald' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section list */}
      <div className="border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">配置节</span>
          <button onClick={() => {
            setAddingSection(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <Plus size={10} />
          </button>
        </div>
        <div className="px-2 pb-2 space-y-0.5">
          {sections.map((section) => {
            const isSelected = selectedSection === section.id || (!selectedSection && sections[0]?.id === section.id);
            const tagColor = section.tool === 'openclaw' ? 'text-blue-500 dark:text-blue-400' : section.tool === 'hermes' ? 'text-emerald-500 dark:text-emerald-400' : section.tool === 'claude-code' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500';
            return (
              <div key={section.id} className="group flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => { setSelectedSection(section.id); setEditing(false); }}>
                <div className={`flex-1 text-xs truncate ${isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                  {section.title}
                </div>
                {section.tool && <span className={`text-[9px] font-medium ${tagColor}`}>{section.tool.toUpperCase()}</span>}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                  <button onClick={(e) => { e.stopPropagation(); setForkingSection(section.id); }} className="p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30" title="复刻">
                    <Copy size={9} className="text-blue-400" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedSection(section.id); setEditing(true); setEditContent(section.content); }} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Edit2 size={9} className="text-gray-400" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); removeBrainSection(section.id); }} className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
                    <Trash2 size={9} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add section */}
      {addingSection && (
        <form
          className="border-b border-gray-100 dark:border-gray-700 px-3 py-2 space-y-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            const title = newSectionTitle.trim();
            if (title) {
              const newSection = addBrainSection({ title, content: '## 新配置\n\n- 内容...', tool: brainTab as any });
              setNewSectionTitle('');
              setAddingSection(false);
              setSelectedSection(newSection.id);
            }
          }}
        >
          <input
            ref={inputRef}
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setAddingSection(false);
                setNewSectionTitle('');
              }
            }}
            placeholder="配置节标题"
            className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400"
          />
          <div className="flex gap-1">
            <button
              type="submit"
              className="flex-1 text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >确认</button>
            <button
              type="button"
              onClick={() => { setAddingSection(false); setNewSectionTitle(''); }}
              className="px-2 text-xs py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >取消</button>
          </div>
        </form>
      )}

      {/* Fork dialog */}
      {forkingSection && sectionToFork && (
        <div className="border-b border-gray-100 dark:border-gray-700 px-3 py-2 bg-blue-50">
          <div className="text-xs text-blue-600 mb-1.5 font-medium">复刻「{sectionToFork.title}」到：</div>
          <div className="flex flex-wrap gap-1">
            {TOOL_TABS.filter((t) => t.id !== sectionToFork.tool).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleFork(t.id)}
                className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setForkingSection(null)}
            className="text-xs text-gray-400 mt-1.5 hover:text-gray-600 transition-colors"
          >
            取消
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {editing ? (
          <div className="space-y-2">
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-48 text-xs p-2 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 font-mono resize-none leading-relaxed" />
            <div className="flex gap-1">
              <button type="button" onClick={() => {
                if (currentSection) { updateBrainSection(currentSection.id, { content: editContent }); setEditing(false); }
              }} className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                <Check size={10} /> 保存
              </button>
              <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <X size={10} /> 取消
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {currentSection ? parseSection(currentSection.content) : (
              <div className="text-center text-gray-400 dark:text-gray-500 mt-8">暂无配置<br />点击上方 + 新增配置节</div>
            )}
          </div>
        )}
      </div>

      <div className="text-[10px] text-gray-300 dark:text-gray-600 text-right pr-3 pb-2">ai798Lab</div>
    </div>
  );
}