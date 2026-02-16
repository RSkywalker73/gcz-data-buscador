import { useMemo } from 'react';

interface SelectionBarProps {
  selectedRows: Record<string, any>[];
  sumField: string;
  sumLabel: string;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({ selectedRows, sumField, sumLabel }) => {
  const selectedSum = useMemo(() => {
    return selectedRows.reduce((sum, row) => {
      const val = Number(row[sumField]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [selectedRows, sumField]);

  if (selectedRows.length === 0) return null;

  return (
    <div className="h-8 bg-blue-600 px-4 flex items-center justify-between shrink-0 z-30 text-white text-xs font-medium">
      <span>{selectedRows.length} registro{selectedRows.length !== 1 ? 's' : ''} seleccionado{selectedRows.length !== 1 ? 's' : ''}</span>
      <span className="tabular-nums">
        {sumLabel}: <span className="font-bold">{selectedSum.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </span>
    </div>
  );
};
