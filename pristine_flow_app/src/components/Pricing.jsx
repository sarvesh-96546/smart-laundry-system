import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const { prices, setPrices } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [newBase, setNewBase] = useState(prices.base);

  const handleUpdate = () => {
    setPrices(prev => ({ ...prev, base: parseInt(newBase) }));
    setIsEditing(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-8 h-20 w-full">
          <div className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 font-headline">
            Pristine Flow
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-tight">
            <Link className="text-neutral-400 hover:text-cyan-300 transition-all" to="/admin">Dashboard</Link>
            <Link className="text-cyan-400 font-bold hover:text-cyan-300 transition-all" to="/pricing">Pricing</Link>
            <Link className="text-neutral-400 hover:text-cyan-300 transition-all" to="/customers">Customers</Link>
            <Link className="text-neutral-400 hover:text-cyan-300 transition-all" to="/machinery">Machinery</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto bg-[#080808] text-white">
        <header className="mb-16 flex justify-between items-end">
          <div>
            <h1 className="text-[3.5rem] font-bold tracking-tight text-white leading-tight">
              Service <span className="text-[#8ff5ff]">Catalog</span>
            </h1>
            <p className="text-slate-400 max-w-xl mt-4 text-lg">
              Precision care for every fiber. Transparent pricing for the modern lifestyle.
            </p>
          </div>
          <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 flex flex-col items-end gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Base Rate</span>
            {isEditing ? (
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={newBase}
                  onChange={(e) => setNewBase(e.target.value)}
                  className="bg-black border border-cyan-500/50 rounded-lg px-2 py-1 text-sm w-20 outline-none"
                />
                <button onClick={handleUpdate} className="text-xs bg-cyan-500 text-black px-2 py-1 rounded font-bold">SAVE</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                <span className="text-2xl font-bold text-[#8ff5ff]">₹{prices.base}</span>
                <span className="material-symbols-outlined text-xs text-slate-500 group-hover:text-cyan-400">edit</span>
              </div>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="md:col-span-2 relative group overflow-hidden rounded-2xl bg-[#121212] p-8 border border-white/5 transition-all">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="material-symbols-outlined text-[#8ff5ff] text-4xl p-3 bg-[#8ff5ff]/10 rounded-xl">wash</span>
                  <span className="px-4 py-1 rounded-full bg-[#8ff5ff]/20 text-[#8ff5ff] text-[0.7rem] font-bold tracking-widest uppercase">Popular Choice</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Wash & Fold</h3>
                <p className="text-slate-400 max-w-md">Everyday luxury. We sort, pre-treat, wash, and expertly fold your garments with eco-friendly detergents.</p>
              </div>
              <div className="mt-12 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-[#8ff5ff]">₹{prices.base * 2.5}</span>
                <span className="text-slate-500 font-medium">/ per kg</span>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl bg-[#121212] p-8 border border-white/5 transition-all">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-secondary text-4xl p-3 bg-secondary/10 rounded-xl mb-8">dry_cleaning</span>
              <h3 className="text-2xl font-bold text-white mb-2">Dry Cleaning</h3>
              <p className="text-slate-400 text-sm mb-12">Professional chemical cleaning for delicate fabrics and tailored garments.</p>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm">Silk Blouse</span>
                  <span className="text-[#8ff5ff] font-bold">₹{prices.base * 5}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm">Trousers</span>
                  <span className="text-[#8ff5ff] font-bold">₹{prices.base * 4}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Full Suit</span>
                  <span className="text-[#8ff5ff] font-bold">₹{prices.base * 12}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl bg-[#121212] p-8 border border-white/5 transition-all">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-tertiary text-4xl p-3 bg-tertiary/10 rounded-xl mb-8">iron</span>
              <h3 className="text-2xl font-bold text-white mb-2">Ironing</h3>
              <p className="text-slate-400 text-sm mb-12">Crisp, professional finish for your already-washed items.</p>
              <div className="mt-auto">
                <span className="text-3xl font-extrabold text-tertiary">₹{prices.base * 1}</span>
                <span className="text-slate-500 text-sm">/ item</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 relative group overflow-hidden rounded-2xl bg-[#121212] p-8 border border-white/5 transition-all">
            <div className="relative z-10 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <span className="material-symbols-outlined text-secondary-dim text-4xl p-3 bg-secondary-dim/10 rounded-xl mb-8">bed</span>
                <h3 className="text-2xl font-bold text-white mb-2">Bedding & Home</h3>
                <p className="text-slate-400 text-sm">Deep sanitized cleaning for comforters, duvets, and luxury linens.</p>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-xl flex justify-between items-center border border-white/5">
                  <span className="text-sm font-medium">King Comforter</span>
                  <span className="text-secondary-dim font-bold">₹{prices.base * 15}</span>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl flex justify-between items-center border border-white/5">
                  <span className="text-sm font-medium">Luxury Linens</span>
                  <span className="text-secondary-dim font-bold">₹{prices.base * 8}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#8ff5ff] to-[#3b82f6] p-12 text-black">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight">The Pristine Membership</h2>
              <p className="text-black/80 text-lg">Unlock 20% off all services, priority scheduling, and complimentary same-day delivery.</p>
            </div>
            <button className="bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all active:scale-95">
              Become a Member
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
