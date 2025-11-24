import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Navigation
} from 'lucide-react';
import { UserRole, Listing, Dispute, DisputeEvidence, Booking, BookingStatus, QuoteRequest, QuoteOffer, Review, ShipmentDocument } from './types';
import { Dashboard } from './components/Dashboard';
import Marketplace from './components/Marketplace';
import AdminPanel from './components/AdminPanel';
import MyBookings from './components/MyBookings';
import CarrierOnboarding from './components/CarrierOnboarding';
import ShipperOnboarding from './components/ShipperOnboarding';
import QuoteRequests from './components/QuoteRequests';
import ApiIntegration from './components/ApiIntegration';
import DriverInterface from './components/DriverInterface';
import { getLogisticsAdvice } from './services/geminiService';
import { MOCK_LISTINGS, MOCK_DISPUTES, MOCK_BOOKINGS, MOCK_QUOTE_REQUESTS } from './constants';

// --- Utility for Persistence ---
function usePersistedState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const App: React.FC = () => {
  // We use persisted state so changes (like driver updates) survive page reloads
  // which is critical for testing "Offline Mode" behavior.
  const [role, setRole] = usePersistedState<UserRole>('fc_role', 'carrier');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Centralized Data State with Persistence
  const [listings, setListings] = usePersistedState<Listing[]>('fc_listings', MOCK_LISTINGS);
  const [bookings, setBookings] = usePersistedState<Booking[]>('fc_bookings', MOCK_BOOKINGS);
  const [disputes, setDisputes] = usePersistedState<Dispute[]>('fc_disputes', MOCK_DISPUTES);
  const [quoteRequests, setQuoteRequests] = usePersistedState<QuoteRequest[]>('fc_quote_requests', MOCK_QUOTE_REQUESTS);
  const [quoteOffers, setQuoteOffers] = useState<QuoteOffer[]>([]);

  // Carrier Route Preferences (Load Matching Algorithm)
  const [preferredLanes, setPreferredLanes] = useState<{origin: string, destination: string}[]>([
    { origin: 'Johannesburg', destination: 'Durban' },
    { origin: 'Cape Town', destination: 'Johannesburg' }
  ]);

  // Notifications State with Audience Targeting
  const [notifications, setNotifications] = useState<{id: number, text: string, time: string, audience?: 'shipper' | 'carrier' | 'all'}[]>([
    { id: 1, text: "Welcome to FreightConnect!", time: "Just now", audience: 'all' }
  ]);

  // Carrier Verification State ('unverified' | 'pending' | 'verified')
  const [carrierStatus, setCarrierStatus] = usePersistedState<'unverified' | 'pending' | 'verified'>('fc_carrier_status', 'unverified');

  // --- AI Chat State ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: 'user' | 'ai', text: string}[]>([
    { sender: 'ai', text: 'Hello! I am your Logistics AI Assistant. Ask me about routes, fuel prices, or regulations.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Handlers ---
  const handlePostListing = (newListing: Listing) => {
    setListings([newListing, ...listings]);
    setNotifications(prev => [{
       id: Date.now(),
       text: `New route posted: ${newListing.origin} to ${newListing.destination}`,
       time: 'Just now',
       audience: 'carrier'
    }, ...prev]);
  };

  const handleUpdateListing = (updatedListing: Listing) => {
    setListings(listings.map(l => l.id === updatedListing.id ? updatedListing : l));
  };

  const handleDeleteListing = (id: string) => {
    setListings(listings.filter(l => l.id !== id));
  };

  const handleBookListing = async (listing: Listing, details: { collection?: string, delivery?: string }, files: File[]) => {
    // Generate simulated Doc URLs
    const uploadedDocs: ShipmentDocument[] = files.map(f => ({
       id: Math.random().toString(36).substr(2,9),
       name: f.name,
       type: f.type,
       url: '#', // In real app, this is storage URL
       uploadedAt: new Date().toISOString(),
       uploadedBy: 'shipper'
    }));

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      listingId: listing.id,
      shipperId: 's1', // Mock
      carrierId: listing.carrierId,
      status: BookingStatus.PENDING, // Changed to Pending for Carrier Accept Flow
      paymentStatus: 'Escrow',
      origin: listing.origin,
      destination: listing.destination,
      pickupDate: listing.date,
      baseRate: listing.baseRate,
      price: listing.price,
      waybillNumber: `WB-${Math.floor(Math.random() * 1000000)}`,
      shipperName: 'Acme Supplies', // Mock
      shipperPhone: '+27 82 555 0101',
      shipperEmail: 'logistics@acme.co.za',
      carrierName: listing.carrierName, // Preserved
      contactRevealed: false,
      shipperDocuments: uploadedDocs,
      // For Door-to-Door, append addresses to notes or separate fields
      // For simplicity in this demo, we'll assume the driver sees these details
    };
    
    setBookings([newBooking, ...bookings]);
    
    // Mark listing as booked
    setListings(listings.map(l => l.id === listing.id ? { ...l, isBooked: true } : l));
    
    setNotifications(prev => [{
       id: Date.now(),
       text: `Booking request sent to ${listing.carrierName}`,
       time: 'Just now',
       audience: 'shipper'
    }, ...prev]);
  };

  const handleRequestQuote = (request: any) => {
      const newRequest: QuoteRequest = {
          id: Math.random().toString(36).substr(2, 9),
          shipperId: 's1',
          shipperName: 'Acme Supplies',
          status: 'Open',
          createdAt: new Date().toISOString(),
          ...request
      };
      setQuoteRequests([newRequest, ...quoteRequests]);
  };

  const handleSubmitOffer = (offer: QuoteOffer) => {
      setQuoteOffers([offer, ...quoteOffers]);
  };

  const handleAcceptOffer = (offerId: string, addresses?: { collection?: string, delivery?: string }) => {
      const offer = quoteOffers.find(o => o.id === offerId);
      const request = quoteRequests.find(r => r.id === offer?.requestId);
      if(offer && request) {
           setQuoteOffers(quoteOffers.map(o => o.id === offerId ? {...o, status: 'Accepted'} : o));
           setQuoteRequests(quoteRequests.map(r => r.id === request.id ? {...r, status: 'Booked'} : r));
           
           // Create Booking from Quote
           const newBooking: Booking = {
              id: Math.random().toString(36).substr(2, 9),
              listingId: 'quote-' + request.id,
              shipperId: request.shipperId,
              carrierId: offer.carrierId,
              status: BookingStatus.ACCEPTED,
              paymentStatus: 'Escrow',
              origin: request.origin,
              destination: request.destination,
              pickupDate: request.date,
              price: offer.amount * 1.1, // with markup
              baseRate: offer.amount,
              waybillNumber: `WB-${Math.floor(Math.random() * 1000000)}`,
              shipperName: request.shipperName,
              carrierName: offer.carrierName,
              contactRevealed: true
           };
           setBookings([newBooking, ...bookings]);
      }
  };

  const handleDeclineOffer = (offerId: string) => {
      setQuoteOffers(quoteOffers.map(o => o.id === offerId ? {...o, status: 'Declined'} : o));
  };

  // --- Driver/Carrier Status Handlers ---

  const handleUpdateStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
  };

  const handleConfirmCollection = async (bookingId: string, file: File, isSealed: boolean, sealNumber?: string, location?: {lat: number, lng: number}) => {
    // Convert to base64 for persistent storage (simulating S3/Firebase Storage)
    const photoUrl = await fileToBase64(file);
    
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: BookingStatus.COLLECTED,
          collectedAt: new Date().toISOString(),
          loadingPhotoUrl: photoUrl,
          truckSealed: isSealed,
          sealNumber: sealNumber,
          collectionLocation: location
        };
      }
      return b;
    }));
  };

  const handleCompleteDelivery = async (bookingId: string, podFile: File, signature: string, offloadPhoto: File, location?: {lat: number, lng: number}) => {
     const podBase64 = await fileToBase64(podFile);
     const offloadBase64 = await fileToBase64(offloadPhoto);

     setBookings(prev => prev.map(b => {
       if (b.id === bookingId) {
         return {
           ...b,
           status: BookingStatus.DELIVERED,
           deliveredAt: new Date().toISOString(),
           podUrl: podBase64,
           deliveryPhotoUrl: offloadBase64,
           signatureUrl: signature, // assuming signature is handled upstream or passed as string
           deliveryLocation: location
         };
       }
       return b;
     }));
  };

  // --- Shipper Verification Handler ---
  const handleVerifyPOD = (bookingId: string) => {
      setBookings(prev => prev.map(b => 
         b.id === bookingId ? { ...b, status: BookingStatus.COMPLETED, paymentStatus: 'Released' } : b
      ));
      setNotifications(prev => [{
          id: Date.now(),
          text: `Payment released for Booking #${bookingId.toUpperCase()}`,
          time: 'Just now',
          audience: 'all'
      }, ...prev]);
  };

  // --- Dispute Handler ---
  const handleResolveDispute = (disputeId: string) => {
      const dispute = disputes.find(d => d.id === disputeId);
      if (dispute) {
          setDisputes(prev => prev.map(d => d.id === disputeId ? {...d, status: 'Resolved'} : d));
          // If dispute resolved, optionally update booking status
          setBookings(prev => prev.map(b => b.id === dispute.bookingId ? {...b, status: BookingStatus.COMPLETED, paymentStatus: 'Released'} : b));
      }
  };

  const handleAddEvidence = async (disputeId: string, file: File) => {
     const fileUrl = await fileToBase64(file);
     const newEvidence: DisputeEvidence = {
         id: Math.random().toString(36).substr(2,9),
         uploadedBy: role === 'shipper' ? 'shipper' : 'carrier',
         uploaderName: role === 'shipper' ? 'Acme Supplies' : 'Swift Logistics',
         fileName: file.name,
         fileUrl: fileUrl,
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

  const handleRateBooking = (bookingId: string, review: Review) => {
      setBookings(prev => prev.map(b => {
          if (b.id === bookingId) {
              if (role === 'shipper') return { ...b, shipperReview: review };
              if (role === 'carrier') return { ...b, carrierReview: review };
          }
          return b;
      }));
  };

  const handleRevealContact = (bookingId: string) => {
      setBookings(prev => prev.map(b => b.id === bookingId ? {...b, contactRevealed: true} : b));
  };

  const handleVerifyCarrier = (carrierId: string) => {
      setCarrierStatus('verified'); // For demo simplicity, verifying updates the current user context
  };

  const handleUploadShipperDoc = async (bookingId: string, file: File) => {
      const docUrl = await fileToBase64(file);
      const newDoc: ShipmentDocument = {
          id: Math.random().toString(36).substr(2,9),
          name: file.name,
          url: docUrl,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'shipper'
      };
      
      setBookings(prev => prev.map(b => {
          if (b.id === bookingId) {
              return { ...b, shipperDocuments: [...(b.shipperDocuments || []), newDoc] };
          }
          return b;
      }));
  };

  const handleAiSend = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiThinking(true);

    // Call Gemini API Service
    const aiResponse = await getLogisticsAdvice(userMsg, `User Role: ${role}`);
    
    setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse.text }]);
    setIsAiThinking(false);
  };

  // --- Render Navigation ---
  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-brand-50 text-brand-900 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      <Icon size={20} className={activeTab === id ? "text-brand-600" : "text-slate-400"} />
      {label}
    </button>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard 
                 role={role} 
                 verificationStatus={carrierStatus}
                 listings={listings} 
                 bookings={bookings}
                 notifications={notifications}
                 quoteRequests={quoteRequests}
                 quoteOffers={quoteOffers}
                 preferredLanes={preferredLanes}
                 onPostListing={handlePostListing}
                 onUpdateListing={handleUpdateListing}
                 onDeleteListing={handleDeleteListing}
                 onRequestQuote={handleRequestQuote}
                 onAcceptOffer={handleAcceptOffer}
                 onDeclineOffer={handleDeclineOffer}
                 onUpdateLanes={setPreferredLanes}
                 onBypassVerification={() => setCarrierStatus('verified')}
               />;
      case 'marketplace':
        return <Marketplace 
                 listings={listings} 
                 role={role} 
                 userEntityId={role === 'carrier' ? 'c1' : undefined}
                 onBookListing={handleBookListing} 
               />;
      case 'quotes':
        return <QuoteRequests 
                 role={role}
                 shipperId={role === 'shipper' ? 's1' : undefined}
                 requests={quoteRequests}
                 offers={quoteOffers}
                 onSubmitOffer={handleSubmitOffer}
                 onAcceptOffer={handleAcceptOffer}
                 onDeclineOffer={handleDeclineOffer}
               />;
      case 'my-bookings':
        return <MyBookings 
                 role={role} 
                 disputes={disputes}
                 bookings={role === 'carrier' ? bookings.filter(b => b.carrierId === 'c1') : bookings.filter(b => b.shipperId === 's1')}
                 onAddEvidence={handleAddEvidence}
                 onCompleteDelivery={handleCompleteDelivery}
                 onVerifyPOD={handleVerifyPOD}
                 onUpdateStatus={handleUpdateStatus}
                 onRevealContact={handleRevealContact}
                 onConfirmCollection={handleConfirmCollection}
                 onRateBooking={handleRateBooking}
                 onUploadShipperDoc={handleUploadShipperDoc}
               />;
      case 'admin':
        return <AdminPanel 
                 disputes={disputes} 
                 onResolveDispute={handleResolveDispute}
                 onVerifyCarrier={handleVerifyCarrier}
               />;
      case 'onboarding':
        return role === 'carrier' 
           ? <CarrierOnboarding onComplete={() => {setCarrierStatus('pending'); setActiveTab('dashboard');}} />
           : <ShipperOnboarding onComplete={() => setActiveTab('dashboard')} />;
      case 'api':
        return <ApiIntegration />;
      case 'driver':
        return <DriverInterface 
                  bookings={bookings.filter(b => b.carrierId === 'c1')} 
                  onUpdateStatus={handleUpdateStatus}
                  onConfirmCollection={handleConfirmCollection}
                  onCompleteDelivery={handleCompleteDelivery}
               />;
      default:
        return <Dashboard role={role} verificationStatus={carrierStatus} />;
    }
  };

  // Driver Interface uses a completely different layout (Mobile First)
  if (activeTab === 'driver' || role === 'driver') {
      return (
          <div className="bg-mainGreen min-h-screen safe-area-top safe-area-bottom">
              <DriverInterface 
                  bookings={bookings.filter(b => b.carrierId === 'c1')} 
                  onUpdateStatus={handleUpdateStatus}
                  onConfirmCollection={handleConfirmCollection}
                  onCompleteDelivery={handleCompleteDelivery}
               />
               <button 
                  onClick={() => {
                      if (role === 'driver') {
                          // Handle logout for driver
                      } else {
                          setActiveTab('dashboard');
                      }
                  }}
                  className="fixed bottom-4 left-4 z-50 p-3 bg-slate-800 text-white rounded-full shadow-lg opacity-50 hover:opacity-100"
               >
                   <LogOut size={16} />
               </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-mainGreen flex font-sans text-slate-900">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-900 p-2 rounded-lg">
              <Truck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">FreightConnect</h1>
              <span className="text-xs text-slate-500 font-medium">Logistics Marketplace</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          <div className="mb-6 px-4">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Switch Role (Demo)</p>
             <div className="flex bg-slate-100 p-1 rounded-lg">
               <button onClick={() => setRole('shipper')} className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${role === 'shipper' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Shipper</button>
               <button onClick={() => setRole('carrier')} className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${role === 'carrier' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Carrier</button>
               <button onClick={() => setRole('admin')} className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${role === 'admin' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Admin</button>
             </div>
          </div>

          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          
          {role === 'shipper' && (
             <>
               <NavItem id="marketplace" label="Find Carriers" icon={Search} />
               <NavItem id="quotes" label="My Requests" icon={FileText} />
               <NavItem id="my-bookings" label="Shipments" icon={Package} />
               <NavItem id="onboarding" label="Profile & KYC" icon={User} />
             </>
          )}

          {role === 'carrier' && (
             <>
               <NavItem id="marketplace" label="Load Board" icon={Search} />
               <NavItem id="quotes" label="Quote Requests" icon={FileText} />
               <NavItem id="my-bookings" label="My Jobs" icon={Truck} />
               <NavItem id="driver" label="Driver App" icon={Navigation} />
               <NavItem id="onboarding" label="Verification" icon={ShieldCheck} />
               <NavItem id="api" label="API Integration" icon={Code} />
             </>
          )}

          {role === 'admin' && (
             <>
               <NavItem id="admin" label="Platform Admin" icon={ShieldCheck} />
               <NavItem id="marketplace" label="Manage Listings" icon={Search} />
             </>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
               {role === 'shipper' ? 'AS' : role === 'carrier' ? 'SL' : 'AD'}
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-bold text-slate-800 truncate">
                   {role === 'shipper' ? 'Acme Supplies' : role === 'carrier' ? 'Swift Logistics' : 'Admin User'}
               </p>
               <p className="text-xs text-slate-500 capitalize">{role} Account</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
             <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex justify-between items-center lg:hidden">
           <div className="flex items-center gap-2">
              <div className="bg-brand-900 p-1.5 rounded-lg">
                <Truck className="text-white" size={18} />
              </div>
              <span className="font-bold text-slate-900">FreightConnect</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
             <Menu size={24} />
           </button>
        </header>
        
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* AI Chat Widget */}
      <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${isChatOpen ? 'w-80 md:w-96' : 'w-auto'}`}>
        {isChatOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
             <div className="bg-slate-900 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                   <Bot size={20} className="text-emerald-400" />
                   <h3 className="font-bold">Logistics AI</h3>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                {chatMessages.map((msg, idx) => (
                   <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                        msg.sender === 'user' 
                          ? 'bg-brand-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                      }`}>
                         {msg.text}
                      </div>
                   </div>
                ))}
                {isAiThinking && (
                   <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 p-3 rounded-xl rounded-tl-none shadow-sm flex gap-1">
                         <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                         <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                         <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                   </div>
                )}
             </div>

             <div className="p-3 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                     placeholder="Ask about routes, docs..."
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && handleAiSend()}
                   />
                   <button 
                     onClick={handleAiSend}
                     className="p-2 bg-brand-900 text-white rounded-lg hover:bg-brand-800"
                   >
                     <Send size={18} />
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-brand-900 text-white p-4 rounded-full shadow-lg hover:bg-brand-800 hover:scale-105 transition-all flex items-center gap-2 group"
          >
             <Bot size={24} className="group-hover:rotate-12 transition-transform" />
             <span className="font-bold pr-2">AI Help</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default App;