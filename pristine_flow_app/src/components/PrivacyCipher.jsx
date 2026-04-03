import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function PrivacyCipher() {
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
          Privacy <span className="text-primary">Policy</span>
        </h1>

        <div className="space-y-12 text-slate-400">
          <section className="bg-[#121212] p-8 md:p-12 rounded-[2.5rem] border border-white/5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl">security</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Data Harvesting Protocols
            </h2>
            <p className="leading-relaxed mb-6">
              At Pristine Flow, we recognize that your laundry habits are part of your digital identity. Our algorithms analyze garment composition and frequency of service solely to calibrate molecular wash cycles.
            </p>
            <ul className="space-y-3 font-bold text-sm text-slate-300">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-xs">check_circle</span> Personal ID encryption at rest</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-xs">check_circle</span> No third-party data extraction</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-xs">check_circle</span> Direct link between phone and protocol</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Encryption Standards</h2>
            <p className="leading-relaxed">
              Every order tracking request is signed with a cryptographic key. We do not store plain-text phone numbers; instead, we utilize high-collision resistance hashing to verify your identity across our network.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">Third-Party Neutrality</h2>
            <p className="leading-relaxed">
              We operate as a sovereign data entity. We do not trade, sell, or rent your operational data to marketing clusters or external analytics firms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
