
import React, { useState, useRef, useEffect } from 'react';
import { 
  Truck, 
  Package, 
  ShieldCheck, 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  FileText, 
  User,
  LogOut, 
  Menu,
  X,
  Bot,
  Send,
  MessageSquare,
  Code,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { UserRole, Listing, Dispute, DisputeEvidence, Booking, BookingStatus, QuoteRequest, QuoteOffer, Review } from './types';
import { Dashboard } from './components/Dashboard';
import Marketplace from './components/Marketplace';
import AdminPanel from './components/AdminPanel';
import MyBookings from './components/MyBookings';
import CarrierOnboarding from './components/CarrierOnboarding';
import ShipperOnboarding from './components/ShipperOnboarding';
import QuoteRequests from './components/QuoteRequests';
import ApiIntegration from './components/ApiIntegration';
import { getLogisticsAdvice } from './services/geminiService';
import { MOCK_LISTINGS, MOCK_DISPUTES, MOCK_BOOKINGS, MOCK_QUOTE_REQUESTS } from './constants';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('carrier');
  const [activeTab, setActiveTab] = useState('marketplace');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Centralized Data State
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  
  // Quote System State
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(MOCK_QUOTE_REQUESTS);
  const [quoteOffers, setQuoteOffers] = useState<QuoteOffer[]>([]);

  const [notifications, setNotifications] = useState<{id: number, text: string, time: string}[]>([
    { id: 1, text: "Welcome to FreightConnect!", time: "Just now" }
  ]);

  // Carrier Verification State ('unverified' | 'pending' | 'verified')
  const [carrierStatus, setCarrierStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  // Shipper Verification State
  const [shipperStatus, setShipperStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  
  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string, groundingChunks?: any[]}[]>([
    { role: 'model', text: "Hi! I'm the FreightConnect AI. Ask me about route pricing, document requirements, or vehicle types."}
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handlers
  const handlePostListing = (listing: Listing) => {
    setListings(prev => [listing, ...prev]);
    
    // Simulate System Notification for both Carrier (confirmation) and Shipper (alert)
    const newNotif = {
      id: Date.now(),
      text: `New Load Available: ${listing.origin} to ${listing.destination} (${listing.vehicleType})`,
      time: "Just now"
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateListing = (updatedListing: Listing) => {
    setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
  };

  const handleDeleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const handleBookingStatusUpdate = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updates: Partial<Booking> = { status: newStatus };
        // Automatically place funds on hold if disputed
        if (newStatus === BookingStatus.DISPUTED) {
          updates.paymentStatus = 'Hold';
        }
        return { ...b, ...updates };
      }
      return b;
    }));
    
    // AUTOMATED NOTIFICATIONS REPLACING MESSAGING
    let notifText = `Status Update: Booking #${bookingId.toUpperCase()} is now ${newStatus}.`;
    
    if (newStatus === BookingStatus.COLLECTED) {
       notifText = `Load Collected: Truck is loading at origin for Booking #${bookingId.toUpperCase()}.`;
    } else if (newStatus === BookingStatus.IN_TRANSIT) {
       // Removed real-time tracking implication
       notifText = `Departure Alert: Truck has departed for Booking #${bookingId.toUpperCase()}. Route abstract monitoring active.`;
    } else if (newStatus === BookingStatus.DELIVERED) {
       notifText = `Delivery Completed: POD uploaded for Booking #${bookingId.toUpperCase()}. Please verify to release funds.`;
    } else if (newStatus === BookingStatus.COMPLETED) {
       notifText = `Transaction Closed: Funds released to carrier for Booking #${bookingId.toUpperCase()}.`;
    } else if (newStatus === BookingStatus.DISPUTED) {
       notifText = `Dispute Logged: Payment held for Booking #${bookingId.toUpperCase()} pending resolution.`;
    }

    setNotifications(prev => [{
         id: Date.now(),
         text: notifText,
         time: "Just now"
    }, ...prev]);
  };

  const handleConfirmCollection = (bookingId: string, file: File, isSealed: boolean, sealNumber?: string, location?: {lat: number, lng: number}) => {
      const mockUrl = URL.createObjectURL(file);
      
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { 
          ...b, 
          status: BookingStatus.COLLECTED,
          loadingPhotoUrl: mockUrl,
          truckSealed: isSealed,
          sealNumber: sealNumber,
          collectedAt: new Date().toISOString(),
          collectionLocation: location
        } : b
      ));
      
      // Notify with security details
      setNotifications(prev => [{
        id: Date.now(),
        text: `Load Collected: Cargo loaded${location ? ' & Geo-tagged' : ''} for #${bookingId.toUpperCase()}. ${isSealed ? `Seal #${sealNumber} applied.` : 'No seal applied.'}`,
        time: "Just now"
      }, ...prev]);
  };

  const handleRevealContact = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, contactRevealed: true } : b
    ));
    
    // Log the action
    setNotifications(prev => [{
      id: Date.now(),
      text: `Privacy Alert: Contact details revealed for Booking #${bookingId.toUpperCase()}. This action has been logged.`,
      time: "Just now"
    }, ...prev]);
  };

  const handleAddEvidence = (disputeId: string, file: File) => {
     // In real app, upload to storage first
     const newEvidence: DisputeEvidence = {
       id: Date.now().toString(),
       uploadedBy: role === 'admin' ? 'admin' : (role === 'carrier' ? 'carrier' : 'shipper'), // simplified logic
       uploaderName: role === 'carrier' ? 'Swift Logistics' : 'Acme Supplies',
       fileName: file.name,
       fileUrl: URL.createObjectURL(file),
       fileType: file.type.startsWith('image/') ? 'image' : 'document',
       uploadedAt: new Date().toISOString()
     };

     setDisputes(prev => prev.map(d => {
       if (d.id === disputeId) {
         return { ...d, evidence: [...d.evidence, newEvidence] };
       }
       return d;
     }));
  };
  
  const handleResolveDispute = (disputeId: string) => {
    setDisputes(prev => prev.map(d => 
        d.id === disputeId ? { ...d, status: 'Resolved' } : d
    ));
    setNotifications(prev => [{
        id: Date.now(),
        text: `Dispute ${disputeId} has been marked as resolved.`,
        time: "Just now"
    }, ...prev]);
  };

  const handleVerifyCarrier = (carrierId: string) => {
    // For demo purposes, verifying any carrier in the admin panel sets the current user's status to verified
    setCarrierStatus('verified');
    setNotifications(prev => [{
        id: Date.now(),
        text: `Carrier ${carrierId} has been verified successfully.`,
        time: "Just now"
    }, ...prev]);
  };

  // Mock Complete Delivery with OTP, Photos and POD
  const handleCompleteDelivery = (bookingId: string, podFile: File, signature: string, offloadPhoto: File, location?: {lat: number, lng: number}) => {
      const podUrl = URL.createObjectURL(podFile);
      const offloadUrl = URL.createObjectURL(offloadPhoto);
      
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { 
          ...b, 
          podUrl: podUrl, 
          signatureUrl: signature,
          deliveryPhotoUrl: offloadUrl,
          status: BookingStatus.DELIVERED,
          deliveredAt: new Date().toISOString(),
          deliveryLocation: location
        } : b
      ));
      
      // Notify
      setNotifications(prev => [{
        id: Date.now(),
        text: `Delivery Secured: OTP Verified, Geo-verified, Photos & POD uploaded for Booking #${bookingId.toUpperCase()}.`,
        time: "Just now"
      }, ...prev]);
  };

  const handleVerifyPOD = (bookingId: string) => {
      // Shipper approves delivery -> Release Funds
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: BookingStatus.COMPLETED, paymentStatus: 'Released' } : b
      ));
       setNotifications(prev => [{
        id: Date.now(),
        text: `Payment Released: Funds transferred to carrier for Booking #${bookingId.toUpperCase()}.`,
        time: "Just now"
      }, ...prev]);
  };

  const handleRateBooking = (bookingId: string, review: Review) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        if (role === 'shipper') {
           return { ...b, shipperReview: review };
        } else {
           return { ...b, carrierReview: review };
        }
      }
      return b;
    }));
    
    setNotifications(prev => [{
      id: Date.now(),
      text: `Review submitted for Booking #${bookingId.toUpperCase()}.`,
      time: "Just now"
    }, ...prev]);
  };

  // --- Quote Handlers ---

  const handleRequestQuote = (form: any) => {
    const newRequest: QuoteRequest = {
      id: `qr${Date.now()}`,
      shipperId: 's1',
      shipperName: 'Acme Supplies',
      origin: form.origin,
      destination: form.destination,
      vehicleType: form.vehicleType,
      serviceCategory: form.serviceCategory,
      serviceType: form.serviceType,
      cargoType: form.cargoType,
      weight: parseFloat(form.weight),
      date: form.date,
      status: 'Open',
      createdAt: new Date().toISOString(),
      dimensions: form.dimensions // Capture dimensions from form
    };

    setQuoteRequests(prev => [newRequest, ...prev]);
    setNotifications(prev => [{
      id: Date.now(),
      text: `Quote requested: ${form.origin} to ${form.destination}`,
      time: "Just now"
    }, ...prev]);
  };

  const handleSubmitOffer = (offer: QuoteOffer) => {
    setQuoteOffers(prev => [offer, ...prev]);
    setNotifications(prev => [{
      id: Date.now(),
      text: `Offer sent for request #${offer.requestId.substring(0,6)}...`,
      time: "Just now"
    }, ...prev]);
  };

  const handleAcceptOffer = (offerId: string, addresses?: { collection?: string, delivery?: string }) => {
     const offer = quoteOffers.find(o => o.id === offerId);
     if (!offer) return;

     // 1. Update Offer Status (Accept selected, Decline others)
     setQuoteOffers(prev => prev.map(o => {
       if (o.id === offerId) {
         return { ...o, status: 'Accepted' };
       }
       // Auto-decline other pending offers for the same request
       if (o.requestId === offer.requestId && o.status === 'Pending') {
         return { ...o, status: 'Declined' };
       }
       return o;
     }));
     
     // 2. Update Request Status
     setQuoteRequests(prev => prev.map(r => r.id === offer.requestId ? { ...r, status: 'Booked' } : r));

     // 3. Create Booking with Waybill and OTP
     const request = quoteRequests.find(r => r.id === offer.requestId);
     if (request) {
         const baseRate = offer.amount;
         const price = baseRate * 1.1; // 10% Markup

         const newBooking: Booking = {
             id: `b${Date.now()}`,
             listingId: 'manual', // No listing for quotes
             shipperId: request.shipperId,
             carrierId: offer.carrierId,
             status: BookingStatus.ACCEPTED, // Start as accepted
             paymentStatus: 'Escrow', // FUNDS HELD IN ESCROW
             // Use specific addresses if provided (Door-to-Door), otherwise default to City
             origin: addresses?.collection || request.origin,
             destination: addresses?.delivery || request.destination,
             pickupDate: request.date,
             price: price,
             baseRate: baseRate,
             waybillNumber: `WB-${Date.now().toString().substr(-8)}`,
             deliveryOtp: Math.floor(100000 + Math.random() * 900000).toString(),
             shipperName: request.shipperName,
             carrierName: offer.carrierName
         };
         
         setBookings(prev => [newBooking, ...prev]);

         setNotifications(prev => [{
            id: Date.now(),
            text: `Booking Confirmed: #${newBooking.id} (${newBooking.origin} -> ${newBooking.destination})`,
            time: "Just now"
         }, ...prev]);
     }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsAiLoading(true);

    // Context building
    const context = `User Role: ${role}. Current listings available: ${listings.length}.`;
    
    const response = await getLogisticsAdvice(userMsg, context);
    
    setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text,
        groundingChunks: response.groundingChunks
    }]);
    setIsAiLoading(false);
  };

  const renderContent = () => {
    if (role === 'admin') {
       return <AdminPanel disputes={disputes} onResolveDispute={handleResolveDispute} onVerifyCarrier={handleVerifyCarrier} />;
    }

    if (activeTab === 'dashboard') {
      return (
        <Dashboard 
          role={role} 
          isPosting={false}
          verificationStatus={role === 'carrier' ? carrierStatus : shipperStatus}
          notifications={notifications}
          quoteRequests={quoteRequests}
          quoteOffers={quoteOffers}
          onRequestQuote={handleRequestQuote}
        />
      );
    }

    if (activeTab === 'marketplace') {
      if (role === 'carrier' && carrierStatus !== 'verified') {
         return <CarrierOnboarding onComplete={() => setCarrierStatus('pending')} />;
      }
      return (
        <Marketplace 
          role={role} 
          listings={listings} 
          userEntityId={role === 'carrier' ? 'c1' : 's1'}
        />
      );
    }
    
    if (activeTab === 'post-load') {
       return (
         <Dashboard 
           role={role} 
           isPosting={true} 
           verificationStatus={carrierStatus}
           listings={listings}
           onPostListing={handlePostListing}
           onUpdateListing={handleUpdateListing}
           onDeleteListing={handleDeleteListing}
         />
       );
    }

    if (activeTab === 'bookings') {
       return (
         <MyBookings 
           role={role} 
           disputes={disputes}
           bookings={bookings}
           onAddEvidence={handleAddEvidence}
           onCompleteDelivery={handleCompleteDelivery}
           onVerifyPOD={handleVerifyPOD}
           onUpdateStatus={handleBookingStatusUpdate}
           onRevealContact={handleRevealContact}
           onConfirmCollection={handleConfirmCollection}
           onRateBooking={handleRateBooking}
         />
       );
    }

    if (activeTab === 'quotes') {
        return (
            <QuoteRequests 
               role={role}
               shipperId="s1"
               requests={quoteRequests}
               offers={quoteOffers}
               onSubmitOffer={handleSubmitOffer}
               onAcceptOffer={handleAcceptOffer}
               onDeclineOffer={(id) => {
                   setQuoteOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'Declined' } : o));
               }}
            />
        );
    }

    if (activeTab === 'onboarding') {
       return role === 'carrier' ? 
         <CarrierOnboarding onComplete={() => setCarrierStatus('pending')} /> : 
         <ShipperOnboarding onComplete={() => setShipperStatus('pending')} />;
    }

    if (activeTab === 'api') {
        return <ApiIntegration />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center text-slate-900">
               <Truck size={20} />
             </div>
             FreightConnect
           </div>
           <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400">
             <X size={24} />
           </button>
        </div>

        <div className="px-4 py-2">
          <div className="bg-slate-800 rounded-lg p-1 flex mb-6">
            <button 
              onClick={() => { setRole('shipper'); setActiveTab('dashboard'); }}
              className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${role === 'shipper' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Shipper
            </button>
            <button 
              onClick={() => { setRole('carrier'); setActiveTab('dashboard'); }}
              className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${role === 'carrier' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Carrier
            </button>
             <button 
              onClick={() => { setRole('admin'); setActiveTab('admin'); }}
              className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${role === 'admin' ? 'bg-slate-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Admin
            </button>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {role !== 'admin' && (
            <>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </button>
              
              <button 
                onClick={() => setActiveTab('marketplace')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'marketplace' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Search size={20} />
                {role === 'carrier' ? 'Find Loads' : 'My Listings'}
              </button>

              <button 
                onClick={() => setActiveTab('quotes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'quotes' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <MessageSquare size={20} />
                Quotes
                {quoteOffers.filter(o => o.status === 'Pending').length > 0 && role === 'shipper' && (
                    <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {quoteOffers.filter(o => o.status === 'Pending').length}
                    </span>
                )}
                {quoteRequests.filter(r => r.status === 'Open').length > 0 && role === 'carrier' && (
                    <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {quoteRequests.filter(r => r.status === 'Open').length}
                    </span>
                )}
              </button>

              {role === 'carrier' && (
                <button 
                  onClick={() => setActiveTab('post-load')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'post-load' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <PlusCircle size={20} />
                  Post Empty Leg
                </button>
              )}

              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Package size={20} />
                Active Jobs
                {bookings.filter(b => b.status !== 'Completed').length > 0 && (
                   <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {bookings.filter(b => b.status !== 'Completed').length}
                   </span>
                )}
              </button>

              <button 
                 onClick={() => setActiveTab('api')}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'api' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                 <Code size={20} />
                 API & Webhooks
              </button>
            </>
          )}

          {role === 'admin' && (
             <button 
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <ShieldCheck size={20} />
                Admin Panel
                {disputes.filter(d => d.status === 'Open').length > 0 && (
                   <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {disputes.filter(d => d.status === 'Open').length}
                   </span>
                )}
              </button>
          )}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                   <User size={20} className="text-slate-300" />
                </div>
                <div>
                   <p className="text-sm font-bold text-white">Demo User</p>
                   <p className="text-xs text-slate-400 capitalize">{role} Account</p>
                </div>
             </div>
             {(role === 'carrier' ? carrierStatus : shipperStatus) !== 'verified' && role !== 'admin' && (
                 <button 
                   onClick={() => setActiveTab('onboarding')}
                   className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                 >
                    Verify Account
                 </button>
             )}
          </div>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-2 font-bold text-slate-800">
             <Truck className="text-emerald-600" size={24} />
             FreightConnect
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600">
             <Menu size={24} />
           </button>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
           {renderContent()}
        </div>
      </main>

      {/* AI Assistant Floating Button & Chat */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          {isChatOpen && (
              <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300" style={{height: '500px'}}>
                  <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white/10 rounded-lg">
                              <Bot size={20} className="text-emerald-400" />
                          </div>
                          <div>
                              <h4 className="font-bold text-sm">Logistics AI</h4>
                              <p className="text-[10px] text-slate-400">Powered by Gemini</p>
                          </div>
                      </div>
                      <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                          <X size={18} />
                      </button>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                      {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                                  {msg.text}
                                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-200/50">
                                      <p className="text-[10px] font-bold mb-1 opacity-70">Sources:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {msg.groundingChunks.map((chunk, i) => {
                                          if (chunk.web?.uri) {
                                            return (
                                              <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-black/10 hover:bg-black/20 px-2 py-1 rounded transition-colors text-inherit no-underline">
                                                <ExternalLink size={10} /> {chunk.web.title || 'Link'}
                                              </a>
                                            )
                                          }
                                          return null;
                                        })}
                                      </div>
                                    </div>
                                  )}
                              </div>
                          </div>
                      ))}
                      {isAiLoading && (
                          <div className="flex justify-start">
                              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                              </div>
                          </div>
                      )}
                      <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ask about routes, docs..." 
                        className="flex-1 bg-slate-100 border-transparent focus:bg-white border focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                      />
                      <button 
                        type="submit"
                        disabled={!chatInput.trim() || isAiLoading}
                        className={`p-2.5 rounded-lg text-white transition-all ${!chatInput.trim() ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'}`}
                      >
                          <Send size={18} />
                      </button>
                  </form>
              </div>
          )}
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
          >
            <MessageSquare size={24} />
          </button>
      </div>
    </div>
  );
};

export default App;
