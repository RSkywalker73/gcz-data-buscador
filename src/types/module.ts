import type { LucideIcon } from 'lucide-react';

export interface ColumnConfig {
  field: string;
  headerName: string;
  minWidth?: number;
}

export interface ModuleConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  rpcFunction: string;
  schema: string;
  tableName: string;
  fallbackSearchFields: string[];
  columns: ColumnConfig[];
  dateFields: Set<string>;
  amountFields: Set<string>;
  statusField: string;
  pinnedField: string;
  recommendedColumns: Set<string>;
  localStorageKey: string;
  sumField: string;
  sumLabel: string;
  searchPlaceholder: string;
}
