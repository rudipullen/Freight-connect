

import React, { useState, useRef } from 'react';
import { UserRole, BookingStatus, Dispute, Booking, Review } from '../types';
import { Upload, FileCheck, MoreHorizontal, AlertTriangle, X, ShieldAlert, Image as ImageIcon, FileText, Plus, Paperclip, Eye, Loader2, CheckCircle, AlertCircle, Box, Truck, Warehouse, CreditCard, Lock, Clock, QrCode, PenTool, Check, Phone, Mail, EyeOff, Map, Shield, Camera, ShieldCheck, KeyRound, MapPin, ExternalLink, Star } from 'lucide-react';

interface Props {
  role: UserRole;
  disputes: Dispute[];
  bookings: Booking[];
  onAddEvidence: (disputeId: string, file: File) => void;
  onCompleteDelivery: (bookingId: string, podFile: File, signature: string, offloadPhoto: File, location?: {lat: number, lng: number}) => void;
  onVerifyPOD: (bookingId: string) => void;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onRevealContact: (bookingId: string) => void;
  onConfirmCollection: (bookingId: string, file: File, isSealed: boolean, sealNumber?: string, location?: {lat: number, lng: number}) => void;
  onRateBooking: (bookingId: string, review: Review) => void;
}

const MyBookings: React.FC<Props> = ({ role, disputes, bookings: initialBookings, onAddEvidence, onCompleteDelivery, onVerifyPOD, onUpdateStatus, onRevealContact, onConfirmCollection, onRateBooking }) => {
  // Local state for bookings to handle UI updates for ratings without full app reload/prop drilling for this demo
  const [localBookings, setLocalBookings] = useState<Booking[]>(initialBookings);

  // Sync local bookings if props change
  React.useEffect(() => {
      setLocalBookings(initialBookings);
  }, [initialBookings]);

  const [activeDisputeBooking, setActiveDisputeBooking] = useState<string | null>(null);
  const [activeDeliveryBooking, setActiveDeliveryBooking] = useState<string | null>(null);
  const [activeCollectionBooking, setActiveCollectionBooking] = useState<string | null>(null);
  const [viewWaybillBooking, setViewWaybillBooking] = useState<Booking | null>(null);
  const [viewDetailsBooking, setViewDetailsBooking] = useState<Booking | null>(null);
  
  // Rating Modal States
  const [activeRatingBooking, setActiveRatingBooking] = useState<Booking | null>(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingCriteria, setRatingCriteria] = useState<{[key: string]: number}>({});
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Collection Modal States
  const [collectionPhoto, setCollectionPhoto] = useState<File | null>(null);
  const [isTruckSealed, setIsTruckSealed] = useState(false);
  const [sealNumber, setSealNumber] = useState('');
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
  
  // Delivery Modal States
  const [deliveryStep, setDeliveryStep] = useState<'security' | 'evidence' | 'signature' | 'pod'>('security');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [offloadPhoto, setOffloadPhoto] = useState<File | null>(null);
  
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const podInputRef = useRef<HTMLInputElement>(null);
  const collectionPhotoInputRef = useRef<HTMLInputElement>(null);
  const offloadPhotoInputRef = useRef<HTMLInputElement>(null);
  
  const getStatusColor = (status: BookingStatus) => {
    switch(status) {
      case BookingStatus.PENDING: return 'bg-amber-100 text-amber-800';
      case BookingStatus.ACCEPTED: return 'bg-blue-50 text-blue-800';
      case BookingStatus.COLLECTED: return 'bg-indigo-100 text-indigo-800';
      case BookingStatus.IN_TRANSIT: return 'bg-blue-100 text-blue-800';
      case BookingStatus.AT_HUB: return 'bg-purple-100 text-purple-800';
      case BookingStatus.DELIVERED: return 'bg-teal-100 text-teal-800';
      case BookingStatus.COMPLETED: return 'bg-emerald-100 text-emerald-800';
      case BookingStatus.DISPUTED: return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getGeoLocation = (): Promise<{lat: number, lng: number} | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.warn("Geo error:", err);
          resolve(undefined);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const viewPhoto = (url?: string) => {
    if(url) window.open(url, '_blank');
  };

  const currentDispute = disputes.find(d => d.bookingId === activeDisputeBooking);

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentDispute) {
      onAddEvidence(currentDispute.id, e.target.files[0]);
      if (evidenceInputRef.current) evidenceInputRef.current.value = '';
    }
  };

  const handleCollectionFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files[0]) {
          setCollectionPhoto(e.target.files[0]);
      }
  };

  const handleSubmitCollection = async () => {
      if (!collectionPhoto || !activeCollectionBooking) return;
      if (isTruckSealed && !sealNumber) {
          alert("Please enter the seal number.");
          return;
      }
      
      setIsSubmittingCollection(true);
      const location = await getGeoLocation();
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
      
      onConfirmCollection(activeCollectionBooking, collectionPhoto, isTruckSealed, sealNumber, location);
      
      setIsSubmittingCollection(false);
      setActiveCollectionBooking(null);
      setCollectionPhoto(null);
      setIsTruckSealed(false);
      setSealNumber('');
  };

  const handleOffloadFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if(e.target.files && e.target.files[0]) {
         setOffloadPhoto(e.target.files[0]);
     }
  };

  const handlePodFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeDeliveryBooking && offloadPhoto) {
       setIsSubmittingDelivery(true);
       const location = await getGeoLocation();

       await new Promise(resolve => setTimeout(resolve, 1500));
       
       onCompleteDelivery(activeDeliveryBooking, e.target.files[0], signatureCaptured ? 'mock-signature-data' : '', offloadPhoto, location);
       
       setIsSubmittingDelivery(false);
       setActiveDeliveryBooking(null);
       setDeliveryStep('security');
       setSignatureCaptured(false);
       setOtpInput('');
       setOffloadPhoto(null);
       
       if (podInputRef.current) podInputRef.current.value = '';
    }
  };

  const handleVerifyOTP = () => {
      const booking = localBookings.find(b => b.id === activeDeliveryBooking);
      if (!booking) return;
      
      if (booking.deliveryOtp === otpInput) {
          setDeliveryStep('evidence');
      } else {
          alert("Incorrect OTP. Please ask the customer for the 6-digit delivery code.");
      }
  };

  const handleSign = () => {
      setSignatureCaptured(true);
  };

  // --- Rating Logic ---

  const openRatingModal = (booking: Booking) => {
      setActiveRatingBooking(booking);
      setRatingScore(0);
      setRatingComment('');
      setRatingCriteria({});
  };

  const submitRating = async () => {
      if (!activeRatingBooking) return;
      setIsSubmittingRating(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newReview: Review = {
          rating: ratingScore,
          comment: ratingComment,
          createdAt: new Date().toISOString(),
          criteria: ratingCriteria
      };
      
      onRateBooking(activeRatingBooking.id, newReview);

      setIsSubmittingRating(false);
      setActiveRatingBooking(null);
  };

  const getContactDetails = (booking: Booking) => {
      if (role === 'carrier') {
          return {
              label: 'Shipper',
              name: booking.shipperName || 'Unknown Shipper',
              phone: booking.shipperPhone || 'N/A',
              email: booking.shipperEmail || 'N/A'
          };
      } else {
          return {
              label: 'Carrier',
              name: booking.carrierName || 'Unknown Carrier',
              phone: booking.carrierPhone || 'N/A',
              email: booking.carrierEmail || 'N/A'
          };
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {role === 'carrier' ? 'Active Jobs' : 'My Bookings'}
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Route Abstract</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Party</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Digital Evidence Chain</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localBookings.map((booking) => {
                const contact = getContactDetails(booking);
                const hasCompleteEvidence = booking.loadingPhotoUrl && booking.deliveryPhotoUrl && booking.podUrl;
                
                const hasRated = role === 'shipper' ? !!booking.shipperReview : !!booking.carrierReview;
                
                return (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                         <Map size={14} className="text-slate-400" />
                        {booking.origin} <span className="text-slate-400">→</span> {booking.destination}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider flex items-center gap-1">
                          ID: #{booking.id.toUpperCase()}
                      </span>
                      {booking.waybillNumber && (
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">WB: {booking.waybillNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase text-slate-400">{contact.label}</span>
                        <span className="font-medium text-slate-800">{contact.name}</span>
                        
                        {booking.contactRevealed ? (
                            <div className="mt-1 space-y-1 animate-in fade-in">
                                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-fit">
                                    <Phone size={12} /> {contact.phone}
                                </div>
                            </div>
                        ) : (
                            <button 
                              onClick={() => {
                                  if(window.confirm("Reveal contact details? This action will be logged.")) {
                                      onRevealContact(booking.id);
                                  }
                              }}
                              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1.5 rounded hover:bg-slate-200 transition-colors w-fit mt-1"
                            >
                                <EyeOff size={12} /> Reveal
                            </button>
                        )}
                    </div>
                  </td>
                  
                  {/* Digital Evidence Locker */}
                  <td className="px-6 py-4">
                      <div className="space-y-2">
                          {/* OTP for Shipper */}
                          {role === 'shipper' && booking.deliveryOtp && (booking.status === BookingStatus.IN_TRANSIT || booking.status === BookingStatus.AT_HUB) && (
                              <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-200 font-bold w-fit">
                                  <KeyRound size={14} />
                                  <span>PIN: {booking.deliveryOtp}</span>
                              </div>
                          )}

                          {/* Loaded Evidence */}
                          {booking.collectedAt ? (
                             <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-bold text-slate-400 w-12">PICKUP</span>
                                 {booking.loadingPhotoUrl && (
                                   <button onClick={() => viewPhoto(booking.loadingPhotoUrl)} className="text-brand-600 hover:text-brand-800" title="View Load Photo">
                                      <Camera size={14} />
                                   </button>
                                 )}
                                 {booking.collectionLocation && (
                                   <button onClick={() => openMap(booking.collectionLocation!.lat, booking.collectionLocation!.lng)} className="text-emerald-600 hover:text-emerald-800" title="View Location Map">
                                      <MapPin size={14} />
                                   </button>
                                 )}
                                 <span className="text-[10px] text-slate-500">{new Date(booking.collectedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                          ) : (
                             <div className="text-[10px] text-slate-400 flex gap-2 items-center">
                                <span className="font-bold w-12">PICKUP</span>
                                <span className="italic">Pending load...</span>
                             </div>
                          )}

                          {/* Delivery Evidence */}
                          {booking.deliveredAt ? (
                             <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-bold text-slate-400 w-12">DROPOFF</span>
                                 {booking.deliveryPhotoUrl && (
                                   <button onClick={() => viewPhoto(booking.deliveryPhotoUrl)} className="text-brand-600 hover:text-brand-800" title="View Delivery Photo">
                                      <Camera size={14} />
                                   </button>
                                 )}
                                 {booking.deliveryLocation && (
                                   <button onClick={() => openMap(booking.deliveryLocation!.lat, booking.deliveryLocation!.lng)} className="text-emerald-600 hover:text-emerald-800" title="View Location Map">
                                      <MapPin size={14} />
                                   </button>
                                 )}
                                 <span className="text-[10px] text-slate-500">{new Date(booking.deliveredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                          ) : (
                             <div className="text-[10px] text-slate-400 flex gap-2 items-center">
                                <span className="font-bold w-12">DROPOFF</span>
                                <span className="italic">In transit...</span>
                             </div>
                          )}

                          {/* Secured Status */}
                          {hasCompleteEvidence && (
                              <div className="mt-1">
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center w-fit gap-1">
                                   <ShieldCheck size={10} /> Dispute Proof
                                </span>
                              </div>
                          )}
                      </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 w-fit ${getStatusColor(booking.status)}`}>
                           {booking.status === BookingStatus.DISPUTED && <AlertTriangle size={12} />}
                           {booking.status}
                        </span>
                        <span className={`text-[10px] flex items-center gap-1 ${
                            booking.paymentStatus === 'Released' ? 'text-emerald-600' : 
                            booking.paymentStatus === 'Hold' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                            {booking.paymentStatus === 'Released' ? <CheckCircle size={10} /> : <Lock size={10} />}
                            {booking.paymentStatus}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex flex-wrap justify-end gap-2">
                         
                         {/* Rate Button (Only when completed and not rated) */}
                         {booking.status === BookingStatus.COMPLETED && !hasRated && (
                             <button 
                               onClick={() => openRatingModal(booking)}
                               className="inline-flex items-center px-3 py-1.5 bg-amber-400 text-white rounded-md text-xs font-bold hover:bg-amber-500 transition-colors shadow-sm"
                             >
                                 <Star size={14} className="mr-1.5 fill-current" />
                                 Rate {role === 'carrier' ? 'Shipper' : 'Driver'}
                             </button>
                         )}

                         {/* Rated Indicator */}
                         {hasRated && (
                             <span className="inline-flex items-center px-3 py-1.5 text-amber-500 bg-amber-50 rounded-md text-xs font-bold border border-amber-200">
                                 <Star size={14} className="mr-1.5 fill-current" />
                                 Rated
                             </span>
                         )}

                         {/* Details Button */}
                         <button 
                           onClick={() => setViewDetailsBooking(booking)}
                           className="inline-flex items-center px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors"
                         >
                             <Eye size={14} className="mr-1.5" />
                             Details
                         </button>

                         {/* Waybill Button */}
                         <button 
                           onClick={() => setViewWaybillBooking(booking)}
                           className="inline-flex items-center px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors"
                         >
                             <QrCode size={14} className="mr-1.5" />
                             Waybill
                         </button>

                         {/* View POD Action */}
                        {booking.podUrl && (
                          <button 
                            onClick={() => viewPhoto(booking.podUrl)}
                            className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-200 transition-colors"
                            title="View Proof of Delivery"
                          >
                            <FileText size={14} className="mr-1.5" />
                            POD
                          </button>
                        )}

                        {/* Carrier Status Flow */}
                        {role === 'carrier' && (
                            <div className="flex gap-2">
                              {(booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.PENDING) && (
                                <button 
                                  onClick={() => setActiveCollectionBooking(booking.id)}
                                  className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-xs font-bold hover:bg-indigo-100 transition-colors"
                                >
                                  <Box size={14} className="mr-1.5" />
                                  Collect
                                </button>
                              )}

                              {booking.status === BookingStatus.COLLECTED && (
                                <button 
                                  onClick={() => onUpdateStatus(booking.id, BookingStatus.IN_TRANSIT)}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors"
                                >
                                  <Truck size={14} className="mr-1.5" />
                                  Transit
                                </button>
                              )}

                              {(booking.status === BookingStatus.IN_TRANSIT || booking.status === BookingStatus.AT_HUB) && (
                                <button 
                                  onClick={() => {
                                      setActiveDeliveryBooking(booking.id);
                                      setDeliveryStep('security'); // Reset step
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 bg-brand-900 text-white rounded-md text-xs font-medium hover:bg-brand-700 shadow-sm"
                                >
                                  <PenTool size={14} className="mr-1.5" />
                                  Deliver
                                </button>
                              )}
                            </div>
                        )}

                        {/* Shipper: Verify POD or Dispute */}
                        {role === 'shipper' && booking.status === BookingStatus.DELIVERED && (
                            <div className="flex gap-2">
                                <button 
                                  onClick={() => setActiveDisputeBooking(booking.id)}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-xs font-medium hover:bg-red-100 transition-colors"
                                >
                                    <AlertTriangle size={14} className="mr-1.5" />
                                    Issue
                                </button>
                                <button 
                                  onClick={() => {
                                      if(window.confirm("Are you sure? This will release the funds to the carrier immediately.")) {
                                          onVerifyPOD(booking.id);
                                      }
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs font-medium hover:bg-emerald-600 transition-colors shadow-sm"
                                >
                                    <CheckCircle size={14} className="mr-1.5" />
                                    Accept
                                </button>
                            </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Modal */}
      {activeRatingBooking && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-xl font-bold text-slate-800">Rate {role === 'carrier' ? 'Customer' : 'Driver'}</h3>
                      <p className="text-sm text-slate-500">
                          {role === 'carrier' ? activeRatingBooking.shipperName : activeRatingBooking.carrierName}
                      </p>
                  </div>
                  <div className="p-6 space-y-6">
                      
                      {/* Overall Star Rating */}
                      <div className="text-center">
                          <p className="text-sm font-bold text-slate-700 mb-2">Overall Experience</p>
                          <div className="flex justify-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                      key={star}
                                      onClick={() => setRatingScore(star)}
                                      className="focus:outline-none transition-transform hover:scale-110"
                                  >
                                      <Star 
                                          size={32} 
                                          className={`${star <= ratingScore ? 'text-amber-400 fill-current' : 'text-slate-300'} transition-colors`} 
                                      />
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Specific Criteria based on Role */}
                      <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                          {role === 'carrier' ? (
                              <>
                                  <div>
                                      <div className="flex justify-between mb-1">
                                          <label className="text-xs font-bold text-slate-600">Payment Punctuality (Did they pay on time?)</label>
                                          <span className="text-xs font-bold text-emerald-600">{ratingCriteria['payment'] || 0}/5</span>
                                      </div>
                                      <input 
                                          type="range" min="1" max="5" step="1"
                                          value={ratingCriteria['payment'] || 0}
                                          onChange={(e) => setRatingCriteria({...ratingCriteria, payment: parseInt(e.target.value)})}
                                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                      />
                                  </div>
                                  <div>
                                      <div className="flex justify-between mb-1">
                                          <label className="text-xs font-bold text-slate-600">Facility Accessibility (Is dock accessible?)</label>
                                          <span className="text-xs font-bold text-emerald-600">{ratingCriteria['accessibility'] || 0}/5</span>
                                      </div>
                                      <input 
                                          type="range" min="1" max="5" step="1"
                                          value={ratingCriteria['accessibility'] || 0}
                                          onChange={(e) => setRatingCriteria({...ratingCriteria, accessibility: parseInt(e.target.value)})}
                                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                      />
                                  </div>
                              </>
                          ) : (
                              <>
                                  <div>
                                      <div className="flex justify-between mb-1">
                                          <label className="text-xs font-bold text-slate-600">Driver Punctuality (On time?)</label>
                                          <span className="text-xs font-bold text-emerald-600">{ratingCriteria['punctuality'] || 0}/5</span>
                                      </div>
                                      <input 
                                          type="range" min="1" max="5" step="1"
                                          value={ratingCriteria['punctuality'] || 0}
                                          onChange={(e) => setRatingCriteria({...ratingCriteria, punctuality: parseInt(e.target.value)})}
                                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                      />
                                  </div>
                                  <div>
                                      <div className="flex justify-between mb-1">
                                          <label className="text-xs font-bold text-slate-600">Condition of Goods</label>
                                          <span className="text-xs font-bold text-emerald-600">{ratingCriteria['condition'] || 0}/5</span>
                                      </div>
                                      <input 
                                          type="range" min="1" max="5" step="1"
                                          value={ratingCriteria['condition'] || 0}
                                          onChange={(e) => setRatingCriteria({...ratingCriteria, condition: parseInt(e.target.value)})}
                                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                      />
                                  </div>
                              </>
                          )}
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Comments (Optional)</label>
                          <textarea 
                              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                              rows={3}
                              placeholder="Share details about your experience..."
                              value={ratingComment}
                              onChange={(e) => setRatingComment(e.target.value)}
                          />
                      </div>

                      <div className="flex gap-3">
                          <button 
                              onClick={() => setActiveRatingBooking(null)}
                              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={submitRating}
                              disabled={ratingScore === 0 || isSubmittingRating}
                              className={`flex-1 py-3 text-white font-bold rounded-lg flex justify-center items-center gap-2 ${ratingScore === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-md'}`}
                          >
                              {isSubmittingRating ? <Loader2 className="animate-spin" size={18} /> : 'Submit Review'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Job Details Modal with Map Preview */}
      {viewDetailsBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Job Details</h3>
                        <p className="text-sm text-slate-500">Booking #{viewDetailsBooking.id.toUpperCase()}</p>
                    </div>
                    <button onClick={() => setViewDetailsBooking(null)} className="p-2 hover:bg-slate-100 rounded-full">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>
                
                <div className="p-0">
                    {/* Map Preview */}
                    <div className="w-full h-64 bg-slate-100 relative">
                        <iframe 
                            title="Route Map"
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(viewDetailsBooking.origin)},+South+Africa+to+${encodeURIComponent(viewDetailsBooking.destination)},+South+Africa&t=&z=7&ie=UTF8&iwloc=&output=embed`}
                            className="opacity-90 hover:opacity-100 transition-opacity"
                        ></iframe>
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-700 pointer-events-none flex items-center gap-2">
                            <Map size={12} /> Route Preview
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Route Info */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase font-bold">Origin</p>
                                <p className="font-bold text-slate-800 text-lg flex items-center gap-1">
                                    <MapPin size={16} className="text-blue-500" /> {viewDetailsBooking.origin}
                                </p>
                                <p className="text-sm text-slate-500">{new Date(viewDetailsBooking.pickupDate).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-2 px-4 flex-1 hidden sm:block">
                                <div className="flex gap-1 justify-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                                    <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-xs text-slate-500 uppercase font-bold">Destination</p>
                                <p className="font-bold text-slate-800 text-lg flex items-center gap-1 justify-end">
                                    {viewDetailsBooking.destination} <MapPin size={16} className="text-emerald-500" />
                                </p>
                                <p className="text-sm text-slate-500">Est. Delivery: 1-2 Days</p>
                            </div>
                        </div>

                        {/* Job Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Financials</p>
                                <p className="text-lg font-bold text-emerald-600">R {viewDetailsBooking.baseRate?.toLocaleString() ?? '0.00'}</p>
                                <p className="text-xs text-slate-400">Your Net Earnings</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Current Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewDetailsBooking.status)}`}>
                                    {viewDetailsBooking.status}
                                </span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="p-4 border border-slate-200 rounded-xl">
                            <h4 className="font-bold text-slate-800 mb-3">Client Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Company</p>
                                    <p className="font-medium">{viewDetailsBooking.shipperName}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Contact</p>
                                    <p className="font-medium flex items-center gap-2">
                                        {viewDetailsBooking.contactRevealed ? viewDetailsBooking.shipperPhone : '• • • • • •'}
                                        {!viewDetailsBooking.contactRevealed && <span className="text-[10px] text-slate-400">(Hidden)</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                    onClick={() => setViewDetailsBooking(null)}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Waybill Modal */}
      {viewWaybillBooking && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                  <div className="bg-slate-900 text-white p-4 rounded-t-lg flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <Truck size={20} className="text-emerald-400" />
                          <h3 className="font-bold text-lg">Digital Waybill</h3>
                      </div>
                      <button onClick={() => setViewWaybillBooking(null)} className="hover:text-slate-300"><X size={20} /></button>
                  </div>
                  <div className="p-6 text-center space-y-4">
                      <div className="bg-white p-2 rounded-lg inline-block border-4 border-slate-100 shadow-inner">
                          <div className="w-48 h-48 bg-slate-900 flex items-center justify-center text-white relative overflow-hidden group cursor-pointer">
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-50"></div>
                              <QrCode size={80} className="relative z-10 group-hover:scale-110 transition-transform" />
                              <p className="absolute bottom-2 text-[10px] text-slate-400 z-10">Scan for Delivery</p>
                          </div>
                      </div>
                      <div>
                          <p className="font-mono text-xl font-bold text-slate-800 tracking-widest">
                              {viewWaybillBooking.waybillNumber || `WB-${viewWaybillBooking.id.toUpperCase()}`}
                          </p>
                          <p className="text-xs text-slate-500">Scan to confirm handover</p>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-lg">
                      <button onClick={() => window.print()} className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                          <FileText size={18} /> Print Waybill
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Confirm Collection Modal (Security & Photo) */}
      {activeCollectionBooking && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800">Confirm Collection</h3>
                      <p className="text-sm text-slate-500">Safety check & Proof of Load.</p>
                  </div>
                  
                  <div className="p-6 space-y-5">
                      {/* 1. Load Photo */}
                      <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">
                             1. Proof of Load Photo
                         </label>
                         <input 
                           type="file" 
                           ref={collectionPhotoInputRef} 
                           className="hidden" 
                           accept="image/*"
                           onChange={handleCollectionFileSelect}
                         />
                         <div 
                            onClick={() => collectionPhotoInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors ${collectionPhoto ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}
                         >
                             {collectionPhoto ? (
                                 <div className="text-center text-emerald-600">
                                     <Camera size={24} className="mx-auto mb-1" />
                                     <span className="text-sm font-bold">{collectionPhoto.name}</span>
                                     <span className="text-xs block opacity-75">Tap to change</span>
                                 </div>
                             ) : (
                                 <div className="text-center text-slate-400">
                                     <Camera size={24} className="mx-auto mb-1" />
                                     <span className="text-sm">Capture Loaded Cargo</span>
                                 </div>
                             )}
                         </div>
                      </div>

                      {/* 2. Security Question */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                             2. Security Check
                          </label>
                          <div className="flex items-center p-3 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                              <ShieldCheck className="text-brand-600 mr-3" size={20} />
                              <div className="flex-1">
                                  <span className="text-sm font-medium text-slate-800">Is the truck sealed?</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={isTruckSealed}
                                  onChange={(e) => setIsTruckSealed(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                              </label>
                          </div>
                          
                          {isTruckSealed && (
                              <div className="animate-in slide-in-from-top-2 fade-in">
                                  <input 
                                    type="text"
                                    placeholder="Enter Seal Number (Required)"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                                    value={sealNumber}
                                    onChange={(e) => setSealNumber(e.target.value)}
                                  />
                              </div>
                          )}
                      </div>
                      
                      {/* Geo Location Info */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                         <MapPin size={12} />
                         <span>Geo-tagging location for dispute protection.</span>
                      </div>

                      <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => setActiveCollectionBooking(null)}
                            className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={handleSubmitCollection}
                            disabled={!collectionPhoto || isSubmittingCollection || (isTruckSealed && !sealNumber)}
                            className={`flex-1 py-3 text-white font-bold rounded-lg flex justify-center items-center gap-2 ${
                                !collectionPhoto || isSubmittingCollection || (isTruckSealed && !sealNumber)
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-brand-900 hover:bg-brand-800 shadow-lg'
                            }`}
                          >
                              {isSubmittingCollection ? (
                                <>
                                  <Loader2 className="animate-spin" size={20} />
                                  <span className="text-xs">Geo-tagging...</span>
                                </>
                              ) : 'Confirm Loaded'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Delivery Process Modal */}
      {activeDeliveryBooking && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
                  {(() => {
                    const activeBooking = localBookings.find(b => b.id === activeDeliveryBooking);
                    return (
                      <>
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">Complete Delivery</h3>
                            <div className="flex gap-1 mt-2">
                                <div className={`h-1 flex-1 rounded-full ${deliveryStep === 'security' ? 'bg-brand-600' : 'bg-brand-200'}`}></div>
                                <div className={`h-1 flex-1 rounded-full ${deliveryStep === 'evidence' ? 'bg-brand-600' : deliveryStep === 'signature' || deliveryStep === 'pod' ? 'bg-brand-600' : 'bg-slate-200'}`}></div>
                                <div className={`h-1 flex-1 rounded-full ${deliveryStep === 'signature' || deliveryStep === 'pod' ? 'bg-brand-600' : 'bg-slate-200'}`}></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 uppercase font-bold">
                                {deliveryStep === 'security' ? 'Step 1: Verification' : 
                                 deliveryStep === 'evidence' ? 'Step 2: Digital Evidence' : 
                                 'Step 3: Sign & POD'}
                            </p>
                        </div>
                        
                        <div className="p-6">
                            {deliveryStep === 'security' && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Enter Delivery PIN</label>
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                            <p className="text-xs text-blue-700 mb-2 flex items-center gap-1">
                                                <KeyRound size={12} />
                                                Ask customer for the 6-digit code
                                            </p>
                                            <input 
                                              type="text"
                                              maxLength={6}
                                              placeholder="000000"
                                              className="w-full text-center text-2xl font-bold tracking-widest py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              value={otpInput}
                                              onChange={(e) => setOtpInput(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {activeBooking?.truckSealed && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ShieldCheck className="text-emerald-600" size={16} />
                                                <span className="font-bold text-slate-700 text-sm">Verify Seal Integrity</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-2">Recorded Seal Number:</p>
                                            <p className="font-mono font-bold text-lg text-slate-800 bg-white border border-slate-200 p-2 rounded text-center">
                                                {activeBooking.sealNumber || 'N/A'}
                                            </p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <input type="checkbox" id="sealCheck" className="w-4 h-4 text-emerald-600 rounded" />
                                                <label htmlFor="sealCheck" className="text-sm text-slate-600">Seal is intact and matches</label>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                      onClick={handleVerifyOTP}
                                      disabled={otpInput.length !== 6}
                                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${otpInput.length === 6 ? 'bg-brand-900 text-white hover:bg-brand-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        Verify PIN <Check size={18} />
                                    </button>
                                </div>
                            )}

                            {deliveryStep === 'evidence' && (
                                <div className="space-y-5">
                                    <div className="text-center">
                                        <h4 className="font-bold text-lg text-slate-700 mb-2">Proof of Delivery Photo</h4>
                                        <p className="text-sm text-slate-500">Take a photo of the goods off-loaded to prove condition.</p>
                                    </div>

                                    <input 
                                        type="file" 
                                        ref={offloadPhotoInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleOffloadFileSelect}
                                    />

                                    <div 
                                        onClick={() => offloadPhotoInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-colors ${offloadPhoto ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}
                                    >
                                        {offloadPhoto ? (
                                            <div className="text-center text-emerald-600">
                                                <Camera size={32} className="mx-auto mb-2" />
                                                <span className="text-sm font-bold block">{offloadPhoto.name}</span>
                                                <span className="text-xs opacity-75">Tap to change</span>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <Camera size={32} className="mx-auto mb-2" />
                                                <span className="text-sm font-medium">Capture Evidence</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setDeliveryStep('security')} className="flex-1 py-3 text-slate-500 hover:bg-slate-50 rounded-lg">Back</button>
                                        <button 
                                            onClick={() => setDeliveryStep('signature')}
                                            disabled={!offloadPhoto}
                                            className={`flex-1 py-3 text-white font-bold rounded-lg ${!offloadPhoto ? 'bg-slate-300' : 'bg-brand-900 hover:bg-brand-800'}`}
                                        >
                                            Next Step
                                        </button>
                                    </div>
                                </div>
                            )}

                            {deliveryStep === 'signature' && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h4 className="font-bold text-lg text-slate-700 mb-2">Customer Signature</h4>
                                        <p className="text-sm text-slate-500 mb-4">Ask the customer to sign on screen to confirm receipt.</p>
                                    </div>
                                    
                                    <div 
                                      className="border-2 border-dashed border-slate-300 rounded-xl h-48 bg-slate-50 flex flex-col items-center justify-center relative cursor-pointer hover:border-slate-400 transition-colors"
                                      onClick={!signatureCaptured ? handleSign : undefined}
                                    >
                                        {signatureCaptured ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl border-2 border-emerald-500">
                                                <p className="font-handwriting text-4xl text-slate-800 rotate-[-5deg] opacity-80">Signed by Customer</p>
                                                <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                                                  <Check size={16} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-4">
                                                <PenTool size={32} className="mx-auto mb-2 text-slate-300" />
                                                <span className="font-bold text-slate-500 block">Tap to Simulate Customer Signature</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {signatureCaptured && (
                                        <button 
                                          onClick={() => setSignatureCaptured(false)}
                                          className="text-xs text-red-500 font-medium hover:text-red-700 block w-full text-center"
                                        >
                                            Clear Signature
                                        </button>
                                    )}
                                    
                                    <div className="flex gap-3">
                                        <button onClick={() => setDeliveryStep('evidence')} className="flex-1 py-3 text-slate-500 hover:bg-slate-50 rounded-lg">Back</button>
                                        <button 
                                          onClick={() => setDeliveryStep('pod')}
                                          disabled={!signatureCaptured}
                                          className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${signatureCaptured ? 'bg-brand-900 text-white hover:bg-brand-800 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                        >
                                            Next Step <Check size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {deliveryStep === 'pod' && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h4 className="font-bold text-lg text-slate-700 mb-2">Upload POD Document</h4>
                                        <p className="text-sm text-slate-500 mb-4">Take a photo of the signed waybill.</p>
                                    </div>

                                    <input 
                                      type="file" 
                                      ref={podInputRef} 
                                      className="hidden" 
                                      accept="image/*,application/pdf"
                                      onChange={handlePodFileSelect}
                                    />

                                    <div 
                                      onClick={() => podInputRef.current?.click()}
                                      className="border-2 border-dashed border-brand-200 bg-brand-50 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-100 transition-colors group"
                                    >
                                        {isSubmittingDelivery ? (
                                            <div className="flex flex-col items-center text-brand-700">
                                                <Loader2 size={32} className="animate-spin mb-2" />
                                                <span className="font-bold">Geo-tagging & Uploading...</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-brand-600 group-hover:scale-105 transition-transform">
                                                <Upload size={32} className="mb-2" />
                                                <span className="font-bold">Tap to Upload POD</span>
                                                <span className="text-xs text-brand-400 mt-1 flex items-center gap-1"><MapPin size={10} /> Location will be tagged</span>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                      onClick={() => setDeliveryStep('signature')}
                                      disabled={isSubmittingDelivery}
                                      className="w-full py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-lg"
                                    >
                                        Back
                                    </button>
                                </div>
                            )}
                        </div>
                      </>
                    );
                  })()}
              </div>
          </div>
      )}

      {/* Dispute Modal (Unchanged) */}
      {activeDisputeBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-red-100 rounded-full text-red-600">
                         <ShieldAlert size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-red-900">
                            {currentDispute ? 'Dispute Details' : 'Report an Issue'}
                        </h3>
                        <p className="text-sm text-red-700">Booking #{activeDisputeBooking.toUpperCase()}</p>
                     </div>
                   </div>
                   <button onClick={() => setActiveDisputeBooking(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200">
                     <X size={24} />
                   </button>
                </div>

                {currentDispute ? (
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Dispute Reason</h4>
                            <p className="text-slate-800">{currentDispute.reason}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Paperclip size={16} />
                                Evidence & Documents
                            </h4>
                            
                            {currentDispute.evidence.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No evidence uploaded yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {currentDispute.evidence.map((ev) => (
                                        <div key={ev.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-slate-200 shadow-sm transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${ev.fileType === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {ev.fileType === 'image' ? <ImageIcon size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{ev.fileName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                         <p className="text-sm text-slate-600 mb-4">
                             Please describe the issue with this delivery. This will place the funds on hold until resolved.
                         </p>
                         <textarea 
                           className="w-full border border-slate-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-red-500 focus:outline-none"
                           placeholder="e.g. Goods damaged, missing items..."
                         />
                         <div className="mt-6">
                             <button 
                               onClick={() => {
                                   onUpdateStatus(activeDisputeBooking, BookingStatus.DISPUTED);
                                   setActiveDisputeBooking(null);
                               }}
                               className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700"
                             >
                                 Submit Dispute & Hold Funds
                             </button>
                         </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;