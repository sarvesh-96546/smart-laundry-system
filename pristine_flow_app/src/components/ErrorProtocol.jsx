import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorProtocol() {
  return (
    <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Glitchy Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-500/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '-1s' }}></div>
      </div>

      <div className="relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-24 h-24 bg-[#121212] rounded-4xl border border-red-500/30 flex items-center justify-center mx-auto mb-12 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <span className="material-symbols-outlined text-red-500 text-5xl animate-pulse">warning</span>
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-4 bg-red-500/10 px-4 py-1 rounded-full inline-block">
            PROTOCOL DEVIATION DETECTED
          </div>
          <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-none mb-6">
            4<span className="text-primary italic">0</span>4
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            SYSTEM ALERT: Your current request has reached an encrypted or non-existent sector of the Pristine Flow Nexus.
          </p>
        </div>

        <div className="pt-12">
            <Link 
              to="/" 
              className="px-10 py-5 bg-white text-black font-black rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 mx-auto w-fit"
            >
              <span className="material-symbols-outlined font-bold">home</span>
              Return to Core Nexus
            </Link>
        </div>
      </div>

      {/* Technical Metadata Footer */}
      <div className="absolute bottom-10 left-10 text-[8px] font-black uppercase tracking-widest text-slate-700 font-mono text-left space-y-1">
        <div>ERROR_NODE: 0x8892-ALPHA</div>
        <div>UPLINK_STATUS: TERMINATED</div>
        <div>SECTOR: NULL_VOID_404</div>
      </div>
    </div>
  );
}
