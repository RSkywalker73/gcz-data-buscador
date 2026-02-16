export const Footer: React.FC = () => {
  return (
    <footer className="h-7 bg-white border-t border-slate-200 px-4 flex items-center justify-between shrink-0 text-[9px] text-slate-400 font-medium z-30">
      <span>© 2026 RTL - hola@raultrujillo.com</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-emerald-500">
          <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
          Conectado
        </div>
      </div>
    </footer>
  );
};
