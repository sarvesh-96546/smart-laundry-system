import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function StaffPanel() {
  const { orders, machines, startMachineCycle, stopMachineCycle, logout } = useApp();

  const activeOrders = orders?.filter(o => o.status !== 'Delivered' && o.status !== 'Completed') || [];
  const runningMachines = machines?.filter(m => m.status === 'Running') || [];

  return (
    <div className="min-h-screen bg-[#080808] text-white font-['Plus_Jakarta_Sans']">
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-[#111]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-[100]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#8ff5ff] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-black text-xl">electric_bolt</span>
          </div>
          <span className="font-bold tracking-tighter uppercase">Staff Operations Node</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Sync Active</span>
          </div>
          <button onClick={logout} className="text-slate-500 hover:text-red-400 font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">logout</span> Terminate Session
          </button>
        </div>
      </nav>

      <main className="pt-24 px-8 pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Active Queue */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Active Protocol Queue</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Orders requiring immediate processing</p>
                </div>
                <div className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold text-[#8ff5ff]">
                  {activeOrders.length} Protocols Pending
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOrders.map(order => (
                  <div key={order.id} className="bg-[#121212] border border-white/5 rounded-2xl p-5 hover:border-[#8ff5ff]/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-[#8ff5ff] font-bold">{order.id}</span>
                        <h3 className="font-bold text-lg mt-0.5">{order.customer}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                        order.priority === 'VIP' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-slate-400'
                      }`}>
                        {order.priority || 'REGULAR'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1">
                        <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Service Type</div>
                        <div className="text-xs font-bold text-slate-300">{order.service}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-xs font-bold text-[#8ff5ff] animate-pulse">{order.status}</div>
                      </div>
                    </div>
                    <Link 
                      to={`/order/${order.id}`}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      Process Protocol <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Machinery Status */}
          <div className="space-y-6">
            <section className="bg-[#121212] border border-white/5 rounded-3xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-[#8ff5ff]">precision_manufacturing</span>
                <div>
                  <h2 className="font-bold uppercase tracking-tight">Unit Monitoring</h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Real-time Machinery Telemetry</p>
                </div>
              </div>

              <div className="space-y-4">
                {machines?.map(machine => (
                  <div key={machine.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          machine.status === 'Running' ? 'bg-[#8ff5ff]/10 text-[#8ff5ff]' : 'bg-white/5 text-slate-500'
                        }`}>
                          <span className="material-symbols-outlined text-lg">
                            {machine.type.includes('Washing') ? 'local_laundry_service' : 'dry_cleaning'}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold">{machine.name}</div>
                          <div className="text-[9px] text-slate-500 uppercase">{machine.type}</div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        machine.status === 'Operational' ? 'bg-green-500' : 
                        machine.status === 'Running' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                      }`}></div>
                    </div>

                    {machine.status === 'Running' ? (
                      <div className="space-y-3">
                        <div className="bg-black/40 rounded-lg p-2.5">
                          <div className="flex justify-between text-[8px] uppercase font-bold text-slate-500 mb-1">
                            <span>Processing Pulse</span>
                            <span className="text-[#8ff5ff]">{machine.assigned_order_id}</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#8ff5ff] w-2/3 animate-[shimmer_2s_infinite_linear]"></div>
                          </div>
                        </div>
                        <button 
                          onClick={() => stopMachineCycle(machine.id)}
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all"
                        >
                          Manual Override
                        </button>
                      </div>
                    ) : machine.status === 'Operational' ? (
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Unit Ready for Deployment
                      </div>
                    ) : (
                      <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        Offline / Maintenance
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Link to="/machinery" className="text-[10px] font-bold text-[#8ff5ff] hover:underline uppercase tracking-widest flex items-center gap-2">
                  View Comprehensive Telemetry <span className="material-symbols-outlined text-xs">open_in_new</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
