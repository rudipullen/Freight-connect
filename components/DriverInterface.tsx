
import React, { useState, useRef, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { MapPin, Navigation, Camera, CheckCircle, Package, Phone, Truck, AlertCircle, Loader2, ChevronRight, Upload, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface DriverInterfaceProps {
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onConfirmCollection: (bookingId: string, file: File, isSealed: boolean, sealNumber?: string, location?: {lat: number, lng: number}) => void;
  onCompleteDelivery: (bookingId: string, podFile: File, signature: string, offloadPhoto: File, location?: {lat: number, lng: number}) => void;
}

interface OfflineAction {
    id: string;
    type: 'STATUS_UPDATE' | 'COLLECTION' | 'DELIVERY';
    payload: any;
    timestamp: number;
}

const DriverInterface: React.FC<DriverInterfaceProps> = ({ 
  bookings, 
  onUpdateStatus, 
  onConfirmCollection, 
  onCompleteDelivery 
}) => {
  // --- Offline & Sync State ---
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  
  // Local state to show immediate updates to driver even when offline
  const [optimisticBookings, setOptimisticBookings] = useState<Booking[]>(bookings);

  // Sync props to optimistic state when online and props change
  useEffect(() => {
      if (isOnline && !isSyncing) {
          setOptimisticBookings(bookings);
      }
  }, [bookings, isOnline, isSyncing]);

  // Load queue from local storage on mount
  useEffect(() => {
      const storedQueue = localStorage.getItem('driver_offline_queue');
      if (storedQueue) {
          setOfflineQueue(JSON.parse(storedQueue));
      }
  }, []);

  // Update local storage whenever queue changes
  useEffect(() => {
      localStorage.setItem('driver_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Monitor Online Status & Auto-Sync
  useEffect(() => {
    const updateOnlineStatus = () => {
      if (isSimulatedOffline) {
        setIsOnline(false);
      } else {
        const online = navigator.onLine;
        setIsOnline(online);
        if (online) processOfflineQueue();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check and reaction to simulation toggle
    updateOnlineStatus();

    return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [offlineQueue, isSimulatedOffline]);

  const toggleSimulation = () => {
      setIsSimulatedOffline(prev => !prev);
  };

  // Helper: Convert File to Base64 for offline storage
  const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
  };

  // Helper: Convert Base64 back to File for upload
  const base64ToFile = async (base64: string, filename: string): Promise<File> => {
      const res = await fetch(base64);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type });
  };

  const processOfflineQueue = async () => {
      const queue = JSON.parse(localStorage.getItem('driver_offline_queue') || '[]');
      if (queue.length === 0) return;

      setIsSyncing(true);
      
      // Process queue sequentially
      for (const action of queue) {
          try {
             if (action.type === 'STATUS_UPDATE') {
                 onUpdateStatus(action.payload.bookingId, action.payload.status);
             } 
             else if (action.type === 'COLLECTION') {
                 const file = await base64ToFile(action.payload.photo, 'collection_photo.jpg');
                 onConfirmCollection(
                     action.payload.bookingId, 
                     file, 
                     action.payload.isSealed, 
                     action.payload.sealNumber, 
                     action.payload.location
                 );
             }
             else if (action.type === 'DELIVERY') {
                 const podFile = await base64ToFile(action.payload.podFile, 'pod.jpg');
                 const offloadFile = await base64ToFile(action.payload.offloadPhoto, 'offload.jpg');
                 onCompleteDelivery(
                     action.payload.bookingId,
                     podFile,
                     action.payload.signature,
                     offloadFile,
                     action.payload.location
                 );
             }
             // Artificial delay to prevent API flooding/race conditions
             await new Promise(r => setTimeout(r, 500));
          } catch (e) { 
              console.error("Sync Error:", e); 
          }
      }
      
      setOfflineQueue([]);
      localStorage.removeItem('driver_offline_queue');
      setIsSyncing(false);
  }

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<'none' | 'collection' | 'delivery'>('none');
  
  // Forms
  const [collectionPhoto, setCollectionPhoto] = useState<File | null>(null);
  const [isTruckSealed, setIsTruckSealed] = useState(false);
  const [sealNumber, setSealNumber] = useState('');
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [offloadPhoto, setOffloadPhoto] = useState<File | null>(null);
  const [podFile, setPodFile] = useState<File | null>(null);
  const [podUploadStatus, setPodUploadStatus] = useState<'pending' | 'uploading' | 'uploaded' | 'error'>('pending');

  // Upload Management
  const [activeUploadType, setActiveUploadType] = useState<'collection' | 'offload' | 'pod' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeJob = activeJobId ? optimisticBookings.find(j => j.id === activeJobId) : null;
  const displayBookings = optimisticBookings.filter(b => 
    b.carrierId === 'c1' && 
    b.status !== BookingStatus.COMPLETED && 
    b.status !== BookingStatus.DISPUTED &&
    b.status !== BookingStatus.PENDING
  );

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

  // Trigger file dialog
  const initiateUpload = (type: 'collection' | 'offload' | 'pod') => {
      setActiveUploadType(type);
      // Use setTimeout to allow state update to propagate to 'accept' attribute before click
      setTimeout(() => {
          if (fileInputRef.current) {
              fileInputRef.current.click();
          }
      }, 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (activeUploadType === 'collection') setCollectionPhoto(file);
      if (activeUploadType === 'offload') setOffloadPhoto(file);
      if (activeUploadType === 'pod') {
          setPodUploadStatus('uploading');
          // Simulate upload processing time
          await new Promise(resolve => setTimeout(resolve, 2000));
          setPodFile(file);
          setPodUploadStatus('uploaded');
      }
      
      // Reset input value to allow re-selection of same file if needed
      e.target.value = '';
      setActiveUploadType(null);
    }
  };

  const addToOfflineQueue = (action: OfflineAction) => {
      const newQueue = [...offlineQueue, action];
      setOfflineQueue(newQueue);
  };

  const handleStatusChange = async (status: BookingStatus) => {
    if (!activeJob) return;
    
    if (status === BookingStatus.COLLECTED) {
      setUploadStep('collection');
      return;
    }
    if (status === BookingStatus.DELIVERED) {
      setUploadStep('delivery');
      return;
    }

    setIsSubmitting(true);
    
    if (isOnline) {
        onUpdateStatus(activeJob.id, status);
    } else {
        // Offline: Queue and Optimistic Update
        addToOfflineQueue({
            id: Date.now().toString(),
            type: 'STATUS_UPDATE',
            payload: { bookingId: activeJob.id, status },
            timestamp: Date.now()
        });
        
        setOptimisticBookings(prev => prev.map(b => 
            b.id === activeJob.id ? { ...b, status } : b
        ));
    }
    
    await new Promise(r => setTimeout(r, 500)); // UI feedback delay
    setIsSubmitting(false);
  };

  const submitCollection = async () => {
    if (!activeJob || !collectionPhoto) return;
    setIsSubmitting(true);
    
    const location = await getGeoLocation();
    
    if (isOnline) {
        onConfirmCollection(activeJob.id, collectionPhoto, isTruckSealed, sealNumber, location);
    } else {
        const photoBase64 = await fileToBase64(collectionPhoto);
        
        addToOfflineQueue({
            id: Date.now().toString(),
            type: 'COLLECTION',
            payload: { 
                bookingId: activeJob.id, 
                photo: photoBase64, 
                isSealed: isTruckSealed, 
                sealNumber, 
                location 
            },
            timestamp: Date.now()
        });

        setOptimisticBookings(prev => prev.map(b => 
            b.id === activeJob.id ? { 
                ...b, 
                status: BookingStatus.COLLECTED,
                collectedAt: new Date().toISOString()
            } : b
        ));
    }
    
    setUploadStep('none');
    setCollectionPhoto(null);
    setIsSubmitting(false);
  };

  const submitDelivery = async () => {
      if (!activeJob || !offloadPhoto || !podFile) return;
      
      if (activeJob.deliveryOtp && deliveryOtp !== activeJob.deliveryOtp) {
          alert('Incorrect Delivery PIN. Please ask the receiver.');
          return;
      }

      setIsSubmitting(true);
      const location = await getGeoLocation();
      
      if (isOnline) {
          onCompleteDelivery(activeJob.id, podFile, 'signed', offloadPhoto, location);
      } else {
          const podBase64 = await fileToBase64(podFile);
          const offloadBase64 = await fileToBase64(offloadPhoto);

          addToOfflineQueue({
              id: Date.now().toString(),
              type: 'DELIVERY',
              payload: {
                  bookingId: activeJob.id,
                  podFile: podBase64,
                  offloadPhoto: offloadBase64,
                  signature: 'signed',
                  location
              },
              timestamp: Date.now()
          });

          setOptimisticBookings(prev => prev.map(b => 
            b.id === activeJob.id ? { 
                ...b, 
                status: BookingStatus.DELIVERED,
                deliveredAt: new Date().toISOString()
            } : b
        ));
      }
      
      setUploadStep('none');
      setOffloadPhoto(null);
      setPodFile(null);
      setPodUploadStatus('pending'); // Reset status
      setDeliveryOtp('');
      setIsSubmitting(false);
  };

  const openMaps = (address: string) => {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const getStatusBadge = (status: BookingStatus) => {
      switch(status) {
          case BookingStatus.ACCEPTED: return 'bg-blue-100 text-blue-800';
          case BookingStatus.ARRIVED_PICKUP: return 'bg-orange-100 text-orange-800';
          case BookingStatus.COLLECTED: return 'bg-indigo-100 text-indigo-800';
          case BookingStatus.IN_TRANSIT: return 'bg-purple-100 text-purple-800';
          case BookingStatus.AT_HUB: return 'bg-teal-100 text-teal-800';
          default: return 'bg-slate-100 text-slate-800';
      }
  };

  // --- Render Job List ---
  if (!activeJob) {
    return (
      <div className="max-w-md mx-auto pb-20 safe-area-top">
        
        {/* Connection Status Bar */}
        <div className={`px-4 py-2 text-xs font-bold flex justify-between items-center transition-colors ${isOnline ? 'bg-slate-900 text-emerald-400' : 'bg-red-600 text-white'}`}>
            <div className="flex items-center gap-2">
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{isOnline ? 'ONLINE' : 'OFFLINE MODE'}</span>
            </div>
            {isSyncing && <div className="flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Syncing...</div>}
            {!isOnline && offlineQueue.length > 0 && <span>{offlineQueue.length} Pending Actions</span>}
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-b-3xl mb-6 shadow-lg">
           <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Truck className="text-emerald-400" /> Driver Portal
                </h1>
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-red-400'}`}></div>
           </div>
           <p className="text-slate-400 text-sm mt-1">
               You have {displayBookings.length} active jobs.
           </p>
        </div>

        <div className="px-4 space-y-4">
           {displayBookings.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                   <Package size={48} className="mx-auto text-slate-300 mb-4" />
                   <p className="text-slate-500 font-medium">No active jobs assigned.</p>
                   {!isOnline && <p className="text-xs text-amber-500 mt-2">Connect to internet to fetch new jobs.</p>}
               </div>
           ) : (
            displayBookings.map(job => (
                   <div 
                    key={job.id} 
                    onClick={() => setActiveJobId(job.id)}
                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 active:scale-95 transition-transform cursor-pointer touch-manipulation"
                   >
                       <div className="flex justify-between items-start mb-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(job.status)}`}>
                               {job.status}
                           </span>
                           <span className="text-xs font-mono text-slate-400">#{job.waybillNumber || job.id}</span>
                       </div>
                       
                       <div className="flex flex-col gap-4 relative">
                           {/* Dotted Line */}
                           <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

                           <div className="flex items-start gap-3 relative z-10">
                               <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm mt-1"></div>
                               <div>
                                   <p className="text-xs text-slate-400 font-bold uppercase">Pickup</p>
                                   <p className="font-bold text-slate-800">{job.origin}</p>
                                   <p className="text-xs text-slate-500">{new Date(job.pickupDate).toLocaleDateString()}</p>
                               </div>
                           </div>
                           <div className="flex items-start gap-3 relative z-10">
                               <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm mt-1"></div>
                               <div>
                                   <p className="text-xs text-slate-400 font-bold uppercase">Delivery</p>
                                   <p className="font-bold text-slate-800">{job.destination}</p>
                               </div>
                           </div>
                       </div>
                       
                       <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                           <span className="text-xs text-slate-500 flex items-center gap-1">
                               <Package size={12} /> {job.shipperName || 'Client'}
                           </span>
                           <div className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                               Open Job <ChevronRight size={16} />
                           </div>
                       </div>
                   </div>
               ))
           )}
        </div>

        {/* Developer Verification Tools */}
        <div className="px-4 py-6 border-t border-slate-100 mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">Developer Tools</p>
            <button 
                onClick={toggleSimulation}
                className={`w-full py-3 rounded-xl font-bold text-sm border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                    isSimulatedOffline 
                    ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
            >
                {isSimulatedOffline ? (
                    <><WifiOff size={16} /> Stop Offline Simulation</>
                ) : (
                    <><Wifi size={16} /> Simulate Offline Mode</>
                )}
            </button>
        </div>
      </div>
    );
  }

  // --- Render Active Job Details ---
  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col safe-area-top">
       {/* Offline Warning Banner */}
       {!isOnline && (
            <div className="bg-amber-500 text-white text-center text-xs py-2 px-4 font-bold sticky top-0 z-30 shadow-md">
                OFFLINE MODE • Actions will sync when online
            </div>
        )}

       {/* Header */}
       <div className="bg-white p-4 shadow-sm border-b border-slate-200 sticky top-0 z-20 flex items-center gap-3">
           <button onClick={() => setActiveJobId(null)} className="p-2 hover:bg-slate-100 rounded-full">
               <X size={20} className="text-slate-600" />
           </button>
           <div className="flex-1">
               <h2 className="font-bold text-slate-800 text-lg">Current Trip</h2>
               <p className="text-xs text-slate-500">WB: {activeJob.waybillNumber}</p>
           </div>
           <a href={`tel:${activeJob.shipperPhone}`} className="p-2 bg-emerald-100 text-emerald-700 rounded-full">
               <Phone size={20} />
           </a>
       </div>

       <div className="flex-1 p-4 pb-32 space-y-6 overflow-y-auto">
           {/* Progress Tracker */}
           <div className="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
               <div className={`flex flex-col items-center gap-1 ${[BookingStatus.ACCEPTED, BookingStatus.ARRIVED_PICKUP].includes(activeJob.status) ? 'text-blue-600' : 'text-slate-400'}`}>
                   <div className="w-3 h-3 rounded-full bg-current shadow-sm"></div>
                   <span className="text-[10px] font-bold uppercase">Pickup</span>
               </div>
               <div className={`h-0.5 flex-1 mx-2 ${[BookingStatus.COLLECTED, BookingStatus.IN_TRANSIT].includes(activeJob.status) ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
               <div className={`flex flex-col items-center gap-1 ${[BookingStatus.COLLECTED, BookingStatus.IN_TRANSIT].includes(activeJob.status) ? 'text-blue-600' : 'text-slate-400'}`}>
                   <div className="w-3 h-3 rounded-full bg-current shadow-sm"></div>
                   <span className="text-[10px] font-bold uppercase">Transit</span>
               </div>
               <div className={`h-0.5 flex-1 mx-2 ${[BookingStatus.AT_HUB, BookingStatus.DELIVERED].includes(activeJob.status) ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
               <div className={`flex flex-col items-center gap-1 ${[BookingStatus.AT_HUB, BookingStatus.DELIVERED].includes(activeJob.status) ? 'text-blue-600' : 'text-slate-400'}`}>
                   <div className="w-3 h-3 rounded-full bg-current shadow-sm"></div>
                   <span className="text-[10px] font-bold uppercase">Dropoff</span>
               </div>
           </div>

           {/* Route Map Preview */}
           <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-48 bg-slate-100 relative mb-6">
                <iframe 
                    title="Driver Route Map"
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(activeJob.origin)},+South+Africa+to+${encodeURIComponent(activeJob.destination)},+South+Africa&t=&z=7&ie=UTF8&iwloc=&output=embed`}
                    className="opacity-90 w-full h-full"
                ></iframe>
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-700 pointer-events-none border border-slate-200 shadow-sm flex items-center gap-1">
                    <MapPin size={10} /> Route Preview
                </div>
           </div>

           {/* Current Step Action Card */}
           <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
               <div className="bg-slate-900 text-white p-4">
                   <h3 className="font-bold flex items-center gap-2">
                       <Navigation size={18} className="text-emerald-400" />
                       Current Action
                   </h3>
               </div>
               <div className="p-6 text-center">
                   {activeJob.status === BookingStatus.ACCEPTED && (
                       <div>
                           <p className="text-slate-500 mb-4">Navigate to pickup location.</p>
                           <h4 className="text-xl font-bold text-slate-800 mb-6">{activeJob.origin}</h4>
                           <div className="space-y-3">
                               <button 
                                 onClick={() => openMaps(activeJob.origin)}
                                 className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 touch-manipulation"
                               >
                                   <MapPin size={20} /> Open Maps
                               </button>
                               <button 
                                 onClick={() => handleStatusChange(BookingStatus.ARRIVED_PICKUP)}
                                 disabled={isSubmitting}
                                 className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 touch-manipulation"
                               >
                                   {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Arrival at Pickup'}
                               </button>
                           </div>
                       </div>
                   )}

                   {activeJob.status === BookingStatus.ARRIVED_PICKUP && (
                       <div>
                           <p className="text-slate-500 mb-4">You are at the pickup point.</p>
                           <div className="bg-orange-50 text-orange-800 p-4 rounded-lg mb-6 text-sm text-left border border-orange-100">
                               <p className="font-bold mb-1 flex items-center gap-1"><AlertCircle size={14} /> Instructions:</p>
                               <p>{activeJob.availableDetails || "No special instructions provided."}</p>
                           </div>
                           <button 
                             onClick={() => handleStatusChange(BookingStatus.COLLECTED)}
                             className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 flex items-center justify-center gap-2 touch-manipulation"
                           >
                               <Package size={20} /> Load Cargo & Confirm
                           </button>
                       </div>
                   )}

                   {activeJob.status === BookingStatus.COLLECTED && (
                       <div>
                           <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                               <CheckCircle size={32} />
                           </div>
                           <p className="text-slate-500 mb-4">Cargo loaded successfully.</p>
                           <button 
                             onClick={() => handleStatusChange(BookingStatus.IN_TRANSIT)}
                             disabled={isSubmitting}
                             className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 touch-manipulation"
                           >
                               {isSubmitting ? <Loader2 className="animate-spin" /> : 'Start Trip (In Transit)'}
                           </button>
                       </div>
                   )}

                   {activeJob.status === BookingStatus.IN_TRANSIT && (
                       <div>
                           <p className="text-slate-500 mb-4">En route to destination.</p>
                           <h4 className="text-xl font-bold text-slate-800 mb-6">{activeJob.destination}</h4>
                           <div className="space-y-3">
                               <button 
                                 onClick={() => openMaps(activeJob.destination)}
                                 className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 touch-manipulation"
                               >
                                   <Navigation size={20} /> Navigate
                               </button>
                               <button 
                                 onClick={() => handleStatusChange(BookingStatus.AT_HUB)}
                                 disabled={isSubmitting}
                                 className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 flex items-center justify-center gap-2 touch-manipulation"
                               >
                                   {isSubmitting ? <Loader2 className="animate-spin" /> : 'Arrived at Destination'}
                               </button>
                           </div>
                       </div>
                   )}

                    {activeJob.status === BookingStatus.AT_HUB && (
                       <div>
                           <p className="text-slate-500 mb-4">You have arrived at dropoff.</p>
                           <button 
                             onClick={() => handleStatusChange(BookingStatus.DELIVERED)}
                             className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 flex items-center justify-center gap-2 touch-manipulation"
                           >
                               <CheckCircle size={20} /> Process Delivery
                           </button>
                       </div>
                   )}
               </div>
           </div>
           
           {/* Upload Modals / Overlays */}
           {(uploadStep === 'collection' || uploadStep === 'delivery') && (
               <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
                   <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50 safe-area-top">
                       <button onClick={() => setUploadStep('none')} className="p-2 bg-white rounded-full shadow-sm">
                           <X size={20} />
                       </button>
                       <h3 className="font-bold text-lg">
                           {uploadStep === 'collection' ? 'Confirm Collection' : 'Confirm Delivery'}
                       </h3>
                   </div>
                   
                   <div className="flex-1 p-6 overflow-y-auto safe-area-bottom">
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         accept={activeUploadType === 'pod' ? "image/*,application/pdf" : "image/*"}
                         className="hidden" 
                         onChange={handleFileSelect}
                       />

                       {uploadStep === 'collection' && (
                           <div className="space-y-6">
                               <div className="text-center">
                                   <div 
                                     onClick={() => initiateUpload('collection')}
                                     className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer touch-manipulation ${collectionPhoto ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}
                                   >
                                       {collectionPhoto ? (
                                           <div className="text-emerald-600 font-bold flex items-center gap-2">
                                               <CheckCircle /> Photo Selected
                                           </div>
                                       ) : (
                                           <>
                                             <Camera size={48} className="text-slate-400 mb-2" />
                                             <span className="text-slate-500 font-medium">Take Photo of Load</span>
                                           </>
                                       )}
                                   </div>
                               </div>

                               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                   <label className="flex items-center gap-3 mb-4 touch-manipulation">
                                       <input 
                                         type="checkbox" 
                                         className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500" 
                                         checked={isTruckSealed}
                                         onChange={(e) => setIsTruckSealed(e.target.checked)}
                                       />
                                       <span className="font-bold text-slate-700">Truck Sealed?</span>
                                   </label>
                                   {isTruckSealed && (
                                       <input 
                                         type="text"
                                         placeholder="Enter Seal Number"
                                         className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                                         value={sealNumber}
                                         onChange={(e) => setSealNumber(e.target.value)}
                                       />
                                   )}
                               </div>

                               <button 
                                 onClick={submitCollection}
                                 disabled={!collectionPhoto || isSubmitting}
                                 className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 touch-manipulation mt-auto"
                               >
                                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (isOnline ? 'Submit & Depart' : 'Save Offline & Depart')}
                               </button>
                           </div>
                       )}

                       {uploadStep === 'delivery' && (
                           <div className="space-y-6">
                               <div>
                                   <label className="block font-bold text-slate-700 mb-2">1. Delivery PIN</label>
                                   <input 
                                     type="text"
                                     placeholder="Enter 6-digit PIN"
                                     inputMode="numeric"
                                     className="w-full px-4 py-3 border border-slate-300 rounded-lg text-center text-xl tracking-widest font-mono"
                                     value={deliveryOtp}
                                     onChange={(e) => setDeliveryOtp(e.target.value)}
                                   />
                               </div>

                               <div>
                                   <label className="block font-bold text-slate-700 mb-2">2. Offload Evidence</label>
                                   <div 
                                     onClick={() => initiateUpload('offload')}
                                     className={`w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer touch-manipulation ${offloadPhoto ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}
                                   >
                                       {offloadPhoto ? <span className="text-emerald-600 font-bold">Photo Added</span> : <><Camera /> Take Offload Photo</>}
                                   </div>
                               </div>

                               <div>
                                   <div className="flex justify-between items-center mb-2">
                                       <label className="block font-bold text-slate-700">3. Signed Waybill (POD)</label>
                                       {podUploadStatus === 'uploading' && <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Uploading...</span>}
                                       {podUploadStatus === 'uploaded' && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={12}/> Uploaded</span>}
                                       {podUploadStatus === 'error' && <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertCircle size={12}/> Error</span>}
                                       {podUploadStatus === 'pending' && <span className="text-xs font-bold text-slate-400">Pending</span>}
                                   </div>
                                   <div 
                                     onClick={() => {
                                        if (podUploadStatus !== 'uploading') initiateUpload('pod');
                                     }}
                                     className={`w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer touch-manipulation ${podFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}
                                   >
                                       {podUploadStatus === 'uploading' ? (
                                           <span className="text-blue-600 font-bold flex items-center gap-2"><Loader2 className="animate-spin" /> Processing...</span>
                                       ) : podFile ? (
                                           <span className="text-emerald-600 font-bold">POD Added</span>
                                       ) : (
                                           <><Upload /> Upload Signed POD</>
                                       )}
                                   </div>
                               </div>

                               <button 
                                 onClick={submitDelivery}
                                 disabled={!offloadPhoto || !podFile || !deliveryOtp || isSubmitting}
                                 className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 mt-4 touch-manipulation"
                               >
                                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (isOnline ? 'Complete Delivery' : 'Save Offline & Complete')}
                               </button>
                           </div>
                       )}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default DriverInterface;
