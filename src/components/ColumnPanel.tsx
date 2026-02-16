import { X } from 'lucide-react';
import type { ModuleConfig } from '../types/module';

interface ColumnPanelProps {
  moduleConfig: ModuleConfig;
  isOpen: boolean;
  onClose: () => void;
  visibilityMap: Record<string, boolean>;
  visibleCount: number;
  onToggleColumn: (field: string) => void;
  onShowAll: () => void;
  onShowRecommended: () => void;
}

export const ColumnPanel: React.FC<ColumnPanelProps> = ({
  moduleConfig,
  isOpen,
  onClose,
  visibilityMap,
  visibleCount,
  onToggleColumn,
  onShowAll,
  onShowRecommended,
}) => {
  return (
    <div className={`absolute top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-lg z-50 flex flex-col transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-200 shrink-0">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Columnas <span className="text-slate-400 font-medium normal-case tracking-normal">({visibleCount}/{moduleConfig.columns.length})</span></span>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-1.5 px-3 py-2 border-b border-slate-100 shrink-0">
        <button onClick={onShowAll} className="flex-1 text-[10px] font-semibold px-2 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Mostrar todas</button>
        <button onClick={onShowRecommended} className="flex-1 text-[10px] font-semibold px-2 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">Recomendadas</button>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {moduleConfig.columns.map((col) => {
          const isPinned = col.field === moduleConfig.pinnedField;
          return (
            <label
              key={col.field}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-50 transition-colors ${isPinned ? 'opacity-50 cursor-default' : ''}`}
            >
              <input
                type="checkbox"
                checked={isPinned ? true : visibilityMap[col.field] !== false}
                disabled={isPinned}
                onChange={() => onToggleColumn(col.field)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0"
              />
              <span className="text-[11px] text-slate-600 select-none">{col.headerName}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
