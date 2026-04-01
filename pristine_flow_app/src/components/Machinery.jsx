import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STAGES = ['Received', 'Washing', 'Drying', 'Ironing', 'Ready for Pickup'];

const getRemainingTime = (endTime) => {
  if (!endTime) return null;
  const diff = new Date(endTime) - new Date();
  if (diff <= 0) return 0;
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function MachineCard({ machine, onStop }) {
  const [timeLeft, setTimeLeft] = useState(getRemainingTime(machine.expected_end_time));

  useEffect(() => {
    let timer;
    if (machine.status === 'Running' && machine.expected_end_time) {
      timer = setInterval(() => {
        const remaining = getRemainingTime(machine.expected_end_time);
        setTimeLeft(remaining);
        if (remaining === 0) {
           clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [machine.status, machine.expected_end_time]);

  const isRunning = machine.status === 'Running';
  const isMaintenance = machine.status === 'Maintenance' || machine.status === 'Under Maintenance';

  return (
    <div className={`relative group overflow-hidden bg-[#121212] rounded-4xl p-8 border transition-all duration-500 scale-100 hover:scale-[1.02] ${
      isRunning ? 'border-primary/30 shadow-[0_0_50px_rgba(143,245,255,0.05)]' : 
      isMaintenance ? 'border-yellow-500/20' : 'border-white/5'
    }`}>
      {/* Animated Background Elements */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent animate-shimmer"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-primary/5 to-transparent"></div>
        </div>
      )}

      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 ${
          isRunning ? 'bg-primary text-black rotate-12' : 'bg-white/5 text-slate-500 rotate-0'
        }`}>
          <span className={`material-symbols-outlined text-3xl ${isRunning ? 'animate-spin-slow' : ''}`}>
            {machine.type.includes('Washer') ? 'local_laundry_service' : 
             machine.type.includes('Dryer') ? 'air' : 'iron'}
          </span>
        </div>
        <div className="text-right">
           <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
             isRunning ? 'bg-[#ff8f8f]/10 text-[#ff8f8f]' : 'bg-white/5 text-slate-500'
           }`}>
             {machine.status}
           </span>
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{machine.name}</h4>
        <div className="flex items-end gap-3 mb-6">
          <span className="text-3xl font-bold tracking-tighter">
            {isRunning ? timeLeft || '0:00' : 'IDLE'}
          </span>
          {isRunning && <span className="text-xs text-primary font-bold mb-1.5 animate-pulse">REMAINING</span>}
        </div>

        {isRunning ? (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
               <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Active Protocol</p>
               <p className="font-bold text-sm text-primary">{machine.assigned_order_id}</p>
               <p className="text-[10px] text-slate-400 mt-1">{machine.assigned_customer}</p>
            </div>
            <button 
              onClick={() => onStop(machine.id)}
              className="w-full py-4 bg-white/5 hover:bg-[#ff8f8f]/10 border border-white/5 hover:border-[#ff8f8f]/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#ff8f8f] transition-all"
            >
              Manual Override
            </button>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
               <span>Usage Intensity</span>
               <span>{machine.usage_count || 0} Cycles</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-700 transition-all duration-1000" 
                  style={{ width: `${Math.min((machine.usage_count || 0) * 5, 100)}%` }}
                ></div>
             </div>
             <button 
               disabled={isMaintenance}
               className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-30"
             >
               Ready for Load
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Machinery() {
  const { machines, orders, startMachineCycle, stopMachineCycle, API_BASE_URL } = useApp();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isScanOpen, setIsScanOpen] = useState(false);

  const pendingTasks = orders.filter(o => 
    o.status === 'Received' || o.status === 'Washing' || o.status === 'Drying' || o.status === 'Ironing'
  );

  const handleStart = (machineId, taskId) => {
    if (!taskId) {
      toast.error('Select a protocol from the queue first');
      return;
    }
    startMachineCycle(machineId, taskId);
    setSelectedTask(null);
  };

  return (
    <>
      <main className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] pb-20">
        <header className="fixed top-0 right-0 left-0 z-100 bg-background/80 backdrop-blur-3xl border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-6">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <span className="material-symbols-outlined text-slate-500">arrow_back</span>
              </Link>
              <div>
                <h2 className="text-xl font-bold tracking-tighter">STAFF COMMAND</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Operational Pulse: Active</p>
              </div>
            </div>
            <button 
              onClick={() => setIsScanOpen(true)}
              className="px-6 py-3 bg-primary text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(143,245,255,0.3)] transition-all flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
              Scan Protocol
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto pt-32 px-8 grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Left: Task Queue */}
          <section className="xl:col-span-4 lg:sticky lg:top-32 h-fit">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Operational Queue</h3>
               <span className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">
                 {pendingTasks.length} NODES
               </span>
            </div>
            
            <div className="space-y-4">
              {pendingTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`relative group p-6 rounded-3xl border transition-all cursor-pointer ${
                    selectedTask?.id === task.id ? 'bg-[#1a1a1a] border-primary/50' : 'bg-[#111] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                        task.priority === 'VIP' ? 'bg-yellow-500/10 text-yellow-500' :
                        task.priority === 'Express' ? 'bg-[#ff8f8f]/10 text-[#ff8f8f]' : 'bg-white/5 text-slate-500'
                     }`}>
                       {task.priority || 'Standard'}
                     </span>
                     <span className="text-[10px] font-mono text-slate-600">{task.id}</span>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{task.customer}</h4>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{task.status}</p>
                    <div className="flex gap-1">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className={`w-1 h-3 rounded-full ${i <= (STAGES.indexOf(task.status) + 1) ? 'bg-primary' : 'bg-white/5'}`}></div>
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right: Machine Grid */}
          <section className="xl:col-span-8">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Machinery Network</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Online</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {machines.map(machine => (
                 <div key={machine.id} className="relative">
                   <MachineCard 
                     machine={machine} 
                     onStart={(id) => handleStart(id, selectedTask?.id)}
                     onStop={stopMachineCycle}
                   />
                   {!machine.assigned_order_id && selectedTask && (
                     <div className="absolute inset-0 bg-primary text-black rounded-4xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 cursor-pointer pointer-events-auto"
                          onClick={() => handleStart(machine.id, selectedTask.id)}>
                        <span className="material-symbols-outlined text-4xl mb-2">move_to_inbox</span>
                        <p className="text-xs font-bold uppercase tracking-widest">Assign Protocol</p>
                        <p className="text-[10px] font-mono mt-2">{selectedTask.id}</p>
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </section>
        </div>
      </main>

      {/* Simulated Scanner Modal */}
      {isScanOpen && (
        <div className="fixed inset-0 z-20000 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[3rem] p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent animate-shimmer"></div>
              
              <div className="w-48 h-48 border-2 border-dashed border-primary/30 rounded-3xl mx-auto mb-10 flex items-center justify-center relative">
                 <div className="absolute inset-4 border border-primary/50 rounded-2xl animate-pulse"></div>
                 <span className="material-symbols-outlined text-6xl text-primary">qr_code_2</span>
              </div>

              <h2 className="text-2xl font-bold mb-4">Awaiting Signal...</h2>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed">Position the laundry protocol QR code within the sensor range for instant synchronization.</p>
              
              <div className="flex gap-4">
                 <button 
                  onClick={() => setIsScanOpen(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                 >
                   Abort
                 </button>
                 <button 
                  onClick={() => {
                    if (pendingTasks.length > 0) {
                      setSelectedTask(pendingTasks[0]);
                      setIsScanOpen(false);
                      toast.success(`Protocol ${pendingTasks[0].id} synced via scan`);
                    }
                  }}
                  className="flex-1 py-4 bg-primary text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(143,245,255,0.3)] transition-all"
                 >
                   Simulate Scan
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
