import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { SelectionChangedEvent } from 'ag-grid-community';
import type { ModuleConfig } from '../types/module';
import { useModuleData } from '../hooks/useModuleData';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import { buildColumnDefs } from '../lib/columns';
import { SearchHeader } from './SearchHeader';
import { DataGrid } from './DataGrid';
import type { DataGridHandle } from './DataGrid';
import { ColumnPanel } from './ColumnPanel';
import { SelectionBar } from './SelectionBar';

interface ModuleViewProps {
  moduleConfig: ModuleConfig;
}

export const ModuleView: React.FC<ModuleViewProps> = ({ moduleConfig }) => {
  const { query, rowData, loading, error, handleSearchChange, fetchData, initialFetch } = useModuleData(moduleConfig);
  const { visibilityMap, toggleColumn, showAllColumns, showRecommendedColumns, visibleCount } = useColumnVisibility(moduleConfig);
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const gridRef = useRef<DataGridHandle>(null);

  const columnDefs = useMemo(() => buildColumnDefs(moduleConfig, visibilityMap), [moduleConfig, visibilityMap]);

  useEffect(() => {
    initialFetch();
  }, [initialFetch]);

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    setSelectedRows(event.api.getSelectedRows());
  }, []);

  const onExport = useCallback(() => {
    gridRef.current?.exportCsv();
  }, []);

  const onRetry = useCallback(() => {
    fetchData(query);
  }, [fetchData, query]);

  return (
    <>
      <SearchHeader
        moduleConfig={moduleConfig}
        query={query}
        onSearchChange={handleSearchChange}
        loading={loading}
        resultCount={rowData.length}
        columnPanelOpen={columnPanelOpen}
        onToggleColumnPanel={() => setColumnPanelOpen((v) => !v)}
        onExport={onExport}
      />

      <div className="flex-1 relative flex flex-col overflow-hidden">
        <DataGrid
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          loading={loading}
          error={error}
          onRetry={onRetry}
          onSelectionChanged={onSelectionChanged}
        />

        <ColumnPanel
          moduleConfig={moduleConfig}
          isOpen={columnPanelOpen}
          onClose={() => setColumnPanelOpen(false)}
          visibilityMap={visibilityMap}
          visibleCount={visibleCount}
          onToggleColumn={toggleColumn}
          onShowAll={showAllColumns}
          onShowRecommended={showRecommendedColumns}
        />
      </div>

      <SelectionBar
        selectedRows={selectedRows}
        sumField={moduleConfig.sumField}
        sumLabel={moduleConfig.sumLabel}
      />
    </>
  );
};
