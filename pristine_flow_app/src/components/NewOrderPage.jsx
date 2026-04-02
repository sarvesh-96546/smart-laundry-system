import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { QRCodeCanvas } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function NewOrderPage() {
  const { createOrder, prices } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    customer_name: '', 
    phone: '', 
    items_count: 1, 
    service_type: 'Wash & Fold',
    address: '',
    notes: '',
    priority_level: 'Standard'
  });
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const qrRef = useRef();

  useEffect(() => {
    let rate = 40;
    if (formData.service_type === 'Dry Clean') rate = prices.dryClean;
    else if (formData.service_type === 'Ironing') rate = prices.ironing;
    else if (formData.service_type === 'Steam Press') rate = prices.steamPress;
    
    let total = formData.items_count * rate;
    if (formData.priority_level === 'Express') total += 49;
    if (formData.priority_level === 'VIP') total += 99;
    
    setEstimatedPrice(total);
  }, [formData.items_count, formData.service_type, formData.priority_level, prices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createOrder({
        ...formData,
        amount: estimatedPrice
      });
      setCreatedOrder(result);
      toast.success('Order synchronized with system hub');
    } catch (err) {
      toast.error(`Sync Failure: ${err.message || 'Protocol rejected by server'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `LD-${createdOrder.order_id}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {!createdOrder ? (
          <div className="bg-[#121212] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Left Info Panel */}
            <div className="w-full md:w-1/3 bg-[#0d0d0d] p-10 border-r border-white/5">
                <Link to="/admin" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all mb-8">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                </Link>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">add_shopping_cart</span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter mb-4">New Protocol</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium">Initialize a new service entry. All data is synchronized in real-time with the central hub.</p>
                
                <div className="space-y-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Estimated Amount</p>
                        <p className="text-3xl font-black text-primary">₹{estimatedPrice}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Service Node</p>
                        <p className="text-sm font-black text-white">{formData.service_type}</p>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 p-10 md:p-14">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Customer Name</label>
                        <input 
                            required
                            type="text" 
                            value={formData.customer_name}
                            onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-primary/30 transition-all font-bold text-sm"
                            placeholder="Full Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Identifier</label>
                        <input 
                            required
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-primary/30 transition-all font-bold text-sm"
                            placeholder="+91"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Service Node</label>
                        <select 
                            value={formData.service_type}
                            onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-primary/30 transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                            <option value="Wash & Fold">Wash & Fold</option>
                            <option value="Dry Clean">Dry Cleaning</option>
                            <option value="Ironing">Ironing Only</option>
                            <option value="Steam Press">Premium Steam</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority Protocol</label>
                        <select 
                            value={formData.priority_level}
                            onChange={(e) => setFormData({...formData, priority_level: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#ffd700]/30 transition-all font-bold text-sm appearance-none cursor-pointer text-[#ffd700]"
                        >
                            <option value="Standard">Standard Execution</option>
                            <option value="Express">Express (+ ₹49)</option>
                            <option value="VIP">VIP Priority (+ ₹99)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Items Count</label>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-2">
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, items_count: Math.max(1, formData.items_count - 1)})}
                                className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="flex-1 text-center font-black text-lg">{formData.items_count}</span>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, items_count: formData.items_count + 1})}
                                className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Internal Notes</label>
                        <input 
                            type="text" 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-primary/30 transition-all font-bold text-sm"
                            placeholder="Special requirements..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pickup Address (Optional)</label>
                    <textarea 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-primary/30 transition-all font-bold text-sm h-32 resize-none"
                        placeholder="Street, Building, Flat number..."
                    />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-6 bg-primary text-black font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 active:scale-[0.98] group"
                >
                  {isSubmitting ? (
                    <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-black rounded-full"></div>
                  ) : (
                    <>
                      Execute Protocol
                      <span className="material-symbols-outlined font-black group-hover:translate-x-1 transition-transform">bolt</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-[#121212] rounded-[3rem] border border-white/5 p-16 text-center shadow-2xl animate-in zoom-in duration-700">
            <div className="w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-500/20">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">Protocol Active</h2>
            <p className="text-slate-500 font-bold mb-12">Verification Code: <span className="text-primary font-mono">{createdOrder.order_id}</span></p>

            <div ref={qrRef} className="bg-white p-8 rounded-[3rem] inline-block mb-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 scale-110">
              <QRCodeCanvas 
                value={`${window.location.origin}/order/${createdOrder.order_id}`} 
                size={240}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto mb-16">
              <button 
                onClick={downloadQR}
                className="flex items-center justify-center gap-3 py-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-black text-sm"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Save ID
              </button>
              <button 
                className="flex items-center justify-center gap-3 py-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-black text-sm"
              >
                <span className="material-symbols-outlined text-lg">ios_share</span>
                Share
              </button>
            </div>

            <button 
              onClick={() => navigate('/admin')}
              className="px-10 py-4 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all hover:bg-white/10"
            >
              Return to Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
