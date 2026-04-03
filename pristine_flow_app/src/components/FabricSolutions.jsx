import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function FabricSolutions() {
  const solutions = [
    { 
      title: 'Molecular Wash', 
      icon: 'waves', 
      desc: 'Quantum sensors detect fiber composition and soil level to calibrate exactly 142 variables, ensuring the perfect cleanse without fabric degradation.',
      features: ['Automated soil detection', 'Cationic surfactant matching', 'Variable frequency agitation']
    },
    { 
      title: 'Cryo-Dry Cleaning', 
      icon: 'ac_unit', 
      desc: 'Temperature-controlled chemical processing for delicate garments that cannot withstand traditional aqueous or thermal stress.',
      features: ['Sub-zero solvent cycles', 'Zero-shrinkage guarantee', 'Silk & Lace optimization']
    },
    { 
      title: 'Precision Steam Press', 
      icon: 'iron', 
      desc: 'Industrial-grade steam tensioning platforms provide exactly 12.4 PSI of pressure to restore original garment geometry.',
      features: ['Geometric crispness recovery', 'Fiber relaxing technology', 'Antiseptic steam delivery']
    },
    { 
      title: 'Fabric Restoration', 
      icon: 'magic_button', 
      desc: 'Advanced enzymatic protocols to restore color vibrancy and fiber strength to aging or distressed luxury garments.',
      features: ['Enzymatic color recovery', 'Micro-fiber re-bonding', 'Lifetime garment extension']
    }
  ];

  return (
    <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] overflow-hidden relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-tertiary/10 blur-[150px] rounded-full"></div>
      </div>

      <Navbar />

      <main className="pt-40 pb-24 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold mb-6">
            CORE ALCHEMY • SYSTEM V4.2
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8">
            Fabric <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-tertiary">Solutions</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Discover the scientific architecture behind our garment restoration protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {solutions.map((solution, i) => (
            <div key={i} className="bg-[#121212] p-10 rounded-[3rem] border border-white/5 group hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-[100px]">{solution.icon}</span>
               </div>
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-[#1a1a1a] rounded-[1.25rem] border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-8">
                    <span className="material-symbols-outlined text-3xl">{solution.icon}</span>
                 </div>
                 <h2 className="text-3xl font-black tracking-tighter mb-4">{solution.title}</h2>
                 <p className="text-slate-400 leading-relaxed mb-8">
                    {solution.desc}
                 </p>
                 <div className="space-y-3 pt-6 border-t border-white/5">
                   {solution.features.map((feature, j) => (
                     <div key={j} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                       {feature}
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          ))}
        </div>

        <section className="mt-32 p-12 md:p-24 bg-[#121212] rounded-[4rem] border border-white/5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent"></div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 relative z-10">Ready for a <span className="text-primary italic">Protocol Shift?</span></h2>
            <p className="text-slate-400 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
              Join the nexus of high-end fabric management. Experience the difference of calculated cleaning.
            </p>
            <Link to="/admin/new-order" className="inline-flex items-center gap-2 bg-primary text-black px-10 py-5 rounded-2xl font-black text-lg hover:shadow-[0_0_40px_rgba(143,245,255,0.4)] transition-all relative z-10">
              Initialize New Order
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </Link>
        </section>
      </main>
    </div>
  );
}
