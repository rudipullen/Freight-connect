import React, { useState } from 'react';
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
  Code
} from 'lucide-react';
import { UserRole, Listing, Dispute, DisputeEvidence, Booking, BookingStatus, QuoteRequest, QuoteOffer } from './types';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import AdminPanel from './components/AdminPanel';
import MyBookings from './components/MyBookings';
import CarrierOnboarding from './components/CarrierOnboarding';
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
  
  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hi! I'm the FreightConnect AI. Ask me about route pricing, document requirements, or vehicle types."}
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
          collectedAt: new Date().toLocaleString(),
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
          deliveredAt: new Date().toLocaleString(),
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

  // --- Quote Handlers ---

  const handleRequestQuote = (form: any) => {
    const newRequest: QuoteRequest = {
      id: `qr${Date.now()}`,
      shipperId: 's1',
      shipperName: 'Acme Supplies',
      origin: form.origin,
      destination: form.destination,
      vehicleType: form.vehicleType,
      serviceType: form.serviceType,
      cargoType: form.cargoType,
      weight: parseFloat(form.weight),
      date: form.date,
      status: 'Open',
      createdAt: new Date().toISOString()
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
             baseRate: offer.amount,
             price: offer.amount * 1.1, // Add default markup
             waybillNumber: `WB-${Math.floor(100000 + Math.random() * 900000)}`, // Auto-generate waybill
             deliveryOtp: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit OTP
             
             // Mock Contact Details generated on booking creation
             shipperName: request.shipperName,
             shipperPhone: '+27 82 555 0101', // Mock
             shipperEmail: 'shipper@example.com',
             carrierName: offer.carrierName,
             carrierPhone: '+27 83 555 0202', // Mock
             carrierEmail: 'carrier@example.com',
             contactRevealed: false
         };
         setBookings(prev => [newBooking, ...prev]);
         
         setNotifications(prev => [{
            id: Date.now(),
            text: `Booking Confirmed: Waybill #${newBooking.waybillNumber} generated. Delivery OTP sent to shipper.`,
            time: "Just now"
         }, ...prev]);
     }
  };

  const handleDeclineOffer = (offerId: string) => {
      setQuoteOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Declined' } : o));
  };


  // AI Logic
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsAiLoading(true);

    // Context for AI
    const context = `User Role: ${role}. 
    Current Carrier Status: ${carrierStatus}.
    Available Listings: ${listings.length}.
    List of cities served: ${listings.map(l => l.origin).join(', ')}.
    `;

    const aiResponse = await getLogisticsAdvice(userMsg, context);
    
    setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    setIsAiLoading(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          role={role} 
          verificationStatus={carrierStatus}
          isPosting={false}
          listings={listings}
          notifications={notifications}
          quoteRequests={quoteRequests}
          quoteOffers={quoteOffers}
          onRequestQuote={handleRequestQuote}
        />;
      case 'post-load':
        return <Dashboard 
           role={role} 
           verificationStatus={carrierStatus}
           isPosting={true} 
           listings={listings}
           onPostListing={handlePostListing}
           onUpdateListing={handleUpdateListing}
           onDeleteListing={handleDeleteListing}
        />;
      case 'marketplace':
        return <Marketplace listings={listings} />;
      case 'quotes':
        return <QuoteRequests 
           role={role}
           requests={quoteRequests} 
           offers={quoteOffers}
           shipperId="s1"
           onSubmitOffer={handleSubmitOffer} 
           onAcceptOffer={handleAcceptOffer}
           onDeclineOffer={handleDeclineOffer}
        />;
      case 'bookings':
        return <MyBookings 
           role={role} 
           disputes={disputes}
           bookings={bookings}
           onAddEvidence={handleAddEvidence}
           onCompleteDelivery={handleCompleteDelivery}
           onVerifyPOD={handleVerifyPOD}
           onUpdateStatus={handleBookingStatusUpdate}
           onRevealContact={handleRevealContact}
           onConfirmCollection={handleConfirmCollection}
        />;
      case 'admin':
        return <AdminPanel 
            disputes={disputes} 
            onResolveDispute={handleResolveDispute} 
            onVerifyCarrier={handleVerifyCarrier} 
        />;
      case 'api':
        return <ApiIntegration />;
      case 'onboarding':
        return <CarrierOnboarding onComplete={() => {
           setCarrierStatus('pending');
           setActiveTab('dashboard');
           setNotifications(prev => [{
             id: Date.now(), 
             text: "Application submitted! Verification in progress.", 
             time: "Just now"
           }, ...prev]);
        }} />;
      default:
        return <Dashboard role={role} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-900 text-white p-4 flex justify-between items-center z-50 sticky top-0 shadow-md">
        <div className="flex items-center gap-2">
          <Truck size={24} className="text-emerald-400" />
          <h1 className="font-bold text-xl tracking-tight">FreightConnect</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-brand-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-brand-800 hidden md:flex items-center gap-2">
           <Truck size={28} className="text-emerald-400" />
           <span className="text-white font-bold text-xl tracking-tight">FreightConnect</span>
        </div>

        {/* User Profile Snippet */}
        <div className="p-6 bg-brand-800/50 mb-2">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {role === 'admin' ? 'AD' : (role === 'carrier' ? 'SL' : 'AS')}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{role === 'admin' ? 'Admin User' : (role === 'carrier' ? 'Swift Logistics' : 'Acme Supplies')}</p>
                <p className="text-xs text-brand-300 capitalize">{role} Account</p>
              </div>
           </div>
           
           {/* Role Toggles */}
           <div className="flex gap-1 mb-3">
              <button 
                onClick={() => setRole('carrier')}
                className={`text-[10px] px-2 py-1 rounded border ${role === 'carrier' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-brand-700 hover:bg-brand-800'}`}
              >
                Carrier
              </button>
              <button 
                onClick={() => setRole('shipper')}
                className={`text-[10px] px-2 py-1 rounded border ${role === 'shipper' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-brand-700 hover:bg-brand-800'}`}
              >
                Shipper
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`text-[10px] px-2 py-1 rounded border ${role === 'admin' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-brand-700 hover:bg-brand-800'}`}
              >
                Admin
              </button>
           </div>

           {/* Debug Controls for Testing Verification States */}
           {role === 'carrier' && (
             <div className="pt-3 border-t border-brand-700">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] text-brand-400 uppercase font-bold">Test Status</span>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded-sm capitalize ${
                     carrierStatus === 'verified' ? 'bg-emerald-500 text-white' : 
                     carrierStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                   }`}>
                     {carrierStatus}
                   </span>
                </div>
                <div className="flex gap-1">
                   <button 
                     onClick={() => setCarrierStatus('unverified')}
                     className={`flex-1 text-[10px] px-1 py-1.5 rounded border transition-colors ${carrierStatus === 'unverified' ? 'bg-brand-700 border-brand-600 text-white' : 'border-brand-800 text-brand-400 hover:bg-brand-800'}`}
                     title="Set status to Unverified"
                   >
                     Unverified
                   </button>
                   <button 
                     onClick={() => setCarrierStatus('pending')}
                     className={`flex-1 text-[10px] px-1 py-1.5 rounded border transition-colors ${carrierStatus === 'pending' ? 'bg-brand-700 border-brand-600 text-white' : 'border-brand-800 text-brand-400 hover:bg-brand-800'}`}
                     title="Set status to Pending"
                   >
                     Pending
                   </button>
                   <button 
                     onClick={() => setCarrierStatus('verified')}
                     className={`flex-1 text-[10px] px-1 py-1.5 rounded border transition-colors ${carrierStatus === 'verified' ? 'bg-brand-700 border-brand-600 text-white' : 'border-brand-800 text-brand-400 hover:bg-brand-800'}`}
                     title="Set status to Verified"
                   >
                     Verified
                   </button>
                </div>
             </div>
           )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-brand-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          {role === 'carrier' && (
             <button 
              onClick={() => { setActiveTab('post-load'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'post-load' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-brand-800'}`}
            >
              <PlusCircle size={20} />
              <span className="font-medium">Post Empty Leg</span>
            </button>
          )}

          <button 
            onClick={() => { setActiveTab('marketplace'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'marketplace' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-brand-800'}`}
          >
            <Search size={20} />
            <span className="font-medium">Find Loads</span>
          </button>
          
          {/* Quote Requests Tab - Now visible for both Carriers and Shippers */}
          {(role === 'carrier' || role === 'shipper') && (
             <button 
              onClick={() => { setActiveTab('quotes'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'quotes' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-brand-800'}`}
            >
              <MessageSquare size={20} />
              <span className="font-medium">Requested Quotes</span>
            </button>
          )}

          <button 
            onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'bookings' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-brand-800'}`}
          >
            <FileText size={20} />
            <span className="font-medium">My Bookings</span>
          </button>

          {/* Developer / API Tab */}
          {(role === 'carrier' || role === 'shipper') && (
            <button 
              onClick={() => { setActiveTab('api'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'api' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-brand-800'}`}
            >
              <Code size={20} />
              <span className="font-medium">API Access</span>
            </button>
          )}

          {role === 'carrier' && carrierStatus === 'unverified' && (
             <button 
               onClick={() => { setActiveTab('onboarding'); setIsMobileMenuOpen(false); }}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'onboarding' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-brand-800 text-amber-400'}`}
             >
               <ShieldCheck size={20} />
               <span className="font-medium">Verify Account</span>
             </button>
          )}
          
          {role === 'admin' && (
             <button 
               onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'admin' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-brand-800'}`}
             >
               <ShieldCheck size={20} />
               <span className="font-medium">Admin Portal</span>
             </button>
          )}
        </nav>

        <div className="p-4 border-t border-brand-800">
           <button 
             onClick={() => alert('Logging out...')}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-brand-800 text-slate-400 hover:text-white transition-colors"
           >
             <LogOut size={20} />
             <span className="font-medium">Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Top Navigation for Mobile is covered by fixed sidebar styling above */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-brand-900 hover:bg-brand-800 text-white p-4 rounded-full shadow-lg shadow-brand-900/30 transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <Bot size={24} />
          <span className="font-bold hidden md:inline">AI Assistant</span>
        </button>
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[600px]">
           <div className="bg-brand-900 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                 <Bot size={20} />
                 <h3 className="font-bold">Logistics Assistant</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-300 hover:text-white">
                 <X size={20} />
              </button>
           </div>
           
           <div className="flex-1 p-4 overflow-y-auto h-80 bg-slate-50 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                     msg.role === 'user' 
                       ? 'bg-brand-600 text-white rounded-tr-none' 
                       : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                   }`}>
                      {msg.text}
                   </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                   <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                   </div>
                </div>
              )}
           </div>

           <div className="p-3 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="Ask about rates, routes..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isAiLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-brand-600 hover:bg-brand-50 rounded-lg disabled:opacity-50"
                >
                   <Send size={18} />
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;