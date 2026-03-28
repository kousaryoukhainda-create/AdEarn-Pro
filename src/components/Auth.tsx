import React from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ShieldCheck, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {}

export default function Auth({}: AuthProps) {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-10 md:p-12">
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(217,119,6,0.3)] mb-8">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black gold-text uppercase tracking-tighter mb-2">AdEarn Pro</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Premium Earning Platform</p>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Welcome Back</h2>
              <p className="text-gray-500 text-sm font-medium">Sign in with your Google account to access your dashboard and start earning.</p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full group relative flex items-center justify-center gap-4 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-100 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="pt-8 border-t border-dark-border">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-white font-black text-lg">100%</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Secure</p>
                </div>
                <div className="text-center border-x border-dark-border">
                  <p className="text-white font-black text-lg">Fast</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Payouts</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-lg">24/7</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
          &copy; 2026 AdEarn Pro &bull; Enterprise Grade Security
        </p>
      </motion.div>
    </div>
  );
}
