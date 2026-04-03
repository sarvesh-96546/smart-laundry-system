import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrollToSection = (id) => {
    if (isHome) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  return (
    <nav className="fixed top-0 w-full z-100 bg-background/80 backdrop-blur-xl border-b border-white/5 font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 bg-linear-to-br from-primary to-tertiary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <span className="material-symbols-outlined text-black text-sm font-bold">water_drop</span>
          </div>
          <span className="text-lg font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-white to-white/60">PRISTINE FLOW</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/pricing" 
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors relative group"
          >
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
          
          <button 
            onClick={() => isHome ? scrollToSection('activity') : window.location.href = '/#activity'}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors relative group"
          >
            Live Feed
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </button>

          <Link 
            to="/support" 
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors relative group"
          >
            Support
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>

          {!user && (
            <Link 
              to="/login" 
              className="ml-4 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300"
            >
              Sign In
            </Link>
          )}

          {user && (
            <div className="ml-4 flex items-center gap-6 relative" ref={dropdownRef}>
               {(user.role === 'admin' || user.role === 'staff') && (
                 <Link to={user.role === 'admin' ? "/admin" : "/staff"} className="text-[10px] font-black uppercase tracking-widest text-primary/80 hover:text-primary transition-colors hidden lg:block">
                   Protocol Hub
                 </Link>
               )}
               
               <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
               >
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-white/5 flex items-center justify-center">
                    <img 
                      className="w-full h-full object-cover" 
                      src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8ff5ff&color=000&bold=true`} 
                      alt="Profile" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8ff5ff&color=000&bold=true`;
                      }}
                    />
                  </div>
                 <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-primary transition-colors">
                   {isDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                 </span>
               </button>

               {/* Profile Dropdown Menu */}
               {isDropdownOpen && (
                 <div className="absolute right-0 top-full mt-4 w-56 bg-[#0d0d0d]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/5">
                      <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Authenticated As</div>
                      <div className="text-sm font-black truncate">{user.name}</div>
                      <div className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter truncate">{user.email}</div>
                    </div>

                    <div className="p-2">
                      <Link 
                        to={user.role === 'admin' ? "/admin" : user.role === 'staff' ? "/staff" : "/"} 
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">dashboard</span>
                        {user.role === 'admin' ? 'Admin Nexus' : user.role === 'staff' ? 'Staff Node' : 'Core Nexus'}
                      </Link>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-all border-t border-white/5 mt-2"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">logout</span>
                        Sign Out
                      </button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
