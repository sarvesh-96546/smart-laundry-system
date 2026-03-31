import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

export default function InvoiceModal({ isOpen, onClose, order }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !order) return null;

  const handleDownload = () => {
    setDownloading(true);
    const element = document.getElementById('printable-invoice');
    const opt = {
      margin:       0.5,
      filename:     `Invoice-${order.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save().then(() => setDownloading(false));
  };

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="bg-white text-black w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl print:shadow-none print:rounded-none">
        
        {/* Header - Non-Printable */}
        <div className="bg-[#111] p-6 flex justify-between items-center print:hidden">
            <h2 className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8ff5ff]">receipt_long</span>
                Invoice Preview
            </h2>
            <div className="flex gap-2">
                <button onClick={handleDownload} disabled={downloading} className={`px-4 py-2 text-black font-bold rounded-xl text-xs flex items-center gap-2 transition-all ${downloading ? 'bg-slate-400 opacity-70' : 'bg-[#8ff5ff] hover:bg-[#6edbe6]'}`}>
                    <span className="material-symbols-outlined text-sm">
                        {downloading ? 'hourglass_empty' : 'download'}
                    </span>
                    {downloading ? 'Processing PDF...' : 'Download PDF'}
                </button>
                <button onClick={onClose} className="w-10 h-10 bg-white/5 text-white rounded-full flex items-center justify-center hover:bg-white/10">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>

        {/* Invoice Content */}
        <div className="p-12 print:p-8" id="printable-invoice">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Pristine Flow</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Smart Laundry Management Systems</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Invoice ID</p>
                    <p className="font-mono font-bold">INV-{order.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12 pb-12 border-b border-slate-100">
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Bill To</p>
                    <h3 className="text-xl font-bold mb-1">{order.customer_name}</h3>
                    <p className="text-sm text-slate-500">{order.phone}</p>
                    <p className="text-sm text-slate-500 mt-2 max-w-[200px]">{order.address || "Counter Pickup"}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Protocol Details</p>
                    <div className="space-y-1">
                        <p className="text-sm font-bold">Status: <span className="text-blue-500">{order.status}</span></p>
                        <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                        <p className="text-sm text-slate-500">Payment: {order.payment_status}</p>
                    </div>
                </div>
            </div>

            <table className="w-full mb-12">
                <thead>
                    <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b-2 border-slate-50">
                        <th className="py-4 text-left">Service Node</th>
                        <th className="py-4 text-center">Qty</th>
                        <th className="py-4 text-right">Price</th>
                        <th className="py-4 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    <tr>
                        <td className="py-6">
                            <p className="font-bold text-sm">{order.service_type || "Standard Wash & Fold"}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Laundry Protocol Entry</p>
                        </td>
                        <td className="py-6 text-center text-sm">{order.items_count}</td>
                        <td className="py-6 text-right text-sm">₹{Math.round(order.amount / order.items_count)}</td>
                        <td className="py-6 text-right font-bold text-sm">₹{order.amount}</td>
                    </tr>
                </tbody>
            </table>

            <div className="flex justify-end pr-0">
                <div className="w-full max-w-[240px] space-y-4">
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span>₹{order.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Tax (0%)</span>
                        <span>₹0</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t-2 border-black">
                        <span className="font-black uppercase tracking-widest text-xs">Total Impact</span>
                        <span className="text-xl font-black">₹{order.amount}</span>
                    </div>
                </div>
            </div>

            <div className="mt-20 pt-12 border-t border-slate-50 text-center">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">Thank you for using Pristine Flow Systems</p>
            </div>
        </div>
      </div>
      
      {/* Styles for Printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
