
import React, { useState, useRef } from 'react';
import { UserRole, BookingStatus, Dispute, Booking } from '../types';
import { 
  Upload, FileCheck, MoreHorizontal, AlertTriangle, X, ShieldAlert, 
  Image as ImageIcon, FileText, Plus, Paperclip, Eye, Loader2, 
  CheckCircle, AlertCircle, Box, Truck, Warehouse, Navigation, 
  MapPin, User, Phone, Edit, QrCode, Signature, Download,
  Calendar, Package, ShieldCheck
} from 'lucide-react';

interface Props {
  role: UserRole;
  disputes: Dispute[];
  bookings: Booking[];
  onAddEvidence: (disputeId: string, file: File) => void;
  onUploadPOD: (bookingId: string, file: File) => void;
  onVerifyPOD: (bookingId: string) => void;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
}

const MyBookings: React.FC<Props> = ({ role, disputes, bookings, onAddEvidence, onUploadPOD, onVerifyPOD, onUpdateStatus }) => {
  const [activeDisputeBooking, setActiveDisputeBooking] = useState<string | null>(null);
  const [activePodUploadId, setActivePodUploadId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [viewingWaybill, setViewingWaybill] = useState<Booking | null>(null);
  const [isSigning, setIsSigning] = useState<Booking | null>(null);
  
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const podInputRef = useRef<HTMLInputElement>(null);
  
  const getStatusColor = (status: BookingStatus) => {
    switch(status) {
      case BookingStatus.PENDING: return 'bg-amber-100 text-amber-800';
      case BookingStatus.ACCEPTED: return 'bg-blue-100 text-blue-800';
      case BookingStatus.ARRIVED_AT_PICKUP: return 'bg-indigo-100 text-indigo-800';
      case BookingStatus.LOADED: return 'bg-purple-100 text-purple-800';
      case BookingStatus.IN_TRANSIT: return 'bg-blue-500 text-white';
      case BookingStatus.ARRIVED_AT_DELIVERY: return 'bg-teal-100 text-teal-800';
      case BookingStatus.DELIVERED: return 'bg-emerald-100 text-emerald-800';
      case BookingStatus.COMPLETED: return 'bg-emerald-600 text-white';
      case BookingStatus.DISPUTED: return 'bg-red-500 text-white';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const currentDispute = disputes.find(d => d.bookingId === activeDisputeBooking);

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentDispute) {
      onAddEvidence(currentDispute.id, e.target.files[0]);
      if (evidenceInputRef.current) evidenceInputRef.current.value = '';
    }
  };

  const handlePodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activePodUploadId) {
      const file = e.target.files[0];
      const bookingId = activePodUploadId;
      setActivePodUploadId(null);
      setUploadingId(bookingId);
      await new Promise(resolve => setTimeout(resolve, 1500));
      onUploadPOD(bookingId, file);
      setUploadingId(null);
      if (podInputRef.current) podInputRef.current.value = '';
    }
  };

  const handleSignConfirm = () => {
    if (!isSigning) return;
    onUpdateStatus(isSigning.id, BookingStatus.DELIVERED);
    setIsSigning(null);
    alert("Digital signature captured. Delivery timestamped and recorded.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <input type="file" ref={podInputRef} className="hidden" onChange={handlePodUpload} accept="image/*,application/pdf" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {role === 'carrier' ? 'Fleet Operations' : 'Shipment Tracking'}
          </h2>
          <p className="text-slate-500 font-medium">Manage active cargo movements and documentation.</p>
        </div>
        <div className="flex gap-2">
           <button className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"><QrCode size={20}/></button>
           <button className="px-5 py-3 bg-brand-900 text-white rounded-2xl font-bold shadow-lg shadow-brand-900/20 active:scale-95 transition-all">Download Audit Log</button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] opacity-70">Manifest & Route</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] opacity-70">Logistics Status</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] opacity-70">Escrow/Wallet</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] opacity-70 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-900 group-hover:text-emerald-400 transition-all">
                            <Truck size={20} />
                         </div>
                         <div>
                            <p className="font-black text-slate-800 text-base">{booking.origin} → {booking.destination}</p>
                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-tighter">Waybill: {booking.waybillId}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                         <span className="flex items-center gap-1"><Calendar size={12}/> {booking.pickupDate}</span>
                         <span className="flex items-center gap-1"><Package size={12}/> R {booking.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-2 border shadow-sm ${getStatusColor(booking.status)}`}>
                         <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                         {booking.status}
                       </span>
                       {booking.status === BookingStatus.IN_TRANSIT && (
                         <p className="text-[10px] text-brand-500 font-bold flex items-center gap-1"><Navigation size={10} className="animate-bounce" /> Location shared with shipper</p>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${booking.escrowStatus === 'Secured' ? 'text-emerald-500' : 'text-slate-400'}`}>
                         <ShieldCheck size={12}/> {booking.escrowStatus}
                      </span>
                      <p className="text-xs text-slate-500 font-medium">Auto-release on POD</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col gap-3 items-end">
                      
                      <div className="flex flex-wrap justify-end gap-2">
                        <button onClick={() => setViewingWaybill(booking)} className="p-2.5 bg-white border rounded-xl text-slate-400 hover:text-brand-900 hover:border-brand-900 transition-all shadow-sm" title="View Waybill"><FileText size={18}/></button>
                        
                        {role === 'carrier' && (
                          <div className="flex gap-2">
                            {booking.status === BookingStatus.ACCEPTED && (
                              <button onClick={() => onUpdateStatus(booking.id, BookingStatus.ARRIVED_AT_PICKUP)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-900/10 active:scale-95 transition-all">Arrived at Pickup</button>
                            )}
                            {booking.status === BookingStatus.ARRIVED_AT_PICKUP && (
                              <button onClick={() => onUpdateStatus(booking.id, BookingStatus.LOADED)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 active:scale-95 transition-all">Confirm Loaded</button>
                            )}
                            {booking.status === BookingStatus.LOADED && (
                              <button onClick={() => onUpdateStatus(booking.id, BookingStatus.IN_TRANSIT)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/10 active:scale-95 transition-all">Depart Pickup</button>
                            )}
                            {booking.status === BookingStatus.IN_TRANSIT && (
                              <button onClick={() => onUpdateStatus(booking.id, BookingStatus.ARRIVED_AT_DELIVERY)} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-lg shadow-teal-600/10 active:scale-95 transition-all">Arrived at Delivery</button>
                            )}
                            {booking.status === BookingStatus.ARRIVED_AT_DELIVERY && (
                              <button onClick={() => setIsSigning(booking)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center gap-2"><Signature size={14}/> Receiver Signature</button>
                            )}
                            {booking.status === BookingStatus.DELIVERED && !booking.podUrl && (
                               <button onClick={() => { setActivePodUploadId(booking.id); podInputRef.current?.click(); }} className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-black flex items-center gap-2"><Upload size={14}/> Upload Scan POD</button>
                            )}
                          </div>
                        )}

                        {role === 'shipper' && booking.status === BookingStatus.DELIVERED && (
                          <button onClick={() => onVerifyPOD(booking.id)} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Verify & Release Funds</button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waybill Modal */}
      {viewingWaybill && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b flex justify-between items-center bg-slate-50 relative overflow-hidden">
                 <div className="relative z-10">
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight">Digital Waybill</h3>
                   <p className="text-brand-600 font-bold uppercase tracking-widest text-[10px]">{viewingWaybill.waybillId}</p>
                 </div>
                 <button onClick={() => setViewingWaybill(null)} className="relative z-10 w-12 h-12 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-all">
                   <X size={24} />
                 </button>
              </div>
              <div className="p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">CONSIGNOR (Shipper)</h4>
                       <div className="space-y-2">
                          <p className="font-black text-slate-800 flex items-center gap-2"><User size={14}/> Acme Supplies Ltd</p>
                          <p className="text-sm text-slate-500 flex items-start gap-2"><MapPin size={14} className="mt-1 flex-shrink-0"/> {viewingWaybill.origin}, ZA</p>
                          <p className="text-sm text-slate-500 flex items-center gap-2"><Phone size={14}/> +27 12 345 6789</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">CONSIGNEE (Receiver)</h4>
                       <div className="space-y-2">
                          <p className="font-black text-slate-800 flex items-center gap-2"><User size={14}/> Distribution Hub X</p>
                          <p className="text-sm text-slate-500 flex items-start gap-2"><MapPin size={14} className="mt-1 flex-shrink-0"/> {viewingWaybill.destination}, ZA</p>
                          <p className="text-sm text-slate-500 flex items-center gap-2"><Phone size={14}/> +27 12 987 6543</p>
                       </div>
                    </div>
                 </div>
                 <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">MANIFEST DETAILS</h4>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                       <div><p className="text-slate-400 font-bold">CARRIER:</p><p className="font-black text-slate-800">Swift Logistics</p></div>
                       <div><p className="text-slate-400 font-bold">VEHICLE:</p><p className="font-black text-slate-800">ZN 99 GP (Superlink)</p></div>
                       <div><p className="text-slate-400 font-bold">LOAD DATE:</p><p className="font-black text-slate-800">{viewingWaybill.pickupDate}</p></div>
                       <div><p className="text-slate-400 font-bold">FEE (INC. VAT):</p><p className="font-black text-emerald-600">R {viewingWaybill.price.toLocaleString()}</p></div>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"><Download size={20}/> Download PDF</button>
                    <button onClick={() => window.print()} className="flex-1 py-4 bg-brand-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/20"><QrCode size={20}/> Share QR Link</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Sign on Glass Modal */}
      {isSigning && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b text-center">
                 <h3 className="text-2xl font-black text-slate-800 tracking-tight">Confirm Delivery</h3>
                 <p className="text-slate-500 font-medium">Capture receiver's signature for Job #{isSigning.id.toUpperCase()}</p>
              </div>
              <div className="p-8 space-y-8">
                 <div className="h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative cursor-crosshair group">
                    <Signature size={48} className="text-slate-300 group-hover:text-emerald-500 transition-colors mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sign here with finger or stylus</p>
                    {/* Simulated signature path */}
                    <div className="absolute inset-4 opacity-10 pointer-events-none">
                       <svg className="w-full h-full"><path d="M50,120 Q100,20 150,120 T250,120" fill="none" stroke="currentColor" strokeWidth="3" /></svg>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Receiver's Full Name</label>
                       <input type="text" placeholder="John Doe" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setIsSigning(null)} className="flex-1 py-4 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                       <button onClick={handleSignConfirm} className="flex-[2] py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Confirm Delivery</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
