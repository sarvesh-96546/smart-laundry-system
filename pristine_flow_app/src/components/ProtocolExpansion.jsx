import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function ProtocolExpansion() {
  return (
    <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] overflow-hidden relative flex flex-col items-center justify-center p-6 text-center">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full"></div>
      </div>

      <Navbar />

      <main className="relative z-10 space-y-12 max-w-2xl animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-24 h-24 bg-[#121212] rounded-4xl border border-white/5 flex items-center justify-center mx-auto mb-10 shadow-2xl relative group">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="material-symbols-outlined text-primary text-5xl relative z-10">construction</span>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            Expansion Protocol: 0x8892-DELTA
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Protocol <span className="text-primary italic">Expansion</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            SYSTEM UPDATE: Membership onboarding and VIP access protocols are currently in the <span className="text-white font-bold">Molecular Synchronization Phase</span>.
          </p>
        </div>

        <div className="pt-8">
          <Link 
            to="/" 
            className="px-10 py-5 bg-white text-black font-black rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 mx-auto w-fit"
          >
            <span className="material-symbols-outlined font-bold">home</span>
            Return to Core Nexus
          </Link>
        </div>
      </main>

      {/* Technical Metadata Footer */}
      <div className="absolute bottom-10 left-10 text-[8px] font-black uppercase tracking-widest text-slate-700 font-mono text-left space-y-1 hidden md:block">
        <div>SECTOR: MEMBERSHIP_GATEWAY</div>
        <div>UPLINK_STATUS: SYNCHRONIZING</div>
        <div>COORDINATES: VAL_01_DELTA</div>
      </div>
    </div>
  );
}
