
import React, { useState } from 'react';
import { Shield, AlertCircle, Check, X, Save, Image as ImageIcon, FileText, Paperclip, CheckCircle } from 'lucide-react';
import { MOCK_CARRIERS } from '../constants';
import { Dispute } from '../types';

interface Props {
  disputes: Dispute[];
  onResolveDispute: (id: string) => void;
  onVerifyCarrier: (id: string) => void;
}

const AdminPanel: React.FC<Props> = ({ disputes, onResolveDispute, onVerifyCarrier }) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'disputes'>('disputes');
  
  // Local state for carriers to handle UI updates for verification
  const [carriers, setCarriers] = useState(MOCK_CARRIERS);

  // Local state for demo purposes to handle rejection flow
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewEvidenceDisputeId, setViewEvidenceDisputeId] = useState<string | null>(null);
  
  const [disputeFilter, setDisputeFilter] = useState<'Open' | 'Resolved'>('Open');

  const pendingCarriers = carriers.filter(c => !c.verified);

  const handleRejectClick = (id: string) => {
    setRejectionId(id);
    setRejectionReason('');
  };

  const confirmReject = (id: string) => {
    if (!rejectionReason.trim()) return;
    // Here you would call the API to update status and reason
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

  const activeDispute = disputes.find(d => d.id === viewEvidenceDisputeId);
  const filteredDisputes = disputes.filter(d => d.status === disputeFilter);

  return (
    <div className="space-y-6">
       {/* Admin Header / Tabs */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
           <div>
               <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
               <p className="text-slate-500 text-sm">Manage users, verifications, and platform disputes.</p>
           </div>
           <div className="flex bg-slate-100 p-1 rounded-lg">
               <button 
                 onClick={() => setActiveTab('verifications')}
                 className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'verifications' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Shield size={16} />
                   Verifications
                   {pendingCarriers.length > 0 && (
                       <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCarriers.length}</span>
                   )}
               </button>
               <button 
                 onClick={() => setActiveTab('disputes')}
                 className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'disputes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <AlertCircle size={16} />
                   Disputes
                   {disputes.filter(d => d.status === 'Open').length > 0 && (
                       <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{disputes.filter(d => d.status === 'Open').length}</span>
                   )}
               </button>
           </div>
       </div>

       {/* Verification Queue Tab */}
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
                 <div className="flex gap-2 mb-4">
                    <div className="h-16 w-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-xs text-slate-400">Doc 1</div>
                    <div className="h-16 w-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-xs text-slate-400">Doc 2</div>
                 </div>
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

       {/* Dispute Management Tab */}
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
