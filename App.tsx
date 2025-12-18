
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
  Wallet
} from 'lucide-react';
import { UserRole, Listing, Dispute, DisputeEvidence, Booking, BookingStatus, PlatformSettings, AuditLogEntry, ShipperProfile } from './types';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import AdminPanel from './components/AdminPanel';
import MyBookings from './components/MyBookings';
import CarrierOnboarding from './components/CarrierOnboarding';
import { getLogisticsAdvice } from './services/geminiService';
import { MOCK_LISTINGS, MOCK_DISPUTES, MOCK_BOOKINGS, MOCK_AUDIT_LOGS, MOCK_SHIPPERS } from './constants';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Platform settings for Owner Control
  const [settings, setSettings] = useState<PlatformSettings>({
    globalMarkupPercent: 15,
    autoReleaseHours: 24,
    isJobPostingEnabled: true,
    isRegistrationOpen: true,
    otpRequiredOnDelivery: true
  });

  // Centralized Data State
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.map(b => ({
    ...b,
    escrowStatus: b.status === BookingStatus.IN_TRANSIT ? 'Secured' : 'Pending',
    waybillId: 'WB-' + b.id.toUpperCase()
  } as Booking)));
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [shippers, setShippers] = useState<ShipperProfile[]>(MOCK_SHIPPERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<{id: number, text: string, time: string}[]>([
    { id: 1, text: "Welcome to FreightConnect!", time: "Just now" }
  ]);

  // Financial State
  const [wallet, setWallet] = useState({
    escrow: 24500,
    available: 12800,
  });

  // Carrier Verification State ('unverified' | 'pending' | 'verified')
  const [carrierStatus, setCarrierStatus] = useState<'unverified' | 'pending' | 'verified'>('verified');
  
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
    setNotifications(prev => [{
      id: Date.now(),
      text: `Empty Leg Posted: ${listing.origin} to ${listing.destination}`,
      time: "Just now"
    }, ...prev]);
  };

  const handleUpdateListing = (updatedListing: Listing) => {
    setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
  };

  const handleDeleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const handleBookingStatusUpdate = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: newStatus} : b));
    if (newStatus === BookingStatus.DELIVERED) {
       setNotifications(prev => [{
         id: Date.now(),
         text: `Job #${bookingId.toUpperCase()} delivered. Waiting for shipper POD verification.`,
         time: "Just now"
       }, ...prev]);
    }
  };

  const handlePayoutRequest = () => {
    if (wallet.available <= 0) return;
    alert(`Payout of R ${wallet.available.toLocaleString()} requested. Funds will reach your bank account in 24-48 hours.`);
    setWallet(prev => ({ ...prev, available: 0 }));
  };

  const handleAddEvidence = (disputeId: string, file: File) => {
     const newEvidence: DisputeEvidence = {
       id: Date.now().toString(),
       uploadedBy: role === 'admin' ? 'admin' : (role === 'carrier' ? 'carrier' : 'shipper'),
       uploaderName: role === 'carrier' ? 'Swift Logistics' : 'Acme Supplies',
       fileName: file.name,
       fileUrl: URL.createObjectURL(file),
       fileType: file.type.startsWith('image/') ? 'image' : 'document',
       uploadedAt: new Date().toISOString()
     };
     setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, evidence: [...d.evidence, newEvidence] } : d));
  };
  
  const handleResolveDispute = (disputeId: string) => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'Resolved' } : d));
    setAuditLogs(prev => [{
      id: 'a-' + Date.now(),
      adminName: 'Owner Admin',
      action: 'Resolved Dispute',
      targetType: 'Booking',
      targetId: disputeId,
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  const handleVerifyCarrier = (carrierId: string) => {
    setCarrierStatus('verified');
    setAuditLogs(prev => [{
      id: 'a-' + Date.now(),
      adminName: 'Owner Admin',
      action: 'Verified Carrier',
      targetType: 'Carrier',
      targetId: carrierId,
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  const handleRequestQuote = (quoteData: any) => {
    const newQuote = {
      ...quoteData,
      id: 'q-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setQuoteRequests(prev => [newQuote, ...prev]);
  };

  const handleCancelQuote = (quoteId: string) => {
    setQuoteRequests(prev => prev.filter(q => q.id !== quoteId));
  };

  const handleUploadPOD = (bookingId: string, file: File) => {
      const mockUrl = URL.createObjectURL(file);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, podUrl: mockUrl, status: BookingStatus.DELIVERED } : b));
  };

  const handleVerifyPOD = (bookingId: string) => {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
          setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: BookingStatus.COMPLETED, escrowStatus: 'Released' } : b));
          setWallet(prev => ({
            escrow: prev.escrow - booking.price,
            available: prev.available + booking.price
          }));
      }
  };

  const handleSettingsUpdate = (newSettings: PlatformSettings) => {
    setSettings(newSettings);
    setAuditLogs(prev => [{
      id: 'a-' + Date.now(),
      adminName: 'Owner Admin',
      action: 'Updated Platform Settings',
      targetType: 'Settings',
      targetId: 'global',
      timestamp: new Date().toISOString()
    }, ...prev]);
    setNotifications(prev => [{ id: Date.now(), text: "Global settings updated.", time: "Just now" }, ...prev]);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsAiLoading(true);
    const context = `Role: ${role}, Status: ${carrierStatus}, Escrow: R${wallet.escrow}, Available: R${wallet.available}`;
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
          listings={listings}
          notifications={notifications}
          quoteRequests={quoteRequests}
          wallet={wallet}
          onPayout={handlePayoutRequest}
          onRequestQuote={handleRequestQuote}
          onCancelQuote={handleCancelQuote}
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
        return <Marketplace 
          listings={listings} 
          role={role}
          onRequestQuote={handleRequestQuote}
        />;
      case 'bookings':
        return <MyBookings 
           role={role} 
           disputes={disputes}
           bookings={bookings}
           onAddEvidence={handleAddEvidence}
           onUploadPOD={handleUploadPOD}
           onVerifyPOD={handleVerifyPOD}
           onUpdateStatus={handleBookingStatusUpdate}
        />;
      case 'admin':
        return <AdminPanel 
            disputes={disputes} 
            listings={listings}
            bookings={bookings}
            shippers={shippers}
            auditLogs={auditLogs}
            settings={settings}
            onUpdateSettings={handleSettingsUpdate}
            onResolveDispute={handleResolveDispute} 
            onVerifyCarrier={handleVerifyCarrier} 
        />;
      case 'onboarding':
        return <CarrierOnboarding onComplete={() => {
           setCarrierStatus('pending');
           setActiveTab('dashboard');
        }} />;
      default:
        return <Dashboard role={role} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      <div className="md:hidden bg-brand-900 text-white p-4 flex justify-between items-center z-50 sticky top-0 shadow-md">
        <div className="flex items-center gap-2">
          <Truck size={24} className="text-emerald-400" />
          <h1 className="font-bold text-xl tracking-tight">FreightConnect</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-brand-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-brand-800 hidden md:flex items-center gap-2">
           <Truck size={28} className="text-emerald-400" />
           <span className="text-white font-bold text-xl tracking-tight">FreightConnect</span>
        </div>

        <div className="p-6 bg-brand-800/50 mb-2">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {role === 'admin' ? 'AD' : (role === 'carrier' ? 'SL' : 'AS')}
              </div>
              <div>
                <p className="text-white font-bold text-sm truncate max-w-[120px]">{role === 'admin' ? 'Owner Admin' : (role === 'carrier' ? 'Swift Logistics' : 'Acme Supplies')}</p>
                <p className="text-[10px] text-brand-300 uppercase tracking-widest">{role}</p>
              </div>
           </div>
           <div className="flex gap-1">
              <button onClick={() => setRole('carrier')} className={`text-[9px] uppercase font-bold tracking-tighter px-2 py-1 rounded border ${role === 'carrier' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-brand-700 hover:bg-brand-800'}`}>Carrier</button>
              <button onClick={() => setRole('shipper')} className={`text-[9px] uppercase font-bold tracking-tighter px-2 py-1 rounded border ${role === 'shipper' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-brand-700 hover:bg-brand-800'}`}>Shipper</button>
              <button onClick={() => setRole('admin')} className={`text-[9px] uppercase font-bold tracking-tighter px-2 py-1 rounded border ${role === 'admin' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-brand-700 hover:bg-brand-800'}`}>Admin</button>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-brand-800'}`}>
            <LayoutDashboard size={20} /><span className="font-medium">Dashboard</span>
          </button>
          {role === 'carrier' && (
             <button onClick={() => { setActiveTab('post-load'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'post-load' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-brand-800'}`}>
              <PlusCircle size={20} /><span className="font-medium">Post Empty Leg</span>
            </button>
          )}
          <button onClick={() => { setActiveTab('marketplace'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'marketplace' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-brand-800'}`}>
            <Search size={20} /><span className="font-medium">{role === 'admin' ? 'Active Listings' : (role === 'carrier' ? 'Market Leads' : 'Find Trucks')}</span>
          </button>
          <button onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-brand-800'}`}>
            <FileText size={20} /><span className="font-medium">{role === 'carrier' ? 'Active Jobs' : 'My Bookings'}</span>
          </button>
          {role === 'admin' && (
             <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-brand-800'}`}>
               <ShieldCheck size={20} /><span className="font-medium">Admin Panel</span>
             </button>
          )}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen bg-slate-50">
         <div className="max-w-7xl mx-auto p-4 md:p-8">
            {renderContent()}
         </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 md:w-96 mb-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
             <div className="bg-brand-900 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2"><Bot size={20} className="text-emerald-400" /><h3 className="font-bold">Logistics AI</h3></div>
                <button onClick={() => setIsChatOpen(false)}><X size={18} /></button>
             </div>
             <div className="h-80 p-4 overflow-y-auto bg-slate-50 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-white border text-slate-700 rounded-bl-none shadow-sm'}`}>
                        {msg.text}
                     </div>
                  </div>
                ))}
                {isAiLoading && <div className="flex justify-start"><div className="bg-white border px-4 py-3 rounded-xl flex gap-1"><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span></div></div>}
             </div>
             <div className="p-3 bg-white border-t flex gap-2">
                <input type="text" placeholder="Ask about routes..." className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                <button onClick={handleSendMessage} disabled={!chatInput.trim() || isAiLoading} className="bg-brand-900 text-white p-2 rounded-lg disabled:bg-slate-300"><Send size={18} /></button>
             </div>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
           {isChatOpen ? <X size={24} /> : <Bot size={28} />}
        </button>
      </div>
    </div>
  );
};

export default App;
