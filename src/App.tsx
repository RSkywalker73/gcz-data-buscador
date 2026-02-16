import { useState, useCallback } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { modules, DEFAULT_MODULE_ID, getModule } from './modules/registry';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Sidebar } from './components/Sidebar';
import { ModuleView } from './components/ModuleView';
import { Footer } from './components/Footer';

ModuleRegistry.registerModules([AllCommunityModule]);

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(DEFAULT_MODULE_ID);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeModule = getModule(activeModuleId)!;

  const handleStart = useCallback(() => setStarted(true), []);

  if (!started) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden animate-fade-in">
      <Sidebar
        modules={modules}
        activeModuleId={activeModuleId}
        onModuleSelect={setActiveModuleId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ModuleView key={activeModuleId} moduleConfig={activeModule} />
        <Footer />
      </div>
    </div>
  );
};

export default App;
