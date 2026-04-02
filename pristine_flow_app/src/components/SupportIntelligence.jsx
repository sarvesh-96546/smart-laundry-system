import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/useApp';

export default function SupportIntelligence() {
  const { API_BASE_URL } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Technical Protocol', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
        const response = await fetch(`${API_BASE_URL}/api/queries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
            toast.success('Protocol Transmitted: Our intelligence core will respond shortly.');
            setFormData({ name: '', email: '', subject: 'Technical Protocol', message: '' });
        } else {
            toast.error(data.error || 'Transmission failure');
        }
    } catch {
        toast.error('System Uplink Failure: Could not establish connection.');
    } finally {
        setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] overflow-hidden relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-tertiary/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '-3s' }}></div>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-linear-to-br from-primary to-tertiary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-black text-sm">water_drop</span>
            </div>
            <span className="text-lg font-black tracking-tighter">PRISTINE FLOW</span>
          </Link>
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">home</span>
            Core Nexus
          </Link>
        </div>
      </nav>

      <main className="pt-40 pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 animate-in fade-in zoom-in-95 duration-1000">
        <div className="space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold mb-6 uppercase tracking-widest">
              Liaison Protocol • 24/7 Active
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
              Support <span className="text-primary italic">Intelligence</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
              Establish a direct uplink with our fabric care alchemists. Whether you're experiencing a protocol deviation or a molecular anomaly, our core is ready.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-[#121212] rounded-2xl border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">alternate_email</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Uplink</div>
                <div className="font-bold text-lg">core@pristineflow.tech</div>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-[#121212] rounded-2xl border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Ops Node</div>
                <div className="font-bold text-lg">+91 9876543210</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#121212] rounded-4xl border border-white/5 inline-flex items-center gap-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <div className="text-xs font-black uppercase tracking-[2px]">System Status: <span className="text-green-500">Optimum Performance</span></div>
          </div>
        </div>

        <div className="bg-[#121212] p-8 md:p-12 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <span className="material-symbols-outlined text-[120px]">contact_support</span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 ml-1 font-bold">Operator Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="ID Name"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 ml-1 font-bold">Uplink Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary/50 transition-all font-mono"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 ml-1 font-bold">Inquiry Sphere</label>
              <select 
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              >
                <option value="Technical Protocol">Technical Protocol Deviation</option>
                <option value="Billing Synchronization">Billing Synchronization Query</option>
                <option value="Fabric Anomaly">Fabric Anomaly Report</option>
                <option value="General Uplink">General Nexus Uplink</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 ml-1 font-bold">Transmission Body</label>
              <textarea 
                required
                rows="5"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-3xl py-4 px-5 text-sm outline-none focus:border-primary/50 transition-all resize-none"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Detail your request..."
              />
            </div>
            <button 
              type="submit" 
              disabled={sending}
              className="w-full bg-primary text-black font-black py-5 rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(143,245,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? 'Transmitting...' : 'Initiate Transmission'}
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
