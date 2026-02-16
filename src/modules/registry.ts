import { pqt06Config } from './pqt06';
import { bdValorizacionesConfig } from './bd_valorizaciones';
import type { ModuleConfig } from '../types/module';

export const modules: ModuleConfig[] = [pqt06Config, bdValorizacionesConfig];

export const DEFAULT_MODULE_ID = 'pqt06';

export function getModule(id: string): ModuleConfig | undefined {
  return modules.find((m) => m.id === id);
}
