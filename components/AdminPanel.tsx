
import React, { useState } from 'react';
import { 
  Shield, AlertCircle, Check, X, Save, Image as ImageIcon, FileText, 
  Paperclip, CheckCircle, BarChart3, Users, Truck, Wallet, Settings, 
  Search, Filter, ChevronRight, Activity, TrendingUp, AlertTriangle,
  ArrowUpRight, Download, Eye, Ban, ShieldCheck, Lock, Globe, Clock,
  History, Map as MapIcon, Database, Terminal, UserPlus, LogIn,
  Image, Layers, Trash2, ArrowLeftRight
} from 'lucide-react';
import { MOCK_CARRIERS } from '../constants';
import { Dispute, Booking, Listing, PlatformSettings, Transaction, AuditLogEntry, ShipperProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
  disputes: Dispute[];
  listings: Listing[];
  bookings: Booking[];
  shippers: ShipperProfile[];
  auditLogs: AuditLogEntry[];
  settings: PlatformSettings;
  onUpdateSettings: (settings: PlatformSettings) => void;
  onResolveDispute: (id: string) => void;
  onVerifyCarrier: (id: string) => void;
}

const revenueData = [
  { name: 'Mon', revenue: 4200, gmv: 42000 },
  { name: 'Tue', revenue: 3800, gmv: 38000 },
  { name: 'Wed', revenue: 5600, gmv: 56000 },
  { name: 'Thu', revenue: 7200, gmv: 72000 },
  { name: 'Fri', revenue: 4800, gmv: 48000 },
  { name: 'Sat', revenue: 2100, gmv: 21000 },
  { name: 'Sun', revenue: 1800, gmv: 18000 },
];

const AdminPanel: React.FC<Props> = ({ 
  disputes, 
  listings, 
  bookings, 
  shippers,
  auditLogs,
  settings, 
  onUpdateSettings,
  onResolveDispute, 
  onVerifyCarrier 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'carriers' | 'shippers' | 'finance' | 'disputes' | 'compliance' | 'settings' | 'logs' | 'masterdata'>('overview');
  
  const [carriersList, setCarriersList] = useState(MOCK_CARRIERS);
  const [markupInput, setMarkupInput] = useState(settings.globalMarkupPercent.toString());
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);

  const pendingCarriers = carriersList.filter(c => !c.verified);
  const activeBookingsCount = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Disputed').length;
  const escrowValue = bookings.reduce((acc, b) => b.escrowStatus === 'Secured' ? acc + b.price : acc, 0);
  const totalGMV = revenueData.reduce((acc, d) => acc + d.gmv, 0);

  const handleApproveCarrier = (id: string) => {
    setCarriersList(prev => prev.map(c => c.id === id ? { ...c, verified: true } : c));
    onVerifyCarrier(id);
  };

  const handleGodModeLogin = (user: string) => {
    alert(`God Mode Activated: Impersonating ${user}. System event logged.`);
  };

  const KpiCard = ({ title, value, sub, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:scale-[1.02] transition-all">
      <div className={`w-16 h-16 rounded-3xl ${color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:rotate-6 transition-transform`}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{title}</p>
        <h4 className="text-3xl font-black text-slate-800">{value}</h4>
        {sub && (
          <p className={`text-[11px] font-black flex items-center gap-1 mt-1 ${trend === 'up' ? 'text-emerald-500' : 'text-amber-500'}`}>
            <TrendingUp size={14} className={trend === 'up' ? '' : 'rotate-180'}/> {sub}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)] animate-in fade-in duration-500">
      
      {/* INTERNAL MISSION CONTROL NAVIGATION */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 sticky top-8 overflow-hidden">
           <div className="p-8 bg-brand-900 text-white">
              <div className="flex items-center gap-3 mb-2">
                 <Terminal size={24} className="text-emerald-400" />
                 <h2 className="font-black text-2xl tracking-tighter">Mission Control</h2>
              </div>
              <p className="text-[10px] text-brand-300 font-black uppercase tracking-widest opacity-70">Super Admin Access</p>
           </div>
           <nav className="p-4 space-y-1">
              {[
                { id: 'overview', icon: BarChart3, label: 'Overview' },
                { id: 'carriers', icon: Truck, label: 'Carrier CRM' },
                { id: 'shippers', icon: Users, label: 'Shipper CRM' },
                { id: 'compliance', icon: ShieldCheck, label: 'KYC Center', badge: pendingCarriers.length },
                { id: 'finance', icon: Wallet, label: 'Financials' },
                { id: 'disputes', icon: AlertTriangle, label: 'Dispute Judge' },
                { id: 'masterdata', icon: Database, label: 'Master Data' },
                { id: 'logs', icon: History, label: 'Audit Logs' },
                { id: 'settings', icon: Settings, label: 'System Config' }
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id as any)} 
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === item.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <item.icon size={20}/> {item.label}
                  {item.badge ? <span className="ml-auto bg-amber-400 text-slate-900 px-2 py-0.5 rounded-lg text-[10px] animate-pulse">{item.badge}</span> : null}
                </button>
              ))}
           </nav>
           <div className="p-6 border-t border-slate-50 bg-slate-50/30">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">PLATFORM HEALTH</p>
              <div className="space-y-3">
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[98.8%]"></div>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                    <span>API Uptime</span>
                    <span className="text-emerald-500">99.8%</span>
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* MISSION CONTROL CONTENT */}
      <main className="flex-1 min-w-0 pb-20">
        
        {/* OVERVIEW MODULE: THE PULSE */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KpiCard title="GMV (MTD)" value={`R ${totalGMV.toLocaleString()}`} icon={ArrowUpRight} color="bg-brand-900" sub="+12% vs LY" trend="up"/>
                <KpiCard title="Net Revenue" value="R 42,450" icon={TrendingUp} color="bg-emerald-500" sub="Margin 15.2%" trend="up"/>
                <KpiCard title="Escrow Float" value={`R ${escrowValue.toLocaleString()}`} icon={Lock} color="bg-indigo-600" sub="34.2% Bookings" trend="up"/>
                <KpiCard title="Active Disputes" value={disputes.filter(d => d.status !== 'Resolved').length} icon={AlertCircle} color="bg-rose-500" sub="Red Flag Metric" trend="down"/>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                   <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="font-black text-2xl text-slate-800 tracking-tight">Marketplace Throughput</h3>
                        <p className="text-sm text-slate-400 font-medium">Daily GMV vs Commission realized</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-50 text-slate-500 text-xs font-black rounded-xl">GMV</button>
                        <button className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/10">Commission</button>
                      </div>
                   </div>
                   <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={revenueData}>
                            <defs>
                               <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'black'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'black'}} />
                            <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 'black'}} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                      <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                         <Activity size={18} className="text-blue-500" />
                         Real-time War Room
                      </h4>
                      <div className="space-y-6">
                         {[1, 2, 3].map((i) => (
                           <div key={i} className="flex gap-4 relative group cursor-pointer">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:bg-brand-900 group-hover:text-white transition-all">
                                <Truck size={24} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800">ZN 44 GP In-Transit</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Load: Bulk Grain • Late 40m</p>
                             </div>
                             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-2"></div>
                           </div>
                         ))}
                      </div>
                      <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-xl shadow-brand-900/20">Open Live Operations Map</button>
                   </div>
                   
                   <div className="bg-gradient-to-br from-indigo-600 to-brand-900 rounded-[40px] p-8 text-white">
                      <h4 className="font-black text-sm mb-4">Carrier Health Check</h4>
                      <div className="flex items-end gap-2 mb-6">
                         <span className="text-4xl font-black">94%</span>
                         <span className="text-indigo-300 font-bold mb-1">Utilization</span>
                      </div>
                      <p className="text-xs text-indigo-100/70 leading-relaxed font-medium mb-6">Empty-leg fill rate has increased by 14% since the last markup reduction promo.</p>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full">View Fleet Analytics <ChevronRight size={14}/></button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* CARRIER CRM: GOD MODE ENABLED */}
        {activeTab === 'carriers' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                      <h3 className="font-black text-2xl text-slate-800 tracking-tight">Carrier Ecosystem</h3>
                      <p className="text-sm text-slate-400 font-medium">Manage and monitor verified truck providers.</p>
                   </div>
                   <div className="flex gap-3 w-full md:w-auto">
                      <div className="relative flex-1">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                         <input type="text" placeholder="Search carrier ID, reg, name..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all shadow-sm"><Filter size={20}/></button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead>
                         <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                            <th className="px-8 py-5">Carrier Manifest</th>
                            <th className="px-8 py-5">Verification</th>
                            <th className="px-8 py-5">Rating/Risk</th>
                            <th className="px-8 py-5">Platform GMV</th>
                            <th className="px-8 py-5 text-right">God Mode</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {carriersList.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-brand-900 text-emerald-400 flex items-center justify-center font-black text-lg">{c.companyName[0]}</div>
                                     <div>
                                        <p className="font-black text-slate-800">{c.companyName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Reg: {c.regNumber}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${c.verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                     <div className={`w-1.5 h-1.5 rounded-full ${c.verified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                     {c.verified ? 'VERIFIED' : 'PENDING KYC'}
                                  </span>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-1">
                                     {[1,2,3,4,5].map(s => <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= Math.floor(c.rating) ? 'bg-amber-400' : 'bg-slate-100'}`}></div>)}
                                     <span className="text-[10px] font-black text-slate-500 ml-2">{c.rating}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6 font-black text-slate-800">R 245,000</td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                     <button onClick={() => handleGodModeLogin(c.companyName)} className="p-2.5 text-brand-500 hover:bg-brand-50 rounded-xl transition-all" title="Login as Carrier"><LogIn size={20}/></button>
                                     <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><Eye size={20}/></button>
                                     <button className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Ban size={20}/></button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* DISPUTE JUDGE: THE "COURTROOM" */}
        {activeTab === 'disputes' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div>
                  <h3 className="font-black text-3xl text-slate-800 tracking-tight">Dispute Resolution</h3>
                  <p className="text-sm text-slate-400 font-medium">Verify evidence and finalize funds distribution.</p>
                </div>
                <div className="flex gap-2">
                   <span className="px-5 py-2 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-rose-100 flex items-center gap-2">
                      <AlertTriangle size={16}/> 1 CRITICAL DISPUTE
                   </span>
                </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                   {disputes.map(dispute => (
                      <div key={dispute.id} className={`bg-white rounded-[40px] border transition-all p-10 shadow-sm overflow-hidden relative ${activeDisputeId === dispute.id ? 'border-rose-500 ring-4 ring-rose-500/5' : 'border-slate-100'}`}>
                         <div className="flex justify-between items-start mb-8">
                            <div className="space-y-2">
                               <div className="flex items-center gap-3">
                                  <h4 className="text-2xl font-black text-slate-800 tracking-tight">Dispute {dispute.id}</h4>
                                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">In Review</span>
                               </div>
                               <p className="text-sm text-slate-500 font-medium">Raised on: <span className="font-bold text-slate-700">{new Date(dispute.createdAt).toLocaleDateString()}</span></p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Escrowed Value</p>
                               <p className="text-2xl font-black text-emerald-600">R 8,500.00</p>
                            </div>
                         </div>

                         <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 mb-8">
                            <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <AlertCircle size={14}/> Shipper Claim
                            </h5>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{dispute.reason}"</p>
                         </div>

                         <div className="grid grid-cols-2 gap-8 mb-10">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pickup Evidence (Carrier)</p>
                               <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden relative group">
                                  <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button className="p-3 bg-white rounded-full text-slate-900 shadow-xl"><Eye size={20}/></button>
                                  </div>
                               </div>
                               <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase text-center">Timestamp: 2024-05-28 09:12</p>
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Delivery Evidence (Shipper)</p>
                               <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden relative group">
                                  <img src={dispute.evidence[0]?.fileUrl} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button className="p-3 bg-white rounded-full text-slate-900 shadow-xl"><Eye size={20}/></button>
                                  </div>
                               </div>
                               <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase text-center">Timestamp: 2024-05-28 17:45</p>
                            </div>
                         </div>

                         <div className="flex gap-4 border-t border-slate-50 pt-10">
                            <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200">Reject Claim</button>
                            <button className="flex-1 py-4 bg-brand-900 text-white rounded-2xl font-black transition-all hover:bg-brand-800 shadow-xl shadow-brand-900/20">Refund Shipper (Partial)</button>
                            <button onClick={() => onResolveDispute(dispute.id)} className="flex-[1.5] py-4 bg-emerald-500 text-white rounded-2xl font-black transition-all hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95">Verify & Release to Carrier</button>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="space-y-6">
                   <div className="bg-slate-900 rounded-[40px] p-8 text-white">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-6">Dispute Intelligence</h4>
                      <div className="space-y-6">
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-xs font-bold opacity-60">Avg. Resolution Time</span>
                            <span className="font-black text-emerald-400">4.2 Hours</span>
                         </div>
                         <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-xs font-bold opacity-60">Dispute Rate (Carrier)</span>
                            <span className="font-black text-rose-400">0.8%</span>
                         </div>
                         <div className="flex justify-between items-center pb-4">
                            <span className="text-xs font-bold opacity-60">Refund Ratio</span>
                            <span className="font-black text-emerald-400">12%</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Internal Notes</h4>
                      <textarea placeholder="Add private judge notes for this case..." className="w-full h-40 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none resize-none"></textarea>
                      <button className="w-full mt-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-200">Save Internal Log</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* AUDIT LOGS: SYSTEM TRANSPARENCY */}
        {activeTab === 'logs' && (
          <div className="animate-in slide-in-from-right-4 duration-500">
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                   <div>
                      <h3 className="font-black text-2xl text-slate-800 tracking-tight">System Transparency</h3>
                      <p className="text-sm text-slate-400 font-medium">Audit trail for all administrative and automated actions.</p>
                   </div>
                   <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-brand-900/10 active:scale-95 transition-all flex items-center gap-2"><Download size={16}/> Export Logs</button>
                </div>
                <div className="divide-y divide-slate-50">
                   {auditLogs.map(log => (
                      <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${log.adminName === 'System' ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>
                               {log.adminName[0]}
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-800">{log.action}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">Target: {log.targetType} ({log.targetId}) • By {log.adminName}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            <p className="text-[9px] text-slate-300 font-bold">{new Date(log.timestamp).toLocaleDateString()}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* SHIPPER CRM */}
        {activeTab === 'shippers' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                      <h3 className="font-black text-2xl text-slate-800 tracking-tight">Shipper Management</h3>
                      <p className="text-sm text-slate-400 font-medium">Monitor shipper spend, reliability, and disputes.</p>
                   </div>
                   <div className="flex gap-3">
                      <button className="px-6 py-3 bg-brand-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-900/20 active:scale-95 transition-all flex items-center gap-2"><UserPlus size={18}/> Manual Onboard</button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead>
                         <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Company Info</th>
                            <th className="px-8 py-5">Active Loads</th>
                            <th className="px-8 py-5">LTV (Spend)</th>
                            <th className="px-8 py-5">Dispute Rate</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {shippers.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-brand-900">{s.companyName[0]}</div>
                                     <div>
                                        <p className="font-black text-slate-800">{s.companyName}</p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{s.status}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6 font-bold text-slate-600">{s.activeBookings} Loads</td>
                               <td className="px-8 py-6 font-black text-slate-800">R {s.totalSpend.toLocaleString()}</td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${s.disputeRate > 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${s.disputeRate}%`}}></div>
                                     </div>
                                     <span className="text-[10px] font-black text-slate-500">{s.disputeRate}%</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                     <button onClick={() => handleGodModeLogin(s.companyName)} className="p-2 text-brand-500 hover:bg-brand-50 rounded-xl transition-all"><LogIn size={18}/></button>
                                     <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Ban size={18}/></button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* MASTER DATA MODULE */}
        {activeTab === 'masterdata' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 max-w-4xl">
             <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                <h3 className="font-black text-3xl text-slate-800 tracking-tight mb-10">Platform Master Data</h3>
                
                <div className="space-y-12">
                   <section className="space-y-6">
                      <div className="flex justify-between items-center">
                         <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 flex items-center gap-2"><Truck size={14}/> Vehicle Configurations</h4>
                         <button className="text-xs font-black text-brand-600 hover:underline">+ New Vehicle Type</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {['Flatbed', 'Tautliner', 'Rigid', 'Refrigerated', 'Superlink', 'Pantech'].map(v => (
                            <div key={v} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                               <span className="text-sm font-bold text-slate-700">{v}</span>
                               <button className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                            </div>
                         ))}
                      </div>
                   </section>

                   <section className="space-y-6 border-t pt-10">
                      <div className="flex justify-between items-center">
                         <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 flex items-center gap-2"><MapIcon size={14}/> Hubs & Major Depots</h4>
                         <button className="text-xs font-black text-brand-600 hover:underline">+ Add Hub</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {['City Deep', 'Elandsfontein', 'Durban Hub', 'Paarl Industrial', 'Bloemfontein Depot'].map(h => (
                            <div key={h} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                               <span className="text-sm font-bold text-slate-700">{h}</span>
                               <button className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                            </div>
                         ))}
                      </div>
                   </section>

                   <section className="space-y-6 border-t pt-10">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 flex items-center gap-2"><Layers size={14}/> Cargo Classes</h4>
                      <div className="flex flex-wrap gap-3">
                         {['General', 'Cold Chain', 'Hazmat 3', 'Hazmat 8', 'FMCG', 'Bulk Agriculture', 'Heavy Machinery'].map(c => (
                            <span key={c} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold">{c}</span>
                         ))}
                      </div>
                   </section>
                </div>
             </div>
          </div>
        )}

        {/* SYSTEM CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm animate-in slide-in-from-right-4 duration-500 max-w-4xl">
             <h3 className="font-black text-3xl text-slate-800 tracking-tight mb-10">System Configuration</h3>
             
             <div className="space-y-12">
                <section className="space-y-6">
                   <h4 className="text-xs font-black uppercase tracking-widest text-brand-500">Global Financial Logic</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                         <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Default Markup (%)</label>
                         <div className="flex gap-4">
                            <input 
                               type="number" 
                               value={markupInput} 
                               onChange={(e) => setMarkupInput(e.target.value)}
                               className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-2xl font-black text-brand-900 outline-none"
                            />
                         </div>
                      </div>
                      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                         <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Auto-Release POD Window</label>
                         <select className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-black text-brand-900 outline-none">
                            <option>24 Hours</option>
                            <option>48 Hours</option>
                            <option>72 Hours</option>
                            <option>Manual Release Only</option>
                         </select>
                      </div>
                   </div>
                </section>

                <section className="space-y-6 border-t pt-10">
                   <h4 className="text-xs font-black uppercase tracking-widest text-brand-500">Security Policies</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                         <div>
                            <p className="font-black text-slate-800">Delivery OTP Verification</p>
                            <p className="text-xs text-slate-400 font-medium">Require receiver to provide OTP to driver on delivery.</p>
                         </div>
                         <button className={`w-14 h-8 rounded-full relative transition-all ${settings.otpRequiredOnDelivery ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${settings.otpRequiredOnDelivery ? 'right-1' : 'left-1'}`}></div>
                         </button>
                      </div>
                      <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                         <div>
                            <p className="font-black text-slate-800">Backhaul Alerts</p>
                            <p className="text-xs text-slate-400 font-medium">Suggest return trips to carriers after successful booking.</p>
                         </div>
                         <button className="w-14 h-8 bg-emerald-500 rounded-full relative">
                            <div className="w-6 h-6 bg-white rounded-full absolute right-1 top-1"></div>
                         </button>
                      </div>
                   </div>
                </section>

                <button className="w-full py-5 bg-brand-900 text-white rounded-3xl font-black text-lg shadow-xl shadow-brand-900/20 active:scale-95 transition-all">Save Global System State</button>
             </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminPanel;
