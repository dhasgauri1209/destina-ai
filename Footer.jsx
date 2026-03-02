function Footer() {
  return (
    <footer className="mt-14 border-t border-white/10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 py-8 light:border-slate-300/60 light:from-white/70 light:via-white/90 light:to-white/70">
      <div className="app-container flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <p className="text-sm text-slate-300 light:text-slate-600">© {new Date().getFullYear()} Destina AI. Crafted for premium travel planning.</p>
        <p className="text-sm font-medium text-slate-200 light:text-slate-700">Developed by – Gauri Sunil Dhas</p>
      </div>
    </footer>
  );
}

export default Footer;
