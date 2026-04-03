import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function DataProtocol() {
  return (
    <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] overflow-hidden relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 blur-[120px] rounded-full"></div>
      </div>

      <Navbar />

      <main className="pt-40 pb-24 px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold mb-6">
          PROTOCOL SECURED • v1.0.0
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-12">
          Data <span className="text-primary">Protocol</span>
        </h1>

        <div className="space-y-12 text-slate-400">
          <section className="bg-[#121212] p-8 md:p-12 rounded-[2.5rem] border border-white/5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl">hub</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              The Encryption Layer
            </h2>
            <p className="leading-relaxed mb-6">
              Our data protocol ensures that every byte of information—from service timestamps to garment weights—is hashed and synchronized across our secure distributed network.
            </p>
            <ul className="space-y-3 font-bold text-sm text-slate-300">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-xs">database</span> Encrypted order metadata</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-xs">database</span> Point-to-point telemetry</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-xs">database</span> Automated deletion after 36 months</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Retention Cycle</h2>
            <p className="leading-relaxed">
              We retain minimal identifying data for exactly the duration needed to fulfill your subscription and ensure service continuity. Inactive accounts are purged from our primary cluster every quarter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Data Request Process</h2>
            <p className="leading-relaxed">
              Users can request a complete "Molecular Data Dump" by contacting our core intelligence office. This protocol takes exactly 72 hours for full cryptographic decryption.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
