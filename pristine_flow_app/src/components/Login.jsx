import React, { useState } from 'react';
import { authClient } from '../lib/auth-client';

export default function Login() {
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin,
      });
    } catch (error) {
      setError(error.message || 'Google authentication failed');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background text-white font-['Plus_Jakarta_Sans'] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle, Static Background Accents */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-[440px] relative z-10 animate-in fade-in duration-700">
          
          {/* Brand Section */}
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="w-16 h-16 bg-[#1a1a1a] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <span className="material-symbols-outlined text-primary text-3xl">water_drop</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Pristine Flow</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">System Authentication Interface</p>
          </div>

          {/* Authentication Card */}
          <div className="bg-[#121212] border border-white/10 rounded-[32px] p-10 md:p-12 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"></div>
            
            {error && <div className="text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/20 p-3 rounded-xl mb-8">{error}</div>}

            <h2 className="text-xl font-bold mb-4 tracking-tight">Identity Verification</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-10">
              Access to the command hub is restricted. Please authenticate using your corporate Google identity to continue.
            </p>

            <button 
                onClick={handleGoogleLogin}
                type="button" 
                className="w-full h-16 bg-white hover:bg-slate-100 text-black font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-base">Continue with Google</span>
            </button>

            <div className="mt-10 pt-8 border-t border-white/5">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Unauthorized access is logged and prosecuted
                </p>
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-10 flex justify-center h-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold uppercase tracking-[2px] text-slate-500">Node: 0x8892-ALPHA</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
