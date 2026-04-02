import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function AdminDashboard() {
  const { user, orders, stats, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const filteredOrders = orders?.filter(order => {
    if (!order) return false;
    const matchesSearch = (order.customer?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (order.id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || 0;
    const bVal = b[sortConfig.key] || 0;
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }) || [];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const COLORS = ['#8ff5ff', '#ff8f8f', '#8fff9f', '#f5ff8f'];

  return (
    <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] animate-in fade-in duration-1000">
      {/* Side Nav */}
      <aside className="fixed left-0 top-0 h-full w-24 bg-[#111] border-r border-white/5 flex flex-col items-center py-8 z-50">
        <div className="mb-10 text-primary font-bold text-xl">PF</div>
        <nav className="flex flex-col gap-6">
          <Link to="/admin" className="text-[#8ff5ff] material-symbols-outlined">dashboard</Link>
          <Link to="/machinery" className="text-slate-500 hover:text-white material-symbols-outlined">memory</Link>
          <Link to="/customers" className="text-slate-500 hover:text-white material-symbols-outlined">group</Link>
          <Link to="/pricing" className="text-slate-500 hover:text-white material-symbols-outlined">payments</Link>
          <Link to="/admin/new-order" className="text-slate-500 hover:text-white material-symbols-outlined">add_circle</Link>
        </nav>
        <button onClick={logout} className="mt-auto text-slate-500 hover:text-red-400 material-symbols-outlined">logout</button>
      </aside>

      {/* Main Content */}
      <main className="pl-24 pt-20 px-8 pb-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60">System Status: <span className="text-primary animate-pulse">Operational</span></p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/machinery"
              className="px-6 py-2.5 bg-white/5 border border-white/5 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-sm">engineering</span>
              Staff Portal
            </Link>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search protocols..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1a1a] border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50 w-64 transition-all"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/10 shrink-0">
                  <img src={user?.image || "https://ui-avatars.com/api/?name=" + (user?.name || "User") + "&background=0D8ABC&color=fff"} alt="User" />
            </div>
            <Link 
              to="/admin/new-order"
              className="px-6 py-2.5 bg-primary text-black font-bold rounded-full hover:bg-white transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/10"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Order
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold">₹{(stats?.revenue || 0).toLocaleString()}</h3>
            <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +12.5%
            </p>
          </div>
          <div className="bg-[#121212] p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">In Progress</p>
            <h3 className="text-2xl font-bold">{stats?.in_progress || 0}</h3>
            <p className="text-[10px] text-blue-400 mt-2">Active Protocols</p>
          </div>
          <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 text-primary">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ready for Pickup</p>
            <h3 className="text-2xl font-bold">{stats?.ready || 0}</h3>
            <p className="text-[10px] text-primary/60 mt-2">Completion Checkpoint</p>
          </div>
          <div className="bg-[#121212] p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold">{stats?.total_orders || 0}</h3>
            <p className="text-[10px] text-slate-500 mt-2">Lifetime Entries</p>
          </div>
          <div className="bg-[#121212] p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Delayed</p>
            <h3 className="text-2xl font-bold text-red-400">0</h3>
            <p className="text-[10px] text-red-400/60 mt-2">Requires Attention</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-[#121212] p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold">Protocol Volume</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors">Week</button>
                <button className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs">Month</button>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.chart_data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#8ff5ff' }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#8ff5ff" strokeWidth={3} dot={{ fill: '#8ff5ff', strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            <h2 className="font-bold mb-6">Distribution</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Wash & Fold', value: 45 },
                      { name: 'Dry Clean', value: 30 },
                      { name: 'Ironing', value: 15 },
                      { name: 'Steam Press', value: 10 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
               {['Wash', 'Dry', 'Iron', 'Steam'].map((label, i) => (
                 <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                   <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }}></div>
                   {label}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#121212] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <div>
               <h2 className="text-xl font-bold">Operational Pipeline</h2>
               <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Active Order Protocols</p>
            </div>
            <div className="flex gap-2">
               {['All', 'Pending', 'Processing', 'Completed', 'Delivered'].map(status => (
                 <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    statusFilter === status 
                    ? 'bg-primary text-black shadow-[0_0_15px_rgba(143,245,255,0.2)]' 
                    : 'bg-white/5 text-slate-500 hover:text-white'
                  }`}
                 >
                   {status}
                 </button>
               ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>                <tr className="text-[10px] text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="px-8 py-6 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('id')}>ID</th>
                  <th className="px-8 py-6 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('customer')}>Customer</th>
                  <th className="px-8 py-6">Priority</th>
                  <th className="px-8 py-6">Service</th>
                  <th className="px-8 py-6 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>Status</th>
                  <th className="px-8 py-6 text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('amount')}>Amount</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id} className="group hover:bg-white/2 transition-all duration-300">
                    <td className="px-8 py-6 text-sm font-mono text-primary font-bold tracking-tighter">{order.id}</td>
                    <td className="px-8 py-6">
                       <div className="font-bold text-sm">{order.customer}</div>
                       <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{order.phone}</div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                         order.priority === 'VIP' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                         order.priority === 'Express' ? 'bg-[#ff8f8f]/10 text-[#ff8f8f]' : 
                         'bg-white/5 text-slate-500'
                       }`}>
                         {order.priority || 'Standard'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-medium">{order.service}</td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1.5">
                          <span className={`w-fit px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                            order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                            order.status === 'Completed' ? 'bg-primary/10 text-primary' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${order.payment_status === 'Paid' ? 'text-green-500' : 'text-slate-600'}`}>
                             {order.payment_status === 'Paid' ? 'Paid' : 'Unpaid Protocol'}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-right font-bold text-white tracking-tighter">₹{order.amount}</td>
                    <td className="px-8 py-6 text-right">
                       <Link 
                        to={`/order/${order.id}`}
                        className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                       >
                         Manage
                       </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500 text-sm">No protocols found matching your query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
