import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function CustomerHome() {
  const { stats, orders, machines, prices } = useApp();
  const [counts, setCounts] = React.useState({ orders: 0, machines: 0, customers: 0, delivery: 0 });
  const [trackInput, setTrackInput] = React.useState('');
  const [isTracking, setIsTracking] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCounts({
        orders: stats.total_orders || 124,
        machines: machines.length || 12,
        customers: stats.total_orders ? Math.floor(stats.total_orders * 0.8) : 850,
        delivery: 24
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [stats, machines]);

  const handleTrack = async () => {
    if (!trackInput.trim()) {
      toast.error('Please enter an Order ID or Phone Number');
      return;
    }

    setIsTracking(true);
    const input = trackInput.trim();

    try {
      // Check if it looks like an Order ID
      if (input.toUpperCase().startsWith('LD-')) {
        navigate(`/order/${input.toUpperCase()}`);
      } 
      // Check if it looks like a phone number (10 digits)
      else if (/^\d{10}$/.test(input)) {
        const res = await fetch(`${useApp().API_BASE_URL}/api/orders/phone/${input}`);
        const data = await res.json();
        if (data.order_id) {
          navigate(`/order/${data.order_id}`);
        } else {
          toast.error(data.error || 'No active orders found for this identifier');
        }
      } else {
        toast.error('Invalid format. Use LD-XXXXX or 10-digit Phone Number');
      }
    } catch (err) {
      toast.error('Connection failure while verifying protocol');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#080808] text-white font-['Plus_Jakarta_Sans'] overflow-x-hidden selection:bg-[#8ff5ff] selection:text-black">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8ff5ff]/5 blur-[120px] rounded-full animate-float"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3b82f6]/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-[#080808]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8ff5ff] to-[#3b82f6] rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <span className="material-symbols-outlined text-black font-bold">water_drop</span>
              </div>
              <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">PRISTINE FLOW</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
              <Link to="/pricing" className="text-slate-400 hover:text-[#8ff5ff] transition-colors relative group">
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8ff5ff] transition-all group-hover:w-full"></span>
              </Link>
              <a href="#activity" className="text-slate-400 hover:text-[#8ff5ff] transition-colors relative group">
                Live Feed
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8ff5ff] transition-all group-hover:w-full"></span>
              </a>
              <Link to="/login" className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-white hover:bg-[#8ff5ff] hover:text-black hover:border-[#8ff5ff] transition-all duration-300">Staff Portal</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8ff5ff]/10 border border-[#8ff5ff]/20 text-[#8ff5ff] text-xs font-bold mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8ff5ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8ff5ff]"></span>
              </span>
              SYSTEM ONLINE • PORTAL V4.2
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 fade-in">
              Next-Gen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ff5ff] via-[#3b82f6] to-[#8ff5ff] bg-[length:200%_auto] animate-gradient">
                Fabric Care
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl fade-in" style={{ animationDelay: '0.2s' }}>
              Where molecular science meets luxury garment maintenance. Interactive, real-time tracking for the modern wardrobe.
            </p>
            <div className="flex flex-wrap gap-4 fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/admin/new-order" className="group relative bg-[#8ff5ff] text-black px-8 py-4 rounded-2xl font-black text-lg button-glow overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Create New Order
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
              <button onClick={() => document.getElementById('tracking-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-2xl font-black text-lg border border-white/10 hover:bg-white/5 transition-all backdrop-blur-sm flex items-center gap-2">
                <span className="material-symbols-outlined">analytics</span>
                Track Order
              </button>
            </div>
          </div>
        </section>

        {/* Live System Stats */}
        <section className="py-12 px-6 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Orders Today', value: counts.orders, icon: 'receipt_long', color: '#8ff5ff' },
            { label: 'Active Machines', value: counts.machines, icon: 'settings_backup_restore', color: '#3b82f6' },
            { label: 'Customers Served', value: counts.customers, icon: 'groups', color: '#8ff5ff' },
            { label: 'Avg Delivery (h)', value: counts.delivery, icon: 'speed', color: '#3b82f6' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#121212] p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
              <span className="material-symbols-outlined mb-4 block group-hover:scale-110 transition-transform" style={{ color: stat.color }}>{stat.icon}</span>
              <div className="text-4xl font-black tracking-tighter mb-1 tabular-nums">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Real-Time Order Tracker Demo */}
        <section className="py-20 px-6 max-w-7xl mx-auto" id="tracking-section">
          <div className="bg-[#121212] rounded-[3rem] p-8 md:p-12 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <div className="w-24 h-24 bg-[#8ff5ff]/5 blur-3xl rounded-full"></div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-black tracking-tighter mb-2">Live Pipeline Demo</h2>
                <p className="text-slate-500 font-bold">Experience our ultra-transparent tracking system.</p>
              </div>
              <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 bg-[#8ff5ff] rounded-full animate-pulse"></div>
                <span className="text-sm font-black tracking-widest text-[#8ff5ff] uppercase">Order #PF-9928</span>
              </div>
            </div>

            <div className="relative">
              {/* Pipeline Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                {[
                  { stage: 'Received', icon: 'inventory_2', time: '10:00 AM' },
                  { stage: 'Washing', icon: 'waves', time: '10:45 AM', active: true },
                  { stage: 'Drying', icon: 'air', time: 'Pending' },
                  { stage: 'Ironing', icon: 'iron', time: 'Pending' },
                  { stage: 'Ready', icon: 'verified', time: 'Pending' },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative z-10 group/step">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${step.active ? 'bg-[#8ff5ff] text-black shadow-[0_0_30px_rgba(143,245,255,0.4)] scale-110' : 'bg-[#1a1a1a] text-slate-600 border border-white/5'}`}>
                      <span className={`material-symbols-outlined text-2xl ${step.active ? 'animate-spin-slow' : ''}`}>{step.icon}</span>
                    </div>
                    <span className={`font-black tracking-tight mb-1 ${step.active ? 'text-[#8ff5ff]' : 'text-slate-400'}`}>{step.stage}</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">{step.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Live Activity & Service Cards */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-1 bg-[#121212] rounded-[2.5rem] border border-white/5 p-8 flex flex-col h-full" id="activity">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tighter">Live Activity</h3>
              <span className="text-[10px] font-black tracking-widest text-[#8ff5ff] uppercase bg-[#8ff5ff]/10 px-2 py-1 rounded">Real-time</span>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 max-h-[500px] scrollbar-hide">
              {(orders.length > 0 ? orders : [
                { id: '102', customer: 'Alex Rivera', service: 'Dry Clean', status: 'Washing' },
                { id: '101', customer: 'Sarah Chen', service: 'Steam Press', status: 'Ready' },
                { id: '100', customer: 'Marcus Miller', service: 'Wash & Fold', status: 'Completed' },
              ]).slice(0, 5).map((order, i) => (
                <div key={i} className="flex gap-4 group/item">
                  <div className="w-1 bg-[#8ff5ff]/20 rounded-full group-hover/item:bg-[#8ff5ff] transition-colors"></div>
                  <div>
                    <div className="text-sm font-black">{order.customer}</div>
                    <div className="text-xs text-slate-500 font-bold mb-1">{order.service} • Order #{order.id}</div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#8ff5ff]">
                      <span className="w-1 h-1 bg-[#8ff5ff] rounded-full animate-pulse"></span>
                      {order.status || 'Active'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10 transition-all">View All Events</button>
          </div>

          {/* Service Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Dry Cleaning', price: prices?.dryClean || '150', time: '24h', icon: 'dry_cleaning', desc: 'Premium chemical-free treatment for delicate fabrics.' },
              { title: 'Steam Press', price: prices?.steamPress || '50', time: '12h', icon: 'iron', desc: 'Precision industrial pressing for that perfect crisp look.' },
              { title: 'Universal Wash', price: prices?.base || '40', time: '24h', icon: 'laundry', desc: 'Deep-fiber cleaning with eco-friendly bio-detergents.' },
              { title: 'Express Protocol', price: '2x', time: '4h', icon: 'bolt', desc: 'Priority handling for mission-critical laundry needs.' },
            ].map((service, i) => (
              <div key={i} className="bg-[#121212] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#8ff5ff]/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl">{service.icon}</span>
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center border border-white/5 text-[#8ff5ff] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">{service.icon}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black tracking-tighter">₹{service.price}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Rate</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">{service.desc}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs font-black text-[#8ff5ff]">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {service.time} ETA
                    </div>
                    <Link to="/pricing" className="text-xs font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-[#8ff5ff] hover:text-black transition-all">Catalog</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mini Analytics Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8ff5ff]">bar_chart</span>
                Order Volume Trends
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chart_data?.length > 0 ? stats.chart_data : [
                    { name: 'Mon', orders: 45 },
                    { name: 'Tue', orders: 52 },
                    { name: 'Wed', orders: 48 },
                    { name: 'Thu', orders: 70 },
                    { name: 'Fri', orders: 61 },
                    { name: 'Sat', orders: 85 },
                    { name: 'Sun', orders: 92 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ color: '#8ff5ff' }}
                    />
                    <Line type="monotone" dataKey="orders" stroke="#8ff5ff" strokeWidth={3} dot={{ fill: '#8ff5ff', r: 4 }} activeDot={{ r: 6, stroke: '#080808', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3b82f6]">query_stats</span>
                Peak Usage Hours
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { time: '8AM', load: 30 },
                    { time: '10AM', load: 65 },
                    { time: '12PM', load: 85 },
                    { time: '2PM', load: 45 },
                    { time: '4PM', load: 70 },
                    { time: '6PM', load: 95 },
                    { time: '8PM', load: 50 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="time" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Bar dataKey="load" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Tracking Input */}
        <section className="py-20 px-6 max-w-7xl mx-auto" id="tracking-input">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#8ff5ff] to-[#3b82f6] rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-[#0d0d0d] p-10 md:p-20 rounded-[3rem] border border-white/5 flex flex-col items-center text-center">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Locate Your Garments</h2>
              <p className="text-slate-400 mb-10 max-w-xl font-medium">Enter your Order ID or registered Phone Number to see real-time molecular processing status.</p>
              
              <div className="w-full max-w-2xl flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                  <input 
                    type="text" 
                    placeholder="Order ID / Phone Number" 
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-16 focus:outline-none focus:border-[#8ff5ff]/50 focus:bg-white/10 transition-all font-bold text-lg"
                  />
                  <button 
                    onClick={() => toast('QR Scanner initialized... (Demo Only)', { icon: '📸' })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#8ff5ff]/20 hover:text-[#8ff5ff] transition-all"
                    title="Scan QR Code"
                  >
                    <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                  </button>
                </div>
                <button 
                  onClick={handleTrack}
                  disabled={isTracking}
                  className="bg-[#8ff5ff] text-black px-10 py-5 rounded-2xl font-black text-lg hover:shadow-[0_0_30px_rgba(143,245,255,0.4)] transition-all disabled:opacity-50"
                >
                  {isTracking ? 'Verifying...' : 'Track Now'}
                </button>
              </div>
              
              <div className="mt-8 flex gap-8">
                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                  Scan Receipt
                </div>
                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                  Help Center
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8" id="services">
          <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#8ff5ff]/20 transition-all group overflow-hidden relative">
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#8ff5ff]/5 rounded-full group-hover:scale-150 transition-transform"></div>
            <span className="material-symbols-outlined text-[#8ff5ff] text-5xl mb-6 block group-hover:scale-110 transition-transform">biotech</span>
            <h3 className="text-2xl font-black mb-4 tracking-tight">Molecular Care</h3>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">Quantum sensors detect fiber composition and soil levels to calibrate the perfect wash cycle for every garment.</p>
          </div>
          <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#8ff5ff]/20 transition-all group overflow-hidden relative">
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#3b82f6]/5 rounded-full group-hover:scale-150 transition-transform"></div>
            <span className="material-symbols-outlined text-[#8ff5ff] text-5xl mb-6 block group-hover:scale-110 transition-transform">potted_plant</span>
            <h3 className="text-2xl font-black mb-4 tracking-tight">Eco-Alchemy</h3>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">Bio-degradable components and water-recycling tech reduce our footprint while maximizing garment lifespan.</p>
          </div>
          <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#8ff5ff]/20 transition-all group overflow-hidden relative">
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#8ff5ff]/5 rounded-full group-hover:scale-150 transition-transform"></div>
            <span className="material-symbols-outlined text-[#8ff5ff] text-5xl mb-6 block group-hover:scale-110 transition-transform">schedule_send</span>
            <h3 className="text-2xl font-black mb-4 tracking-tight">Quantum Pulse</h3>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">Real-time tracking of your laundry journey from pickup to the final perfectly pressed delivery.</p>
          </div>
        </section>

        {/* Footer Polish */}
        <footer className="py-20 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8ff5ff] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-black text-sm">water_drop</span>
              </div>
              <span className="font-black tracking-tighter">PRISTINE FLOW</span>
            </div>
            <div className="flex gap-8 text-xs font-black text-slate-500 uppercase tracking-widest">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">API Docs</span>
            </div>
            <div className="text-slate-500 text-xs font-bold">
              © 2026 PRISTINE FLOW OPERATING SYSTEM. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
