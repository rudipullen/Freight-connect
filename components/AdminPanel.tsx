
import React, { useState } from 'react';
import { 
  Shield, AlertCircle, Check, X, Save, Image as ImageIcon, FileText, 
  Paperclip, CheckCircle, BarChart3, Users, Truck, Wallet, Settings, 
  Search, Filter, ChevronRight, Activity, TrendingUp, AlertTriangle,
  ArrowUpRight, Download, Eye, Ban, ShieldCheck, Lock, Globe, Clock,
  History, Map as MapIcon, Database, Terminal, UserPlus, LogIn,
  Layers, Trash2, ArrowLeftRight, MessageSquare, Navigation
} from 'lucide-react';
import { MOCK_CARRIERS } from '../constants';
import { Dispute, Booking, Listing, PlatformSettings, Transaction, AuditLogEntry, ShipperProfile, BookingStatus } from '../types';
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
  const [disputeFilter, setDisputeFilter] = useState<'All' | 'Open' | 'Resolved'>('All');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [markupInput, setMarkupInput] = useState(settings.globalMarkupPercent.toString());

  const carriersList = MOCK_CARRIERS;
  const pendingCarriers = carriersList.filter(c => !c.verified);
  const activeBookingsCount = bookings.filter(b => b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.DISPUTED).length;
  const escrowValue = bookings.reduce((acc, b) => b.escrowStatus === 'Secured' ? acc + b.price : acc, 0);
  const totalGMV = revenueData.reduce((acc, d) => acc + d.gmv, 0);

  const filteredDisputes = disputes.filter(d => {
    if (disputeFilter === 'All') return true;
    return d.status === disputeFilter;
  });

  const activeDispute = disputes.find(d => d.id === selectedDisputeId);
  const activeDisputeBooking = bookings.find(b => b.id === activeDispute?.bookingId);

  const handleApproveCarrier = (id: string) => {
    onVerifyCarrier(id);
    alert("Carrier verified and notified.");
  };

  const handleGodModeLogin = (user: string) => {
    alert(`God Mode Activated: Impersonating ${user}. Session tracked and logged.`);
  };

  const handleDisputeAction = (id: string, action: string) => {
    if (action === 'Resolve') {
      onResolveDispute(id);
    }
    alert(`Dispute Action: ${action} processed for ${id}`);
    setSelectedDisputeId(null);
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
                { id: 'disputes', icon: AlertTriangle, label: 'Dispute Judge', badge: disputes.filter(d => d.status === 'Open').length },
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
        </div>
      </aside>

      {/* MISSION CONTROL CONTENT */}
      <main className="flex-1 min-w-0 pb-20">
        
        {/* OVERVIEW MODULE */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KpiCard title="GMV (MTD)" value={`R ${totalGMV.toLocaleString()}`} icon={ArrowUpRight} color="bg-brand-900" sub="+12% vs LY" trend="up"/>
                <KpiCard title="Net Revenue" value="R 42,450" icon={TrendingUp} color="bg-emerald-500" sub="Margin 15.2%" trend="up"/>
                <KpiCard title="Escrow Float" value={`R ${escrowValue.toLocaleString()}`} icon={Lock} color="bg-indigo-600" sub="34.2% Bookings" trend="up"/>
                <KpiCard title="Open Disputes" value={disputes.filter(d => d.status !== 'Resolved').length} icon={AlertCircle} color="bg-rose-500" sub="Quality Metric" trend="down"/>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                   <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="font-black text-2xl text-slate-800 tracking-tight">Financial Health</h3>
                        <p className="text-sm text-slate-400 font-medium">Daily through-put of cargo value</p>
                      </div>
                   </div>
                   <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={revenueData}>
                            <defs>
                               <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'black'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'black'}} />
                            <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 'black'}} />
                            <Area type="monotone" dataKey="gmv" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorGmv)" strokeWidth={4} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="bg-brand-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                   <h4 className="text-xs font-black uppercase tracking-widest text-brand-400 mb-6">Real-Time Operations</h4>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold opacity-60">Active Loads</span>
                         <span className="font-black text-emerald-400">{activeBookingsCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold opacity-60">Empty Legs Live</span>
                         <span className="font-black text-emerald-400">{listings.length}</span>
                      </div>
                      <div className="pt-6 border-t border-white/10">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">Delayed Shipments</p>
                         <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                            <span className="text-xs font-bold">#WB-B12 - Late 2 hrs</span>
                         </div>
                      </div>
                   </div>
                   <Globe size={180} className="absolute -right-20 -bottom-20 opacity-5" />
                </div>
             </div>
          </div>
        )}

        {/* DISPUTE JUDGE: THE REDESIGNED CENTER */}
        {activeTab === 'disputes' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="font-black text-3xl text-slate-800 tracking-tight">Dispute Resolution Center</h3>
                  <p className="text-sm text-slate-400 font-medium">Protecting platform integrity and funds security.</p>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                   {(['All', 'Open', 'Resolved'] as const).map(f => (
                     <button 
                        key={f} 
                        onClick={() => setDisputeFilter(f)}
                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${disputeFilter === f ? 'bg-brand-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       {f}
                     </button>
                   ))}
                </div>
             </div>

             {selectedDisputeId && activeDispute ? (
               <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                     <button onClick={() => setSelectedDisputeId(null)} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-brand-900 transition-all uppercase tracking-widest">
                       <ArrowLeftRight size={16} className="rotate-180" /> Back to list
                     </button>
                     <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${activeDispute.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {activeDispute.status}
                        </span>
                        <h4 className="font-black text-xl text-slate-800 tracking-tight">Case #{activeDispute.id}</h4>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-slate-100">
                     <div className="lg:col-span-2 p-10 space-y-10">
                        <section className="space-y-6">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <FileText size={14}/> SIDE-BY-SIDE EVIDENCE
                           </h5>
                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-4">
                                 <p className="text-xs font-black text-slate-600 uppercase text-center">Pickup Photos (Carrier)</p>
                                 <div className="aspect-video bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 shadow-inner group relative">
                                    {activeDisputeBooking?.pickupPhotoUrl ? (
                                      <img src={activeDisputeBooking.pickupPhotoUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48}/></div>
                                    )}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full text-[9px] font-black text-emerald-600 shadow-sm uppercase tracking-tighter">Geo-Verified</div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <p className="text-xs font-black text-slate-600 uppercase text-center">Damage Claim Photos (Shipper)</p>
                                 <div className="aspect-video bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 shadow-inner group relative">
                                    <img src={activeDispute.evidence[0]?.fileUrl} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full text-[9px] font-black text-rose-600 shadow-sm uppercase tracking-tighter">Claimed Issue</div>
                                 </div>
                              </div>
                           </div>
                        </section>

                        <section className="space-y-4 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                           <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                              <AlertTriangle size={14}/> THE CLAIM
                           </h5>
                           <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{activeDispute.reason}"</p>
                        </section>

                        <div className="flex gap-4 pt-10 border-t border-slate-100">
                           <button onClick={() => handleDisputeAction(activeDispute.id, 'Refund 100%')} className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all">Full Refund (Customer)</button>
                           <button onClick={() => handleDisputeAction(activeDispute.id, 'Partial')} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Split Payment (50/50)</button>
                           <button onClick={() => handleDisputeAction(activeDispute.id, 'Resolve')} className="flex-[1.5] py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all">Release Full (Carrier)</button>
                        </div>
                     </div>

                     <div className="p-10 space-y-10 bg-slate-50/30">
                        <section className="space-y-6">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TRIP INTELLIGENCE</h5>
                           <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400"><Navigation size={20}/></div>
                                 <div>
                                    <p className="text-xs font-black text-slate-800">GPS Geo-Fence</p>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase">Within 50m of Target</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400"><MessageSquare size={20}/></div>
                                 <div>
                                    <p className="text-xs font-black text-slate-800">Chat History</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">12 Messages exchanged</p>
                                 </div>
                              </div>
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ADMIN SCRATCHPAD</h5>
                           <textarea placeholder="Add internal notes for other admins..." className="w-full h-48 p-5 bg-white border border-slate-200 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none shadow-inner"></textarea>
                           <button className="w-full py-3 bg-brand-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Save Internal Log</button>
                        </section>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead>
                           <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-8 py-5">Case ID</th>
                              <th className="px-8 py-5">Carrier/Shipper</th>
                              <th className="px-8 py-5">Escrowed Amt</th>
                              <th className="px-8 py-5">Status</th>
                              <th className="px-8 py-5 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {filteredDisputes.map(d => (
                              <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                                 <td className="px-8 py-6">
                                    <p className="font-black text-slate-800">#{d.id}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(d.createdAt).toLocaleDateString()}</p>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                       <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Truck size={10}/> Swift Logistics</span>
                                       <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Users size={10}/> Acme Supplies</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 font-black text-slate-800">R 8,500.00</td>
                                 <td className="px-8 py-6">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${d.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                       {d.status}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <button onClick={() => setSelectedDisputeId(d.id)} className="px-4 py-2 bg-brand-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-800 shadow-md active:scale-95 transition-all">Review Case</button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  {filteredDisputes.length === 0 && (
                     <div className="p-20 text-center flex flex-col items-center">
                        <CheckCircle size={64} className="text-emerald-100 mb-6" />
                        <h4 className="text-2xl font-black text-slate-800 mb-2">Clear Records</h4>
                        <p className="text-slate-400 font-medium">No disputes match your current filter.</p>
                     </div>
                  )}
               </div>
             )}
          </div>
        )}

        {/* FINANCE MODULE: ESCROW MASTER VIEW */}
        {activeTab === 'finance' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                   <h3 className="font-black text-2xl text-slate-800 tracking-tight mb-8">Commission Settings</h3>
                   <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-6">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Marketplace Fee (%)</label>
                         <div className="flex gap-4">
                            <input 
                               type="number" 
                               value={markupInput} 
                               onChange={(e) => setMarkupInput(e.target.value)}
                               className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-2xl font-black text-brand-900 focus:ring-4 focus:ring-brand-500/10 outline-none"
                            />
                            <button className="px-8 bg-brand-900 text-white rounded-2xl font-black shadow-lg">Save</button>
                         </div>
                      </div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">Adjusting this percentage will instantly update all prices across the search results. Use carefully.</p>
                   </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                   <h3 className="font-black text-2xl text-slate-800 tracking-tight mb-8">Escrow Master View</h3>
                   <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                      {bookings.filter(b => b.escrowStatus !== 'Released').map(b => (
                         <div key={b.id} className="p-6 border border-slate-50 rounded-[28px] bg-slate-50/30 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Lock size={18}/></div>
                               <div>
                                  <p className="font-black text-slate-800 text-sm">R {b.price.toLocaleString()}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">WAYBILL: {b.waybillId}</p>
                               </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${b.status === BookingStatus.DISPUTED ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                               {b.status === BookingStatus.DISPUTED ? 'DISPUTED' : 'LOCKED'}
                            </span>
                         </div>
                      ))}
                   </div>
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
                      <p className="text-sm text-slate-400 font-medium">Monitoring enterprise clients and cargo frequency.</p>
                   </div>
                   <div className="flex gap-3">
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                         <input type="text" placeholder="Search shippers..." className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead>
                         <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Company Info</th>
                            <th className="px-8 py-5">LTV (Spend)</th>
                            <th className="px-8 py-5">Quality/Risk</th>
                            <th className="px-8 py-5 text-right">God Mode</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {shippers.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">{s.companyName[0]}</div>
                                     <div>
                                        <p className="font-black text-slate-800">{s.companyName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {s.id.toUpperCase()}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6 font-black text-slate-800">R {s.totalSpend.toLocaleString()}</td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${s.disputeRate > 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${100 - s.disputeRate}%`}}></div>
                                     </div>
                                     <span className="text-[10px] font-black text-slate-500">{100 - s.disputeRate}% Healthy</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                     <button onClick={() => handleGodModeLogin(s.companyName)} className="p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" title="Login as Shipper"><LogIn size={20}/></button>
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

        {/* CARRIER CRM */}
        {activeTab === 'carriers' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                      <h3 className="font-black text-2xl text-slate-800 tracking-tight">Carrier CRM</h3>
                      <p className="text-sm text-slate-400 font-medium">Managing the supply side of the marketplace.</p>
                   </div>
                   <div className="flex gap-3">
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                         <input type="text" placeholder="Search carriers..." className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-black focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead>
                         <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Company Manifest</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Rating</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {carriersList.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-brand-900 text-emerald-400 flex items-center justify-center font-black">{c.companyName[0]}</div>
                                     <div>
                                        <p className="font-black text-slate-800">{c.companyName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Reg: {c.regNumber}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${c.verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                     {c.verified ? 'VERIFIED' : 'PENDING'}
                                  </span>
                               </td>
                               <td className="px-8 py-6 font-black text-slate-800">{c.rating} / 5.0</td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                     <button onClick={() => handleGodModeLogin(c.companyName)} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Login as Carrier"><LogIn size={20}/></button>
                                     <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><Settings size={20}/></button>
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

        {/* KYC CENTER: COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div className="space-y-10 animate-in slide-in-from-right-4">
             <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-black text-3xl text-slate-800 tracking-tight">Verification Queue</h3>
                  <p className="text-sm text-slate-400 font-medium">Manual approval required for these documents.</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Rev Time</p>
                      <p className="text-sm font-black text-slate-800">4.2 Hours</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pendingCarriers.map(carrier => (
                   <div key={carrier.id} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all">
                      <div className="flex items-center gap-6 mb-10">
                         <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-2xl">{carrier.companyName[0]}</div>
                         <div>
                            <h4 className="font-black text-xl text-slate-800">{carrier.companyName}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase">Reg: {carrier.id}</p>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">Compliance Checklist</p>
                         {['COF Certificate', 'GIT Insurance (R500k)', 'Driver PrDP'].map(doc => (
                            <div key={doc} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-emerald-500 transition-all">
                               <div className="flex items-center gap-3">
                                  <FileText size={18} className="text-brand-500" />
                                  <span className="text-xs font-black text-slate-600">{doc}</span>
                               </div>
                               <Eye size={16} className="text-slate-300 group-hover:text-brand-900" />
                            </div>
                         ))}
                      </div>

                      <div className="pt-10 flex gap-4">
                         <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Reject</button>
                         <button onClick={() => handleApproveCarrier(carrier.id)} className="flex-[2] py-4 bg-brand-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-900/20 active:scale-95 transition-all">Approve Carrier</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* LOGS MODULE */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm animate-in slide-in-from-right-4">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-2xl text-slate-800 tracking-tight">System Audit Logs</h3>
                <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Export Report</button>
             </div>
             <div className="divide-y divide-slate-50">
                {auditLogs.map(log => (
                   <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-5">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${log.adminName === 'System' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {log.adminName[0]}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800">{log.action}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Target: {log.targetType} ({log.targetId}) • By {log.adminName}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         <p className="text-[9px] text-slate-300 font-bold">{new Date(log.timestamp).toLocaleDateString()}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* MASTER DATA */}
        {activeTab === 'masterdata' && (
          <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm animate-in slide-in-from-right-4 max-w-4xl">
             <h3 className="font-black text-3xl text-slate-800 tracking-tight mb-10">Static Data Management</h3>
             <div className="space-y-12">
                <section className="space-y-6">
                   <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 flex items-center gap-2"><Truck size={14}/> Vehicle Configurations</h4>
                      <button className="text-[10px] font-black bg-brand-900 text-white px-3 py-1 rounded-lg uppercase tracking-widest">+ New Type</button>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['Flatbed', 'Tautliner', 'Rigid', 'Refrigerated', 'Superlink', 'Pantech', '6-Ton Reefer', 'Tipper'].map(v => (
                         <div key={v} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                            <span className="text-xs font-bold text-slate-700">{v}</span>
                            <button className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                         </div>
                      ))}
                   </div>
                </section>
                <section className="space-y-6 border-t pt-10">
                   <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 flex items-center gap-2"><MapIcon size={14}/> Operational Hubs</h4>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['JHB Hub', 'CPT Port Hub', 'DBN Central Depot', 'PE Hub', 'Bloemfontein X'].map(h => (
                         <div key={h} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                            <span className="text-xs font-bold text-slate-700">{h}</span>
                            <button className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                         </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminPanel;
