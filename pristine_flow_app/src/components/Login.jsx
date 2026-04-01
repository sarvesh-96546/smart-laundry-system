import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { authClient } from '../lib/auth-client';

export default function Login() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const data = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/'
      });
    } catch (error) {
      setError(error.message || 'Google authentication failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } else {
      setError('Invalid system credentials or network error');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#080808] text-white font-['Plus_Jakarta_Sans'] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8ff5ff]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3b82f6]/5 rounded-full blur-[120px]"></div>

        <div className="w-full max-w-[440px] relative z-10 animate-fade-in">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-[#1a1a1a] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative group">
              <div className="absolute inset-0 bg-[#8ff5ff]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="material-symbols-outlined text-[#8ff5ff] text-3xl relative z-10">water_drop</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Pristine Flow</h1>
            <p className="text-slate-400">System Authentication Interface</p>
          </div>

          {/* Login Card */}
          <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8ff5ff]/50 to-transparent"></div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <div className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Access Protocol</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-[#8ff5ff] transition-colors">alternate_email</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#8ff5ff]/50 focus:ring-1 focus:ring-[#8ff5ff]/50 transition-all"
                    placeholder="Enter system bypass ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Security Key</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl group-focus-within:text-[#8ff5ff] transition-colors">lock</span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#8ff5ff]/50 focus:ring-1 focus:ring-[#8ff5ff]/50 transition-all font-mono"
                    placeholder="••••••••••••"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </button>
                </div>
                <div className="flex justify-end mt-3">
                  <a href="#" className="text-xs text-slate-400 hover:text-[#8ff5ff] transition-colors">Reset Access?</a>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-[#8ff5ff] hover:bg-[#6fe7f4] text-[#080808] font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(143,245,255,0.3)] active:scale-[0.98] flex items-center justify-center gap-2">
                  Initiate Uplink
                  <span className="material-symbols-outlined text-xl">login</span>
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#121212] text-slate-500">Or bypass via</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                type="button" 
                className="mt-6 w-full bg-white hover:bg-slate-100 text-black font-semibold py-4 rounded-2xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Continue with Google Node
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-slate-500">
                Unauthorized access is logged. <a href="#" className="text-[#8ff5ff] hover:underline font-medium">Request ID</a>
              </p>
            </div>
          </div>

          {/* Footer Status */}
          <div className="mt-10 flex items-center justify-between text-[10px] uppercase tracking-[2px] text-slate-600 font-bold px-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#8ff5ff] rounded-full animate-pulse"></div>
              Node: 0x8892-ALPHA
            </div>
            <div>Auth V4.2.0-SECURE</div>
          </div>
        </div>
      </div>
    </>
  );
}
