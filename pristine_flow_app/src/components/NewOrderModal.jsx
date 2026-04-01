import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { QRCodeCanvas } from 'qrcode.react';

export default function NewOrderModal({ isOpen, onClose }) {
  const { createOrder, prices } = useApp();
  const [formData, setFormData] = useState({ 
    customer_name: '', 
    phone: '', 
    items_count: 1, 
    service_type: 'Wash & Fold',
    address: '',
    notes: ''
  });
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const qrRef = useRef();

  useEffect(() => {
    const rate = formData.service_type === 'Dry Clean' ? prices.dryClean : 
                 formData.service_type === 'Ironing' ? prices.ironing : 40;
    setEstimatedPrice(formData.items_count * rate);
  }, [formData.items_count, formData.service_type, prices]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createOrder({
        ...formData,
        amount: estimatedPrice
      });
      setCreatedOrder(result);
    } catch {
      alert('Sync Failure: Protocol rejected by core engine.');
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
    <div className="fixed inset-0 z-10000 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-500">
      <div className="bg-[#0f0f0f] border border-white/5 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(143,245,255,0.05)] relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:rotate-90">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        {!createdOrder ? (
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Info Panel */}
            <div className="w-full md:w-1/3 bg-[#121212] p-8 border-r border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary">add_shopping_cart</span>
                </div>
                <h2 className="text-2xl font-bold mb-3">New Protocol</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">Initialize a new service entry. All data is synchronized in real-time with the central hub.</p>
                
                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Amount</p>
                        <p className="text-2xl font-bold text-primary">₹{estimatedPrice}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Service Node</p>
                        <p className="text-sm font-bold text-white">{formData.service_type}</p>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 p-8 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Customer Name</label>
                        <input 
                            required
                            type="text" 
                            value={formData.customer_name}
                            onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/30 transition-all text-sm"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Phone Identifier</label>
                        <input 
                            required
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/30 transition-all text-sm"
                            placeholder="+91"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Service Type</label>
                        <select 
                            value={formData.service_type}
                            onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/30 transition-all text-sm appearance-none"
                        >
                            <option value="Wash & Fold">Wash & Fold</option>
                            <option value="Dry Clean">Dry Cleaning</option>
                            <option value="Ironing">Ironing Only</option>
                            <option value="Steam Press">Premium Steam</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Priority Level</label>
                        <select 
                            value={formData.priority_level || 'Standard'}
                            onChange={(e) => setFormData({...formData, priority_level: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-[#ffd700]/30 transition-all text-sm appearance-none font-bold"
                        >
                            <option value="Standard">Standard</option>
                            <option value="Express">Express (+ ₹49)</option>
                            <option value="VIP">VIP Priority (+ ₹99)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Items Count</label>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-1">
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, items_count: Math.max(1, formData.items_count - 1)})}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-slate-400"
                            >
                                <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="flex-1 text-center font-bold text-sm">{formData.items_count}</span>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, items_count: formData.items_count + 1})}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-primary"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Internal Notes</label>
                        <input 
                            type="text" 
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/30 transition-all text-sm"
                            placeholder="Special instructions..."
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Pickup Address (Optional)</label>
                    <textarea 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-primary/30 transition-all text-sm h-20 resize-none"
                        placeholder="Street, Building, Flat..."
                    />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-primary text-black font-bold rounded-3xl hover:bg-white transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-black rounded-full"></div>
                  ) : (
                    <>
                      Execute Protocol
                      <span className="material-symbols-outlined text-sm">bolt</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center animate-in zoom-in duration-700">
            <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Protocol Active</h2>
            <p className="text-slate-500 text-sm mb-10">Verification Code: <span className="text-primary font-mono font-bold">{createdOrder.order_id}</span></p>

            <div ref={qrRef} className="bg-white p-6 rounded-[2.5rem] inline-block mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 scale-110">
              <QRCodeCanvas 
                value={`${window.location.origin}/order/${createdOrder.order_id}`} 
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <button 
                onClick={downloadQR}
                className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Save ID
              </button>
              <button 
                className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm"
              >
                <span className="material-symbols-outlined text-sm">ios_share</span>
                Share
              </button>
            </div>

            <button 
              onClick={onClose}
              className="mt-12 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
            >
              Terminate Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
