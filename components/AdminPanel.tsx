import React, { useState } from 'react';
import { Shield, AlertCircle, Check, X, Save, Image as ImageIcon, FileText, Paperclip, CheckCircle, Banknote, TrendingUp, Sliders, Activity, AlertTriangle, Search, Trash2, PlusCircle, Megaphone, Calendar, Percent } from 'lucide-react';
import { MOCK_CARRIERS, MOCK_BOOKINGS, MOCK_RISK_ALERTS } from '../constants';
import { Dispute, RiskAlert } from '../types';

interface Props {
  disputes: Dispute[];
  onResolveDispute: (id: string) => void;
  onVerifyCarrier: (id: string) => void;
}

const AdminPanel: React.FC<Props> = ({ disputes, onResolveDispute, onVerifyCarrier }) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'disputes' | 'financials' | 'performance' | 'risk' | 'promotions'>('financials');
  
  // Local state for carriers/alerts
  const [carriers, setCarriers] = useState(MOCK_CARRIERS);
  const [alerts, setAlerts] = useState<RiskAlert[]>(MOCK_RISK_ALERTS);

  // Verification Logic
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewEvidenceDisputeId, setViewEvidenceDisputeId] = useState<string | null>(null);
  const [disputeFilter, setDisputeFilter] = useState<'Open' | 'Resolved'>('Open');

  // Markup Engine State
  const [globalMarkup, setGlobalMarkup] = useState(10); // %
  const [promoMarkup, setPromoMarkup] = useState(5); // %
  const [promoActive, setPromoActive] = useState(false);
  const [campaignName, setCampaignName] = useState('Seasonal Discount');

  const [laneMarkups, setLaneMarkups] = useState<{id: string, origin: string, dest: string, markup: number}[]>([
      { id: '1', origin: 'Johannesburg', dest: 'Cape Town', markup: 12 },
      { id: '2', origin: 'Durban', dest: 'Johannesburg', markup: 8 }
  ]);
  const [newLane, setNewLane] = useState({ origin: '', dest: '', markup: 10 });

  const pendingCarriers = carriers.filter(c => !c.verified);

  const handleRejectClick = (id: string) => {
    setRejectionId(id);
    setRejectionReason('');
  };

  const confirmReject = (id: string) => {
    if (!rejectionReason.trim()) return;
    alert(`Carrier rejected. Reason logged: ${rejectionReason}`);
    setRejectionId(null);
    setRejectionReason('');
  };
  
  const handleApprove = (id: string) => {
      if(window.confirm('Approve this carrier for full access?')) {
          setCarriers(prev => prev.map(c => c.id === id ? { ...c, verified: true } : c));
          onVerifyCarrier(id);
      }
  };

  const handleAddLaneMarkup = () => {
      if (!newLane.origin || !newLane.dest) return;
      setLaneMarkups([...laneMarkups, { id: Date.now().toString(), ...newLane }]);
      setNewLane({ origin: '', dest: '', markup: 10 });
  };

  const handleRemoveLaneMarkup = (id: string) => {
      setLaneMarkups(prev => prev.filter(l => l.id !== id));
  };

  const activeDispute = disputes.find(d => d.id === viewEvidenceDisputeId);
  const filteredDisputes = disputes.filter(d => d.status === disputeFilter);

  // Financial Calculations
  const financialBookings = MOCK_BOOKINGS.map(b => ({
      ...b,
      baseRate: b.baseRate || Math.round(b.price / 1.1)
  }));
  const totalRevenue = financialBookings.reduce((acc, b) => acc + (b.price - (b.baseRate || 0)), 0);

  return (
    <div className="space-y-6">
       {/* Admin Header / Tabs */}
       <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-200 pb-4">
           <div>
               <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
               <p className="text-slate-500 text-sm">Platform governance, risk control, and financial oversight.</p>
           </div>
           <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-lg overflow-x-auto">
               <button 
                 onClick={() => setActiveTab('financials')}
                 className={`px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'financials' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Banknote size={16} />
                   Financials
               </button>
               <button 
                 onClick={() => setActiveTab('promotions')}
                 className={`px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'promotions' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Megaphone size={16} />
                   Run Promotion
               </button>
               <button 
                 onClick={() => setActiveTab('performance')}
                 className={`px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'performance' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Activity size={16} />
                   Performance
               </button>
               <button 
                 onClick={() => setActiveTab('risk')}
                 className={`px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'risk' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <AlertTriangle size={16} />
                   Risk Center
                   {alerts.filter(a => a.status === 'New').length > 0 && (
                       <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{alerts.filter(a => a.status === 'New').length}</span>
                   )}
               </button>
               <div className="w-px bg-slate-300 mx-1 hidden sm:block"></div>
               <button 
                 onClick={() => setActiveTab('verifications')}
                 className={`px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'verifications' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Shield size={16} />
                   Verifications
                   {pendingCarriers.length > 0 && (
                       <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCarriers.length}</span>
                   )}
               </button>
               <button 
                 onClick={() => setActiveTab('disputes')}
                 className={`px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'disputes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <AlertCircle size={16} />
                   Disputes
                   {disputes.filter(d => d.status === 'Open').length > 0 && (
                       <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{disputes.filter(d => d.status === 'Open').length}</span>
                   )}
               </button>
           </div>
       </div>

       {/* Financials Tab */}
       {activeTab === 'financials' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               
               {/* Revenue Summary */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">+12% this week</span>
                        </div>
                        <div>
                            <p className="text-slate-500 font-medium text-sm">Total Platform Revenue</p>
                            <h3 className="text-3xl font-bold text-slate-800">R {totalRevenue.toLocaleString()}</h3>
                        </div>
                   </div>
                   
                   {/* Global Markup Controls */}
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2">
                       <div className="flex items-center gap-2 mb-6">
                           <Sliders size={20} className="text-slate-600" />
                           <h3 className="font-bold text-slate-800">Markup Engine</h3>
                       </div>
                       <div>
                           <div className="flex justify-between mb-2">
                               <label className="text-sm font-medium text-slate-700">Standard Markup</label>
                               <span className="font-bold text-emerald-600">{globalMarkup}%</span>
                           </div>
                           <input 
                             type="range" 
                             min="0" max="30" 
                             value={globalMarkup}
                             onChange={(e) => setGlobalMarkup(Number(e.target.value))}
                             className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                           />
                           <p className="text-xs text-slate-500 mt-2">Applied to all standard loads by default.</p>
                       </div>
                   </div>
               </div>

               {/* Lane Specific Markup */}
               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Lane-Specific Markup Rules</h3>
                        <span className="text-xs text-slate-500">Overrides global markup settings</span>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end border-b border-slate-100 pb-6">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Origin</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Johannesburg"
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                  value={newLane.origin}
                                  onChange={(e) => setNewLane({...newLane, origin: e.target.value})}
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Destination</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Durban"
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                  value={newLane.dest}
                                  onChange={(e) => setNewLane({...newLane, dest: e.target.value})}
                                />
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Markup %</label>
                                <input 
                                  type="number" 
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                  value={newLane.markup}
                                  onChange={(e) => setNewLane({...newLane, markup: Number(e.target.value)})}
                                />
                            </div>
                            <button 
                              onClick={handleAddLaneMarkup}
                              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2"
                            >
                                <PlusCircle size={16} /> Add Rule
                            </button>
                        </div>

                        <div className="space-y-2">
                            {laneMarkups.length === 0 && <p className="text-slate-400 text-sm italic">No specific lane rules active.</p>}
                            {laneMarkups.map(lane => (
                                <div key={lane.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-slate-800">{lane.origin}</span>
                                        <span className="text-slate-400">→</span>
                                        <span className="font-medium text-slate-800">{lane.dest}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-emerald-600 bg-white px-3 py-1 rounded border border-emerald-100 shadow-sm">{lane.markup}%</span>
                                        <button onClick={() => handleRemoveLaneMarkup(lane.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
               </div>
           </div>
       )}

       {/* New Promotions Tab */}
       {activeTab === 'promotions' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Megaphone className="text-blue-600" size={24} />
                                Promotional Campaigns
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">Run temporary discount campaigns to boost volume.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${promoActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {promoActive ? 'Active' : 'Inactive'}
                            </span>
                            <button 
                                onClick={() => setPromoActive(!promoActive)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${promoActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${promoActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Name</label>
                            <input 
                                type="text"
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                                placeholder="e.g. Summer Haul Savings"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className={!promoActive ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">Promo Markup Rate</label>
                                <span className="font-bold text-blue-600">{promoMarkup}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="15" 
                                value={promoMarkup}
                                onChange={(e) => setPromoMarkup(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <p className="text-xs text-slate-500 mt-2">This lower markup rate overrides the standard markup for all carriers when active.</p>
                        </div>
                    </div>
                </div>
           </div>
       )}

       {/* Performance Tab */}
       {activeTab === 'performance' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <p className="text-xs text-slate-500 uppercase font-bold">Avg On-Time Rate</p>
                       <p className="text-2xl font-bold text-emerald-600 mt-1">94%</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <p className="text-xs text-slate-500 uppercase font-bold">Avg POD Upload</p>
                       <p className="text-2xl font-bold text-blue-600 mt-1">4.2h</p>
                       <p className="text-[10px] text-slate-400">After delivery</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <p className="text-xs text-slate-500 uppercase font-bold">Active Transporters</p>
                       <p className="text-2xl font-bold text-slate-800 mt-1">{carriers.filter(c => c.verified).length}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <p className="text-xs text-slate-500 uppercase font-bold">Platform Rating</p>
                       <p className="text-2xl font-bold text-amber-500 mt-1">4.6 ★</p>
                   </div>
               </div>

               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                       <h3 className="font-bold text-slate-800">Transporter Performance Scorecards</h3>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm">
                           <thead className="bg-slate-50 border-b border-slate-200">
                               <tr>
                                   <th className="px-6 py-4 font-semibold text-slate-600">Carrier</th>
                                   <th className="px-6 py-4 font-semibold text-slate-600 text-center">Jobs</th>
                                   <th className="px-6 py-4 font-semibold text-slate-600 text-center">On-Time %</th>
                                   <th className="px-6 py-4 font-semibold text-slate-600 text-center">POD Gap (hrs)</th>
                                   <th className="px-6 py-4 font-semibold text-slate-600 text-center">Rating</th>
                                   <th className="px-6 py-4 font-semibold text-slate-600 text-right">Risk Score</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {carriers.map(carrier => (
                                   <tr key={carrier.id} className="hover:bg-slate-50">
                                       <td className="px-6 py-4">
                                           <div className="font-bold text-slate-800">{carrier.companyName}</div>
                                           <div className="text-xs text-slate-500">{carrier.verified ? 'Verified' : 'Pending'}</div>
                                       </td>
                                       <td className="px-6 py-4 text-center font-mono">{carrier.performance?.totalJobs || 0}</td>
                                       <td className="px-6 py-4 text-center">
                                           <span className={`px-2 py-1 rounded font-bold text-xs ${
                                               (carrier.performance?.onTimeRate || 0) > 90 ? 'bg-emerald-100 text-emerald-700' :
                                               (carrier.performance?.onTimeRate || 0) > 80 ? 'bg-amber-100 text-amber-700' :
                                               'bg-red-100 text-red-700'
                                           }`}>
                                               {carrier.performance?.onTimeRate || 0}%
                                           </span>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                            <span className={`font-medium ${
                                                (carrier.performance?.avgPodUploadTime || 0) > 24 ? 'text-red-600' : 'text-slate-600'
                                            }`}>
                                                {carrier.performance?.avgPodUploadTime || 0}h
                                            </span>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                           <span className="text-amber-500 font-bold">{carrier.rating} ★</span>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                           <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${
                                               carrier.riskScore === 'High' ? 'bg-red-100 text-red-700' :
                                               carrier.riskScore === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                               'bg-emerald-100 text-emerald-700'
                                           }`}>
                                               {carrier.riskScore || 'Low'}
                                           </span>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
           </div>
       )}

       {/* Risk Center Tab */}
       {activeTab === 'risk' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                   <div>
                       <h2 className="text-xl font-bold flex items-center gap-2">
                           <Shield size={24} className="text-red-500" />
                           Risk Control Center
                       </h2>
                       <p className="text-slate-400 text-sm mt-1">Monitor fraud flags, compliance gaps, and suspicious activity.</p>
                   </div>
                   <div className="flex gap-3">
                       <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                           <span className="block text-xs text-slate-400">Active Alerts</span>
                           <span className="text-xl font-bold text-red-400">{alerts.filter(a => a.status !== 'Resolved').length}</span>
                       </div>
                       <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                           <span className="block text-xs text-slate-400">High Risk Users</span>
                           <span className="text-xl font-bold text-white">{carriers.filter(c => c.riskScore === 'High').length}</span>
                       </div>
                   </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                   {alerts.length === 0 ? (
                       <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
                           <CheckCircle size={48} className="mx-auto text-emerald-200 mb-4" />
                           <p className="text-slate-500">System clean. No active risk alerts.</p>
                       </div>
                   ) : (
                       alerts.map(alert => (
                           <div key={alert.id} className={`bg-white border-l-4 rounded-r-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 ${
                               alert.severity === 'High' ? 'border-red-500' :
                               alert.severity === 'Medium' ? 'border-amber-500' :
                               'border-blue-500'
                           }`}>
                               <div className="flex-1">
                                   <div className="flex items-center gap-2 mb-2">
                                       <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                           alert.severity === 'High' ? 'bg-red-100 text-red-700' :
                                           alert.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                           'bg-blue-100 text-blue-700'
                                       }`}>
                                           {alert.severity} Priority
                                       </span>
                                       <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                                           {alert.category}
                                       </span>
                                       <span className="text-xs text-slate-400 ml-auto md:ml-0">
                                           {new Date(alert.timestamp).toLocaleString()}
                                       </span>
                                   </div>
                                   <h3 className="font-bold text-slate-800 text-lg">{alert.message}</h3>
                                   <p className="text-sm text-slate-500 mt-1">
                                       Entity: <span className="font-medium text-slate-700">{alert.entityName}</span> (ID: {alert.entityId})
                                   </p>
                               </div>
                               <div className="flex items-center gap-2 w-full md:w-auto">
                                   {alert.status !== 'Resolved' && (
                                       <button 
                                         onClick={() => {
                                             if(window.confirm("Mark alert as resolved?")) {
                                                 setAlerts(prev => prev.map(a => a.id === alert.id ? {...a, status: 'Resolved'} : a));
                                             }
                                         }}
                                         className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"
                                       >
                                           Mark Resolved
                                       </button>
                                   )}
                                   <button className="flex-1 md:flex-none px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 text-sm">
                                       Investigate
                                   </button>
                               </div>
                           </div>
                       ))
                   )}
               </div>
           </div>
       )}

       {/* Verification Queue Tab (Existing) */}
       {activeTab === 'verifications' && (
       <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
         <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Pending Verifications
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {pendingCarriers.map(carrier => (
             <div key={carrier.id} className="bg-white p-6 rounded-xl border-l-4 border-amber-500 shadow-sm flex flex-col justify-between">
               <div>
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{carrier.companyName}</h3>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold">PENDING</span>
                 </div>
                 <p className="text-sm text-slate-500 mb-4">Uploaded: COF, GIT Insurance, ID Copy</p>
               </div>
               
               {rejectionId === carrier.id ? (
                   <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in">
                       <label className="block text-xs font-bold text-red-700 mb-1">Reason for Rejection</label>
                       <textarea 
                         className="w-full p-2 text-sm border border-red-200 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                         rows={2}
                         placeholder="e.g., Document blurred, expired insurance..."
                         value={rejectionReason}
                         onChange={(e) => setRejectionReason(e.target.value)}
                       />
                       <div className="flex gap-2">
                           <button 
                             onClick={() => setRejectionId(null)}
                             className="flex-1 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
                           >
                               Cancel
                           </button>
                           <button 
                             onClick={() => confirmReject(carrier.id)}
                             className="flex-1 py-1.5 text-xs font-bold text-white bg-red-500 rounded hover:bg-red-600 flex justify-center items-center gap-1"
                           >
                               <Save size={12} /> Confirm
                           </button>
                       </div>
                   </div>
               ) : (
                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={() => handleRejectClick(carrier.id)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm"
                    >
                        <X size={16} className="mr-2" /> Reject
                    </button>
                    <button 
                        onClick={() => handleApprove(carrier.id)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium text-sm"
                    >
                        <Check size={16} className="mr-2" /> Approve
                    </button>
                </div>
               )}
             </div>
           ))}
           {pendingCarriers.length === 0 && (
             <div className="bg-white p-12 rounded-xl text-center text-slate-400 border border-slate-200 border-dashed col-span-2 flex flex-col items-center">
                <CheckCircle size={48} className="mb-4 text-emerald-100" />
                <p>All carriers verified. Good job!</p>
             </div>
           )}
         </div>
       </div>
       )}

       {/* Dispute Management Tab (Existing) */}
       {activeTab === 'disputes' && (
       <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800">
                    Dispute Cases
                </h2>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setDisputeFilter('Open')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${disputeFilter === 'Open' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Open
                    </button>
                    <button 
                        onClick={() => setDisputeFilter('Resolved')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${disputeFilter === 'Resolved' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Resolved
                    </button>
                </div>
            </div>
            
            {filteredDisputes.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center text-slate-500 border border-slate-200">
                    <Shield size={48} className="mx-auto mb-4 text-slate-200" />
                    <p>No {disputeFilter.toLowerCase()} disputes found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredDisputes.map(dispute => (
                        <div key={dispute.id} className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${dispute.status === 'Resolved' ? 'border-slate-200 bg-slate-50/50' : 'border-red-100 hover:border-red-200'}`}>
                            <div className="flex items-start">
                                <div className={`p-3 rounded-full mr-4 flex-shrink-0 ${dispute.status === 'Resolved' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                    {dispute.status === 'Resolved' ? (
                                        <CheckCircle className="text-emerald-600" size={24} />
                                    ) : (
                                        <AlertCircle className="text-red-600" size={24} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-800">Booking #{dispute.bookingId.toUpperCase()}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${dispute.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {dispute.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{dispute.reason}</p>
                                        </div>
                                        <span className="text-xs font-mono text-slate-400 whitespace-nowrap md:ml-4 flex-shrink-0">
                                            {new Date(dispute.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-5 flex flex-wrap gap-3 pt-4 border-t border-slate-50">
                                        <button 
                                          onClick={() => setViewEvidenceDisputeId(dispute.id)}
                                          className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 transition-colors"
                                        >
                                            <Paperclip size={16} />
                                            View Evidence ({dispute.evidence.length})
                                        </button>
                                        
                                        {dispute.status === 'Open' && (
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm('Mark this dispute as resolved?')) {
                                                        onResolveDispute(dispute.id);
                                                    }
                                                }}
                                                className="px-4 py-2 text-sm font-medium bg-brand-900 text-white rounded-lg hover:bg-brand-800 flex items-center gap-2 shadow-sm transition-colors ml-auto"
                                            >
                                                <Check size={16} />
                                                Resolve Dispute
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
       </div>
       )}

       {/* Evidence Viewer Modal */}
       {activeDispute && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                   <div>
                       <h3 className="text-lg font-bold text-slate-800">Evidence Log</h3>
                       <p className="text-sm text-slate-500">Booking #{activeDispute.bookingId.toUpperCase()}</p>
                   </div>
                   <button onClick={() => setViewEvidenceDisputeId(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
                       <X size={24} />
                   </button>
               </div>
               
               <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                   {activeDispute.evidence.length === 0 ? (
                       <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                           <p className="text-slate-500">No evidence has been uploaded yet.</p>
                       </div>
                   ) : (
                       activeDispute.evidence.map(ev => (
                           <div key={ev.id} className="flex items-start p-3 border border-slate-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                               <div className={`p-2.5 rounded-lg mr-3 flex-shrink-0 ${ev.fileType === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                   {ev.fileType === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                               </div>
                               <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold text-slate-800 truncate">{ev.fileName}</p>
                                   <p className="text-xs text-slate-500 mt-0.5">
                                       By <span className="font-semibold">{ev.uploaderName}</span> • {new Date(ev.uploadedAt).toLocaleString()}
                                   </p>
                               </div>
                               <a 
                                 href={ev.fileUrl} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-md font-medium hover:bg-slate-100 hover:text-slate-800 transition-colors"
                               >
                                   View
                               </a>
                           </div>
                       ))
                   )}
               </div>

               <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                   <button onClick={() => setViewEvidenceDisputeId(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                       Close
                   </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default AdminPanel;