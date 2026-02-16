import type { ICellRendererParams } from 'ag-grid-community';

export const AmountRenderer = (params: ICellRendererParams) => {
  if (params.value == null) return null;
  const num = Number(params.value);
  if (isNaN(num)) return <span>{params.value}</span>;
  return (
    <span className="text-slate-800 text-xs tabular-nums font-semibold">
      {num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};
