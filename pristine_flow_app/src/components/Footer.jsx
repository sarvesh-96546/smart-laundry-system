import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#8ff5ff]/5 blur-[120px] rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        {/* Brand & Mission */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#8ff5ff] to-[#3b82f6] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-black text-sm">water_drop</span>
            </div>
            <span className="text-lg font-bold tracking-tighter">PRISTINE FLOW</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Orchestrating the evolution of fabric care through molecular science and digital precision. We are the alchemists of your wardrobe.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#8ff5ff]/10 hover:text-[#8ff5ff] transition-all border border-white/5">
              <span className="material-symbols-outlined text-xl">share</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#8ff5ff]/10 hover:text-[#8ff5ff] transition-all border border-white/5">
              <span className="material-symbols-outlined text-xl">alternate_email</span>
            </a>
          </div>
        </div>

        {/* Navigation Protocol */}
        <div>
          <h4 className="text-[#8ff5ff] font-bold uppercase tracking-[0.2em] text-[10px] mb-8">Navigation Protocol</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-white transition-colors">Home Base</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing Matrix</Link></li>
            <li><Link to="/machinery" className="hover:text-white transition-colors">System Infrastructure</Link></li>
            <li><Link to="/customers" className="hover:text-white transition-colors">User Network</Link></li>
          </ul>
        </div>

        {/* Services & Support */}
        <div>
          <h4 className="text-[#8ff5ff] font-bold uppercase tracking-[0.2em] text-[10px] mb-8">Fabric Solutions</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li><a href="#services" className="hover:text-white transition-colors">Molecular Wash</a></li>
            <li><a href="#services" className="hover:text-white transition-colors">Bio-Dry Cleaning</a></li>
            <li><a href="#services" className="hover:text-white transition-colors">Garment Restoration</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Support Intelligence</a></li>
          </ul>
        </div>

        {/* Contact Intelligence */}
        <div>
          <h4 className="text-[#8ff5ff] font-bold uppercase tracking-[0.2em] text-[10px] mb-8">Contact Intelligence</h4>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#8ff5ff] text-xl">location_on</span>
              <p className="text-sm text-slate-400">
                123 Alchemist Row, Suite 001<br />
                Quantum District, CA 90210
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[#8ff5ff] text-xl">call</span>
              <p className="text-sm text-slate-400">+1 (555) 000-FLOW</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[#8ff5ff] text-xl">mail</span>
              <p className="text-sm text-slate-400">core@pristineflow.tech</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
          © 2026 PRISTINE FLOW OPERATIONAL ALCHEMY. ALL PROTOCOLS RESERVED.
        </p>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
          <a href="#" className="hover:text-[#8ff5ff] transition-colors">Privacy Cipher</a>
          <a href="#" className="hover:text-[#8ff5ff] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#8ff5ff] transition-colors">Data Protocol</a>
        </div>
      </div>
    </footer>
  );
}
