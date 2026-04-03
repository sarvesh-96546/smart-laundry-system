import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/useApp';
import toast from 'react-hot-toast';
import InvoiceModal from './InvoiceModal';

const STAGES = ['Pending', 'Washing', 'Drying', 'Ironing', 'Completed', 'Delivered'];

export default function OrderDetails() {
  const { id } = useParams();
  const { API_BASE_URL, user, socket, getAuthHeaders } = useApp();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setOrderData(data);
      } else {
        setError(data.error || data.message || 'Order not found');
      }
    } catch (err) {
      setError(`Failed to fetch: ${err.message || 'Connection error'}`);
    } finally {
      setLoading(false);
    }
  }, [id, API_BASE_URL, getAuthHeaders]);

  useEffect(() => {
    fetchOrder();

    if (socket) {
      const handleUpdate = (data) => {
        if (data.order_id === id) {
          fetchOrder();
          toast(`Status updated: ${data.new_status}`, { icon: '🔄' });
        }
      };
      socket.on('status_update', handleUpdate);
      return () => socket.off('status_update', handleUpdate);
    }
  }, [id, fetchOrder, socket]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Protocol updated to ${newStatus}`);
        fetchOrder();
      } else {
        toast.error(data.error || 'Update rejected by server');
      }
    } catch {
      toast.error('Status sync failure');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-md">
        <span className="material-symbols-outlined text-red-400 text-5xl mb-4">error</span>
        <h2 className="text-2xl font-bold text-white mb-2">Protocol Error</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link to="/admin" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-primary transition-colors">
          Return to Hub
        </Link>
      </div>
    </div>
  );

  if (!orderData || !orderData.order) return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-[#ff8f8f]">Protocol Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-sm">The requested Laundry Protocol could not be synchronized with the central engine.</p>
        <Link to="/admin" className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all">Return to Hub</Link>
      </div>
    </div>
  );

  const { order, updates } = orderData;
  const currentStageIndex = STAGES.indexOf(order.status);

  const getETA = () => {
    if (order.status === 'Delivered' || order.status === 'Completed') return 'READY';
    const baseWait = order.priority_level === 'VIP' ? 1 : order.priority_level === 'Express' ? 2 : 4;
    return `${baseWait - Math.max(0, currentStageIndex)} Hours`;
  };

  const synchronizedUpdates = [...updates];
  if (synchronizedUpdates.length > 0 && synchronizedUpdates[0].status !== order.status) {
    synchronizedUpdates.unshift({
      status: order.status,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] pb-20 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto pt-24 px-6 md:px-0">
        <div className="flex justify-between items-center mb-8">
          <Link to={user ? (user.role === 'customer' ? "/" : "/admin") : "/"} className="text-slate-500 hover:text-primary flex items-center gap-2 group transition-colors text-sm font-bold">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {user ? (user.role === 'customer' ? "Return to Core Nexus" : "Return to Command Center") : "Back to Home"}
          </Link>
          
          <div className="flex items-center gap-3">
             {(order.status === 'Completed' || order.status === 'Delivered' || (user && user.role !== 'customer')) && (
                <button 
                  onClick={() => setIsInvoiceOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-[0_0_15px_rgba(143,245,255,0.1)]"
                >
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  Invoice Protocol
                </button>
             )}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Tracking link copied!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Copy Link
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Status Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative overflow-hidden rounded-4xl bg-[#111] border border-white/5 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 block">Protocol Identification</span>
                    <h1 className="text-5xl font-bold tracking-tighter">{order.id}</h1>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
                      order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                   <div className="flex justify-between mb-4">
                      {STAGES.map((s, idx) => (
                        <div key={s} className="flex flex-col items-center gap-2 group relative">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-500 ${
                             idx <= currentStageIndex ? 'bg-primary border-primary text-black shadow-[0_0_20px_rgba(143,245,255,0.3)]' : 'bg-[#1a1a1a] border-white/10 text-slate-600'
                           }`}>
                             {idx + 1}
                           </div>
                           <span className={`text-[8px] font-bold uppercase tracking-tighter hidden md:block ${
                             idx <= currentStageIndex ? 'text-white' : 'text-slate-600'
                           }`}>{s}</span>
                        </div>
                      ))}
                   </div>
                   <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_#8ff5ff]"
                        style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                      ></div>
                   </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                    <p className="font-bold text-sm">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Impact</p>
                    <p className="font-bold text-sm text-primary">₹{order.amount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Items Count</p>
                    <p className="font-bold text-sm">{order.items_count} Units</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Payment</p>
                    <p className={`font-bold text-sm ${order.payment_status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {order.payment_status || 'Unpaid'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">ETA STATUS</p>
                    <p className="font-bold text-sm">
                      {getETA()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Controls */}
            {user && (user.role === 'staff' || user.role === 'admin') && (
              <div className="bg-[#111] border border-white/5 p-8 rounded-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">settings</span>
                    Operational Controls
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                   {STAGES.map((s, idx) => (
                     <button
                        key={s}
                        disabled={updating || idx === currentStageIndex}
                        onClick={() => updateStatus(s)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          idx === currentStageIndex 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                     >
                       {s}
                     </button>
                   ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-[#111] border border-white/5 p-8 rounded-4xl">
              <h2 className="text-sm font-bold mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">history</span>
                Event Logs
              </h2>
              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                {synchronizedUpdates.map((update, idx) => (
                  <div key={idx} className="relative pl-12 animate-in slide-in-from-left duration-500">
                    <div className={`absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center z-10 border ${
                      idx === 0 ? 'bg-primary border-primary text-black' : 'bg-background border-white/5 text-slate-600'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {update.status === 'Pending' ? 'inventory_2' : 
                         update.status === 'Washing' ? 'local_laundry_service' : 
                         update.status === 'Drying' ? 'air' : 
                         update.status === 'Ironing' ? 'iron' : 'check_circle'}
                      </span>
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>{update.status}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">
                        {new Date(update.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Details Column */}
          <div className="space-y-6">
             <div className="bg-[#161616] p-6 rounded-4xl border border-white/5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Internal Notes</h3>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                   {order.notes || "No extra directives recorded for this protocol."}
                </p>
             </div>
             
             <div className="bg-[#161616] p-6 rounded-4xl border border-white/5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Pickup Logistics</h3>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                   </div>
                   <p className="text-sm text-slate-400 line-clamp-2">
                      {order.address || "Standard site pickup protocols apply."}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        order={order}
      />
    </div>
  );
}
