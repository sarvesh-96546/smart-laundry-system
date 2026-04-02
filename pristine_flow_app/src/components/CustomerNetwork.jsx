import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { Link } from 'react-router-dom';

export default function CustomerNetwork() {
  const { customers, deleteCustomer } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = customers.filter(c => c.status === 'Active').length;

  return (
    <>
      {/* SideNavBar */}
      <nav className="fixed left-0 top-0 h-full flex flex-col py-8 z-40 bg-neutral-950 w-24 border-r border-white/5">
        <div className="flex flex-col items-center mb-12">
          <span className="text-xl font-bold text-cyan-400 font-headline tracking-tighter">PF</span>
          <span className="font-plus-jakarta text-[0.6rem] uppercase tracking-[0.05em] text-neutral-500 mt-1">Flow</span>
        </div>
        <div className="flex flex-col gap-2 flex-1 text-neutral-500">
          <Link to="/admin" className="flex flex-col items-center justify-center py-4 hover:bg-neutral-900 hover:text-cyan-300 transition-colors group">
            <span className="material-symbols-outlined mb-1 group-hover:scale-110 transition-transform">grid_view</span>
            <span className="text-[0.65rem] uppercase tracking-[0.05em]">Dash</span>
          </Link>
          <Link to="/customers" className="flex flex-col items-center justify-center bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-400 py-4">
            <span className="material-symbols-outlined mb-1">group</span>
            <span className="text-[0.65rem] uppercase tracking-[0.05em]">Users</span>
          </Link>
          <Link to="/pricing" className="flex flex-col items-center justify-center py-4 hover:bg-neutral-900 hover:text-cyan-300 transition-colors group">
            <span className="material-symbols-outlined mb-1 group-hover:scale-110 transition-transform">payments</span>
            <span className="text-[0.65rem] uppercase tracking-[0.05em]">Prices</span>
          </Link>
          <Link to="/machinery" className="flex flex-col items-center justify-center py-4 hover:bg-neutral-900 hover:text-cyan-300 transition-colors group">
            <span className="material-symbols-outlined mb-1 group-hover:scale-110 transition-transform">memory</span>
            <span className="text-[0.65rem] uppercase tracking-[0.05em]">System</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-24 p-10 min-h-screen bg-background text-white animate-in fade-in duration-1000">
        {/* Header & Search */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <span className="text-cyan-400 font-bold tracking-widest uppercase text-[0.7rem] block mb-2">Member Database</span>
            <h1 className="text-4xl font-bold tracking-tight">Customer Network</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input 
                className="bg-[#1a1a1a] border-none rounded-xl py-3 pl-12 pr-6 w-80 focus:ring-1 focus:ring-cyan-500 text-sm transition-all placeholder:text-slate-600 outline-none" 
                placeholder="Filter identities..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 lg:col-span-4 bg-[#121212] p-8 rounded-4xl flex flex-col justify-between relative overflow-hidden group border border-white/5">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-all"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-400">verified_user</span>
              </div>
              <span className="text-xs font-bold text-cyan-400 px-3 py-1 bg-cyan-500/10 rounded-full">REAL-TIME</span>
            </div>
            <div className="mt-8 relative z-10">
              <span className="text-6xl font-bold tracking-tighter leading-none">{activeCount}</span>
              <p className="text-slate-400 font-medium mt-2 uppercase tracking-widest text-[0.7rem]">Active Subscriptions</p>
            </div>
          </div>
        </div>

        {/* List */}
        <section className="bg-[#121212] rounded-4xl overflow-hidden border border-white/5">
          <div className="p-8 flex justify-between items-center border-b border-white/5">
            <h2 className="text-xl font-bold">Member Directory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr>
                  <th className="px-8 py-6">Customer Identity</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Orders</th>
                  <th className="px-8 py-6">Total Spent</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {filteredCustomers.map(customer => (
                  <tr key={customer.phone} className="group hover:bg-white/2 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{customer.name}</div>
                          <div className="text-[0.7rem] text-slate-500 tracking-wider font-mono">{customer.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider rounded-full border ${
                        customer.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-medium text-sm">{customer.orders} Units</td>
                    <td className="px-8 py-6 font-bold text-primary">{customer.spent}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                          History
                        </button>
                        <button 
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete_forever</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
