import type { ColDef } from 'ag-grid-community';
import type { ModuleConfig } from '../types/module';
import { DateRenderer } from '../components/renderers/DateRenderer';
import { AmountRenderer } from '../components/renderers/AmountRenderer';
import { StatusBadge } from '../components/renderers/StatusBadge';

export function buildColumnDefs(
  moduleConfig: ModuleConfig,
  visibilityMap: Record<string, boolean>
): ColDef[] {
  return moduleConfig.columns.map((col) => {
    const def: ColDef = {
      field: col.field,
      headerName: col.headerName,
      minWidth: col.minWidth || 100,
      hide: col.field === moduleConfig.pinnedField
        ? false
        : visibilityMap[col.field] === false,
    };

    if (col.field === moduleConfig.statusField) {
      def.cellRenderer = StatusBadge;
    } else if (moduleConfig.dateFields.has(col.field)) {
      def.cellRenderer = DateRenderer;
    } else if (moduleConfig.amountFields.has(col.field)) {
      def.cellRenderer = AmountRenderer;
    }

    if (col.field === moduleConfig.pinnedField) {
      def.maxWidth = 100;
      def.pinned = 'left';
      def.lockPinned = true;
      def.cellClass = 'font-mono text-slate-400 text-xs';
    }

    return def;
  });
}
