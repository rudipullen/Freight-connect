
import React, { useState } from 'react';
import { Truck, ShieldCheck, Users, Lock, Mail, ArrowRight, Loader2, Globe } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('shipper');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onLogin(role, email);
    setIsLoading(false);
  };

  const roleConfig = {
    shipper: {
      title: "Shipper Portal",
      desc: "Move cargo with precision and cost-efficiency.",
      icon: Users,
      color: "bg-brand-500"
    },
    carrier: {
      title: "Carrier Command",
      desc: "Optimize empty legs and maximize fleet revenue.",
      icon: Truck,
      color: "bg-emerald-500"
    },
    admin: {
      title: "Mission Control",
      desc: "Platform oversight and compliance management.",
      icon: ShieldCheck,
      color: "bg-indigo-600"
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row animate-in fade-in duration-700">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden md:flex md:w-1/2 bg-brand-900 relative overflow-hidden flex-col justify-between p-16">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <Truck size={40} className="text-emerald-400" />
            <h1 className="text-3xl font-black text-white tracking-tighter">FreightConnect</h1>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Connecting Africa's <br />
            <span className="text-emerald-400">Logistics DNA.</span>
          </h2>
          <p className="text-brand-200 text-lg max-w-md font-medium leading-relaxed">
            The next-generation marketplace for carriers and shippers to eliminate empty miles and build a sustainable supply chain.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
           <div className="space-y-1">
              <p className="text-2xl font-black text-white">45k+</p>
              <p className="text-xs font-bold text-brand-300 uppercase tracking-widest">Verified Trucks</p>
           </div>
           <div className="w-px h-12 bg-white/10"></div>
           <div className="space-y-1">
              <p className="text-2xl font-black text-white">R 120M+</p>
              <p className="text-xs font-bold text-brand-300 uppercase tracking-widest">Transacted</p>
           </div>
        </div>

        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <Globe size={800} className="absolute -right-1/4 -top-1/4" />
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-24 bg-slate-50 md:bg-white">
        <div className="w-full max-w-md space-y-10">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <Truck size={32} className="text-brand-900" />
            <h1 className="text-2xl font-black text-brand-900 tracking-tighter">FreightConnect</h1>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Welcome Back</h3>
            <p className="text-slate-500 font-medium">Please select your role and enter your credentials.</p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
             {(['shipper', 'carrier', 'admin'] as UserRole[]).map(r => (
               <button 
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === r ? 'bg-white text-brand-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {r}
               </button>
             ))}
          </div>

          {/* Persona Card */}
          <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-2">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${roleConfig[role].color}`}>
                {React.createElement(roleConfig[role].icon, { size: 24 })}
             </div>
             <div>
                <p className="font-black text-slate-800">{roleConfig[role].title}</p>
                <p className="text-xs text-slate-500 font-medium">{roleConfig[role].desc}</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required 
                    placeholder="name@company.co.za"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-900 focus:ring-brand-500" />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
               </label>
               <button type="button" className="text-xs font-black text-brand-600 hover:underline">Forgot Password?</button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-brand-900 text-white rounded-3xl font-black text-lg hover:bg-brand-800 shadow-2xl shadow-brand-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Login to Dashboard <ArrowRight size={20}/></>}
            </button>
          </form>

          <div className="text-center pt-8 border-t border-slate-100">
             <p className="text-xs text-slate-500 font-medium">
               New to the platform? <button type="button" className="text-brand-600 font-black hover:underline">Apply for Partnership</button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
