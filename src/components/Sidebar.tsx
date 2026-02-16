import { Menu, ChevronLeft } from 'lucide-react';
import type { ModuleConfig } from '../types/module';

interface SidebarProps {
  modules: ModuleConfig[];
  activeModuleId: string;
  onModuleSelect: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ modules, activeModuleId, onModuleSelect, isOpen, onToggle }) => {
  return (
    <aside className={`h-full bg-white border-r border-slate-200 flex flex-col shrink-0 z-40 transition-all duration-200 ease-in-out ${isOpen ? 'w-52' : 'w-12'}`}>
      <div className="h-11 flex items-center justify-center border-b border-slate-200 shrink-0">
        <button
          onClick={onToggle}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          title={isOpen ? 'Colapsar menú' : 'Expandir menú'}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 py-2 px-1.5 flex flex-col gap-0.5 overflow-y-auto">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = mod.id === activeModuleId;
          return (
            <button
              key={mod.id}
              onClick={() => onModuleSelect(mod.id)}
              title={mod.name}
              className={`flex items-center gap-2.5 rounded-md transition-colors text-left ${isOpen ? 'px-2.5 py-2' : 'px-0 py-2 justify-center'} ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {isOpen && <span className="text-[11px] font-semibold truncate">{mod.name}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
