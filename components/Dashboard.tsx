
import React, { useState } from 'react';
import { UserRole, Listing, CargoType, Vehicle } from '../types';
import { 
  Activity, Banknote, Truck, Users, Clock, AlertTriangle, AlertCircle, Calendar, MapPin, 
  Edit2, Trash2, CheckCircle, Info, PlusCircle, Package, FileText, X, 
  Trash, ArrowRightLeft, ShieldCheck, Wallet, Download, ExternalLink,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CitySearchInput from './CitySearchInput';

interface DashboardProps {
  role: UserRole;
  isPosting?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  listings?: Listing[];
  notifications?: {id: number, text: string, time: string}[];
  quoteRequests?: any[];
  wallet?: { escrow: number; available: number };
  fleet?: Vehicle[];
  onPayout?: () => void;
  onPostListing?: (listing: Listing) => void;
  onUpdateListing?: (listing: Listing) => void;
  onDeleteListing?: (id: string) => void;
  onRequestQuote?: (quoteData: any) => void;
  onCancelQuote?: (id: string) => void;
}

const data = [
  { name: 'Mon', jobs: 4, revenue: 2400 },
  { name: 'Tue', jobs: 3, revenue: 1398 },
  { name: 'Wed', jobs: 9, revenue: 9800 },
  { name: 'Thu', jobs: 2, revenue: 3908 },
  { name: 'Fri', jobs: 6, revenue: 4800 },
  { name: 'Sat', jobs: 2, revenue: 3800 },
  { name: 'Sun', jobs: 1, revenue: 4300 },
];

const VEHICLE_OPTIONS = ['Flatbed', 'Tautliner', 'Rigid', 'Refrigerated', 'Superlink', 'Pantech', 'Tipper', '8 Ton', '1 Ton'];
const CARGO_OPTIONS: CargoType[] = ['Palletised', 'Loose', 'Refrigerated', 'Hazardous', 'Abnormal', 'Container'];

const StatCard = ({ title, value, icon: Icon, color, subtitle }: { title: string, value: string | number, icon: any, color: string, subtitle?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center relative overflow-hidden">
    <div className={`p-4 rounded-xl ${color} bg-opacity-10 mr-4 text-${color.split('-')[1]}-600`}>
      <Icon size={24} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
  role, 
  verificationStatus, 
  isPosting, 
  listings = [], 
  notifications = [],
  quoteRequests = [],
  wallet = { escrow: 0, available: 0 },
  fleet = [],
  onPayout,
  onPostListing,
  onUpdateListing,
  onDeleteListing,
  onRequestQuote,
  onCancelQuote
}) => {
  const myListings = listings.filter(l => l.carrierId === 'c1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  // Internal view state for carriers when they click "Edit" from main dashboard
  const [internalIsPosting, setInternalIsPosting] = useState(isPosting || false);

  const [postForm, setPostForm] = useState({
    origin: '',
    destination: '',
    date: '',
    vehicleType: 'Flatbed',
    cargoType: 'Palletised' as CargoType,
    serviceType: 'Door-to-Door' as 'Door-to-Door' | 'Depot-to-Depot',
    availabilityType: 'Full' as 'Full' | 'Shared Space',
    spaceDetails: '',
    tons: '',
    pallets: '',
    baseRate: '',
    driverAssistance: false
  });

  const [quoteForm, setQuoteForm] = useState({
    origin: '',
    destination: '',
    date: '',
    cargoDescription: '',
    weightTons: '',
    pallets: ''
  });

  // Capacity Validation Logic
  const getCapacityWarning = () => {
    // Find matching vehicles in fleet for the selected type
    const matchingVehicles = fleet.filter(v => v.type.toLowerCase().includes(postForm.vehicleType.toLowerCase()));
    
    if (matchingVehicles.length === 0) return null;

    // Get max capacities for this type across the fleet
    const maxTons = Math.max(...matchingVehicles.map(v => v.capacityTons));
    const maxPallets = Math.max(...matchingVehicles.map(v => v.capacityPallets));

    const enteredTons = Number(postForm.tons) || 0;
    const enteredPallets = Number(postForm.pallets) || 0;

    if (enteredTons > maxTons) {
      return `Tonnage exceeds your fleet's max capacity for ${postForm.vehicleType} (${maxTons}T).`;
    }
    if (enteredPallets > maxPallets) {
      return `Pallet count exceeds your fleet's max capacity for ${postForm.vehicleType} (${maxPallets} plts).`;
    }

    return null;
  };

  const capacityWarning = getCapacityWarning();

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPostListing) return;
    
    const carrierRate = parseFloat(postForm.baseRate);
    const marketPrice = carrierRate * 1.15; // 15% Platform Markup

    const listingData: Listing = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      carrierId: 'c1',
      carrierName: 'Swift Logistics',
      origin: postForm.origin,
      destination: postForm.destination,
      date: postForm.date,
      vehicleType: postForm.vehicleType,
      cargoType: postForm.cargoType,
      serviceType: postForm.serviceType,
      availableTons: Number(postForm.tons) || 0,
      availablePallets: Number(postForm.pallets) || 0,
      availableDetails: postForm.availabilityType === 'Shared Space' ? postForm.spaceDetails : undefined,
      baseRate: carrierRate,
      price: marketPrice,
      isBooked: false,
      driverAssistance: postForm.driverAssistance
    };

    if (editingId && onUpdateListing) {
      onUpdateListing(listingData);
      setEditingId(null);
    } else {
      onPostListing(listingData);
    }

    setPostForm({ origin: '', destination: '', date: '', vehicleType: 'Flatbed', cargoType: 'Palletised', serviceType: 'Door-to-Door', availabilityType: 'Full', spaceDetails: '', tons: '', pallets: '', baseRate: '', driverAssistance: false });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onRequestQuote) return;
    onRequestQuote(quoteForm);
    setQuoteForm({ origin: '', destination: '', date: '', cargoDescription: '', weightTons: '', pallets: '' });
    setIsQuoteModalOpen(false);
    alert("Quote request successfully broadcasted to carriers.");
  };

  const handleEdit = (route: Listing) => {
    setPostForm({
      origin: route.origin,
      destination: route.destination,
      date: route.date,
      vehicleType: route.vehicleType,
      cargoType: route.cargoType || 'Palletised',
      serviceType: route.serviceType,
      availabilityType: route.availableDetails ? 'Shared Space' : 'Full',
      spaceDetails: route.availableDetails || '',
      tons: route.availableTons.toString(),
      pallets: route.availablePallets.toString(),
      baseRate: route.baseRate.toString(),
      driverAssistance: route.driverAssistance || false
    });
    setEditingId(route.id);
    setInternalIsPosting(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this listing? It will be permanently deleted.")) {
      onDeleteListing?.(id);
    }
  };

  if (role === 'carrier') {
    if (verificationStatus !== 'verified') {
       return (
         <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl mx-auto mt-10">
           <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <ShieldCheck className="text-amber-500" size={40} />
           </div>
           <h2 className="text-2xl font-black text-slate-800 mb-2">Account Verification Pending</h2>
           <p className="text-slate-500 mb-8">Our admin team is reviewing your documents. Once approved, you can start posting loads and accepting bookings.</p>
           <button className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Check Documentation</button>
         </div>
       );
    }

    if (internalIsPosting) {
      return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {editingId ? 'Edit Route' : 'Post Empty Leg'}
              </h2>
              <p className="text-slate-500">Sell your unused truck space to local shippers.</p>
            </div>
            <button onClick={() => setInternalIsPosting(false)} className="text-slate-400 hover:text-slate-600 font-medium">Back to Dashboard</button>
          </div>

          {showSuccess && (
             <div className="bg-emerald-500 text-white p-4 rounded-2xl mb-8 flex items-center shadow-lg shadow-emerald-500/20 border border-emerald-400 animate-in zoom-in">
               <CheckCircle className="mr-3" size={24} /> 
               <span className="font-bold">Listing Live!</span> It is now visible to all shippers in the marketplace.
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-3xl shadow-sm border p-8 space-y-8">
                  <form onSubmit={handlePostSubmit} className="space-y-8">
                    <section className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-brand-500">1. Route & Schedule</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CitySearchInput label="Origin City" value={postForm.origin} onChange={(val) => setPostForm(prev => ({...prev, origin: val}))} placeholder="Pickup Location" required={true} />
                        <CitySearchInput label="Destination City" value={postForm.destination} onChange={(val) => setPostForm(prev => ({...prev, destination: val}))} placeholder="Drop-off Location" required={true} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Available Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="date" className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={postForm.date} onChange={(e) => setPostForm({...postForm, date: e.target.value})} required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Service Type</label>
                          <select className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={postForm.serviceType} onChange={(e) => setPostForm({...postForm, serviceType: e.target.value as any})}>
                            <option value="Door-to-Door">Door-to-Door (Collect & Deliver)</option>
                            <option value="Depot-to-Depot">Depot-to-Depot (Hub-to-Hub)</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6 border-t pt-8">
                      <h3 className="text-xs font-black uppercase tracking-widest text-brand-500">2. Vehicle & Capacity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Truck Configuration</label>
                          <select className="w-full px-4 py-3 border rounded-xl" value={postForm.vehicleType} onChange={(e) => setPostForm({...postForm, vehicleType: e.target.value})}>
                            {VEHICLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cargo Compatibility</label>
                          <select className="w-full px-4 py-3 border rounded-xl" value={postForm.cargoType} onChange={(e) => setPostForm({...postForm, cargoType: e.target.value as CargoType})}>
                            {CARGO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                           <label className="block text-sm font-bold text-slate-700">Space Utilization</label>
                           {capacityWarning && (
                             <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded-lg font-black flex items-center gap-1 animate-pulse">
                               <AlertTriangle size={12} /> Capacity Warning
                             </span>
                           )}
                        </div>
                        <div className="flex gap-4 mb-4">
                          <button type="button" onClick={() => setPostForm({...postForm, availabilityType: 'Full'})} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${postForm.availabilityType === 'Full' ? 'border-emerald-500 bg-white text-emerald-600 shadow-sm' : 'border-transparent bg-slate-200 text-slate-500'}`}>Full Truck</button>
                          <button type="button" onClick={() => setPostForm({...postForm, availabilityType: 'Shared Space'})} className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${postForm.availabilityType === 'Shared Space' ? 'border-emerald-500 bg-white text-emerald-600 shadow-sm' : 'border-transparent bg-slate-200 text-slate-500'}`}>Shared Space</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Max Weight (Tons)</label>
                             <input type="number" placeholder="0" className={`w-full px-4 py-2 border rounded-lg ${capacityWarning?.includes('Tonnage') ? 'border-amber-400 bg-amber-50' : ''}`} value={postForm.tons} onChange={(e) => setPostForm({...postForm, tons: e.target.value})} />
                           </div>
                           <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Max Pallets</label>
                             <input type="number" placeholder="0" className={`w-full px-4 py-2 border rounded-lg ${capacityWarning?.includes('Pallet') ? 'border-amber-400 bg-amber-50' : ''}`} value={postForm.pallets} onChange={(e) => setPostForm({...postForm, pallets: e.target.value})} />
                           </div>
                        </div>
                        {capacityWarning && (
                          <p className="mt-3 text-xs text-amber-600 font-bold flex items-start gap-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                             <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                             {capacityWarning}
                          </p>
                        )}
                        {postForm.availabilityType === 'Shared Space' && (
                          <div className="mt-4 animate-in slide-in-from-top-2">
                             <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Space Description</label>
                             <input type="text" placeholder="e.g. Left-side deck space, tail-gate access only..." className="w-full px-4 py-2 border rounded-lg" value={postForm.spaceDetails} onChange={(e) => setPostForm({...postForm, spaceDetails: e.target.value})} />
                          </div>
                        )}
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${postForm.driverAssistance ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-emerald-500'}`}>
                           {postForm.driverAssistance && <CheckCircle size={14} className="text-white" />}
                           <input type="checkbox" className="hidden" checked={postForm.driverAssistance} onChange={() => setPostForm({...postForm, driverAssistance: !postForm.driverAssistance})} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Driver will assist with loading/offloading</span>
                      </label>
                    </section>

                    <section className="space-y-6 border-t pt-8">
                       <h3 className="text-xs font-black uppercase tracking-widest text-brand-500">3. Pricing</h3>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Net Rate (Your Earnings)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">R</span>
                            <input type="number" className="w-full pl-10 pr-4 py-4 border rounded-2xl text-xl font-black focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" value={postForm.baseRate} onChange={(e) => setPostForm({...postForm, baseRate: e.target.value})} required />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 font-medium italic">FreightConnect will apply a 15% marketplace markup to this rate for the shipper.</p>
                       </div>
                    </section>

                    <button type="submit" className="w-full py-5 bg-brand-900 text-white rounded-2xl font-black text-lg hover:bg-brand-800 shadow-xl shadow-brand-900/20 transition-all active:scale-95">
                      {editingId ? 'Save Changes' : 'Go Live Now'}
                    </button>
                  </form>
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-brand-900 text-white p-6 rounded-3xl shadow-xl">
                 <h4 className="font-bold mb-4 flex items-center gap-2">
                   <Info size={18} className="text-emerald-400" />
                   Pricing Estimate
                 </h4>
                 <div className="space-y-3">
                   <div className="flex justify-between text-sm opacity-70">
                     <span>Your Earnings:</span>
                     <span>R {Number(postForm.baseRate).toLocaleString() || '0'}</span>
                   </div>
                   <div className="flex justify-between text-sm opacity-70">
                     <span>Platform Markup:</span>
                     <span>R {(Number(postForm.baseRate) * 0.15).toLocaleString() || '0'}</span>
                   </div>
                   <div className="pt-3 border-t border-brand-800 flex justify-between font-black text-lg">
                     <span className="text-emerald-400">Total Shipper Price:</span>
                     <span>R {(Number(postForm.baseRate) * 1.15).toLocaleString() || '0'}</span>
                   </div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4">Your Fleet Capacities</h4>
                <div className="space-y-3">
                  {fleet.length > 0 ? fleet.map(v => (
                    <div key={v.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center text-slate-400"><Truck size={16}/></div>
                        <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{v.type}</p><p className="text-xs font-bold text-slate-800">{v.regNumber}</p></div>
                      </div>
                      <div className="text-right"><p className="text-xs font-black text-slate-800">{v.capacityTons}T</p><p className="text-[9px] font-bold text-slate-400">{v.capacityPallets} plts</p></div>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic">No fleet data available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
             <h3 className="text-xl font-black text-slate-800 mb-6">Active Marketplace Listings</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {myListings.length === 0 ? (
                 <div className="col-span-2 p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400">
                    No active listings. Post an empty leg to start earning.
                 </div>
               ) : (
                 myListings.map(listing => (
                   <div key={listing.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-500 transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1">{listing.date}</p>
                            <h4 className="font-black text-slate-800 text-lg">{listing.origin} → {listing.destination}</h4>
                         </div>
                         <div className="text-right">
                           <p className="font-black text-emerald-600">R {listing.baseRate.toLocaleString()}</p>
                           <p className="text-[9px] text-slate-400 uppercase">Your Net</p>
                         </div>
                      </div>
                      <div className="flex gap-2 mb-6">
                         <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{listing.vehicleType}</span>
                         <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{listing.cargoType}</span>
                         {listing.availableDetails && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Shared</span>}
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-slate-50">
                        <button onClick={() => handleEdit(listing)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 flex items-center justify-center gap-2"><Edit2 size={12}/> Edit</button>
                        <button onClick={() => handleDelete(listing.id)} className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-2"><Trash2 size={12}/> Delete</button>
                      </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Carrier Command Center</h2>
            <p className="text-slate-500 font-medium">Monitoring fleet operations for <span className="text-brand-600 font-bold">Swift Logistics</span></p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm"><Download size={18}/> Export Report</button>
             <button onClick={() => onPayout?.()} className="px-6 py-3 bg-brand-900 text-white rounded-2xl font-black hover:bg-brand-800 flex items-center gap-2 shadow-xl shadow-brand-900/20 active:scale-95 transition-all"><Wallet size={18} className="text-emerald-400"/> Payout</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Funds in Escrow" value={`R ${wallet.escrow.toLocaleString()}`} icon={ShieldCheck} color="bg-indigo-500" subtitle="Pending Delivery Proof" />
          <StatCard title="Available to Withdraw" value={`R ${wallet.available.toLocaleString()}`} icon={Banknote} color="bg-emerald-500" subtitle="Verified PODs" />
          <StatCard title="Active Jobs" value="3" icon={Truck} color="bg-blue-500" subtitle="In-transit tracking" />
          <StatCard title="New Leads" value={quoteRequests.length} icon={Users} color="bg-purple-500" subtitle="Marketplace Requests" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {myListings.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                      <h3 className="font-black text-slate-800 flex items-center gap-2">
                        <Truck size={20} className="text-brand-500" />
                        YOUR ACTIVE LISTINGS
                      </h3>
                      <button onClick={() => setInternalIsPosting(true)} className="text-xs font-black text-brand-600 flex items-center gap-1 hover:underline">
                        + Post New Route
                      </button>
                   </div>
                   <div className="divide-y divide-slate-50">
                      {myListings.map(listing => (
                         <div key={listing.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="space-y-1">
                               <p className="font-black text-slate-800">{listing.origin} → {listing.destination}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{listing.date} • {listing.vehicleType}</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <p className="font-black text-emerald-600">R {listing.baseRate.toLocaleString()}</p>
                               <div className="flex gap-1">
                                  <button onClick={() => handleEdit(listing)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all" title="Edit Listing"><Edit2 size={16}/></button>
                                  <button onClick={() => handleDelete(listing.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete Listing"><Trash2 size={16}/></button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {quoteRequests.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                  <div className="bg-slate-900 p-6 flex justify-between items-center">
                    <h3 className="text-white font-black tracking-wider text-sm flex items-center gap-2">
                      <ArrowRightLeft size={18} className="text-emerald-400" />
                      NEW MARKETPLACE LEADS
                    </h3>
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">ACTIVE NOW</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {quoteRequests.map(q => (
                      <div key={q.id} className="p-6 hover:bg-slate-50 transition-all group flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <h4 className="font-black text-slate-800">{q.origin} → {q.destination}</h4>
                             <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase">{q.pallets} Pallets</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">Pickup: <span className="font-bold text-slate-700">{q.date}</span> • {q.cargoDescription || 'General Cargo'}</p>
                        </div>
                        <button className="bg-brand-900 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-brand-800 shadow-md group-hover:scale-105 transition-all">Submit Quote</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="font-black text-slate-800 tracking-tight">Financial Performance</h3>
                   <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-1.5">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                   </select>
                </div>
                <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} /><Bar dataKey="revenue" fill="#0c4a6e" radius={[10, 10, 0, 0]} barSize={32} /></BarChart></ResponsiveContainer></div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                   <Activity size={18} className="text-blue-500" />
                   LIVE OPERATION FEED
                </h4>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < 3 && <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-100"></div>}
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 text-slate-400">
                         {i === 1 ? <CheckCircle size={20} className="text-emerald-500" /> : <Clock size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-slate-800 truncate">Job #B-22{i} {i === 1 ? 'Delivered' : 'In-Transit'}</p>
                         <p className="text-[10px] text-slate-500 font-medium mt-0.5">JHB to Durban • Driver: M. Nkosi</p>
                         <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{i}0 mins ago</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 mt-3" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100 transition-all">View All Activity</button>
              </div>

              <div className="bg-emerald-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20">
                 <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Carrier Rep Score</p>
                    <h3 className="text-5xl font-black mb-4">4.8<span className="text-2xl opacity-60">/5</span></h3>
                    <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full mb-6">
                       <CheckCircle size={14} /> Top Rated Carrier
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed font-medium">Your account performance is exceptional. You qualify for <span className="underline">Early Payouts</span>.</p>
                 </div>
                 <Activity size={100} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Shipper Dashboard Logic
  return (
    <div className="space-y-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Shipper Dashboard</h2>
            <p className="text-slate-500">Manage your supply chain and active cargo movement.</p>
          </div>
          <button onClick={() => setIsQuoteModalOpen(true)} className="bg-brand-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-brand-900/20 active:scale-95 transition-all">
             <PlusCircle size={20} /> Request Quote
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard title="Active Shipments" value="12" icon={Package} color="bg-indigo-500" />
          <StatCard title="Pending Quotes" value={quoteRequests.length} icon={FileText} color="bg-amber-500" />
          <StatCard title="Total Spend" value="R 125,400" icon={Banknote} color="bg-emerald-500" />
        </div>

        {quoteRequests.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <h3 className="p-6 font-black text-slate-800 border-b border-slate-50 tracking-tight flex items-center gap-2">
              <Clock size={20} className="text-amber-500" />
              ACTIVE QUOTE REQUESTS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    <th className="px-8 py-4">Lanes</th>
                    <th className="px-8 py-4">Preferred Date</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quoteRequests.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 font-black text-slate-800">{q.origin} → {q.destination}</td>
                      <td className="px-8 py-5 text-slate-500 font-medium">{q.date}</td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl font-black uppercase border border-amber-100">Awaiting Carrier Offers</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => onCancelQuote?.(q.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors"><Trash size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
            <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Spot Market Insights (Recently Posted Trucks)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {listings.slice(0, 3).map(l => (
                  <div key={l.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-4">
                           <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg">{l.vehicleType}</span>
                           <span className="text-emerald-600 font-black">R {l.price.toLocaleString()}</span>
                        </div>
                        <h4 className="font-black text-slate-800 text-lg mb-1">{l.origin} → {l.destination}</h4>
                        <p className="text-xs text-slate-500 font-bold mb-4">{l.date}</p>
                     </div>
                     <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 shadow-md">Instant Book</button>
                  </div>
               ))}
            </div>
        </div>

        {isQuoteModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-brand-900 p-10 flex justify-between items-center text-white relative overflow-hidden">
                 <div className="relative z-10">
                   <h3 className="font-black text-3xl mb-2 tracking-tight">Request a Quote</h3>
                   <p className="text-brand-300 text-sm font-medium">Broadcast your load requirements to our network of verified carriers.</p>
                 </div>
                 <button onClick={() => setIsQuoteModalOpen(false)} className="relative z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                   <X size={24} />
                 </button>
                 <Truck size={150} className="absolute -right-10 -bottom-10 opacity-5 -rotate-12" />
              </div>
              <form onSubmit={handleQuoteSubmit} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CitySearchInput label="Pickup City" placeholder="e.g. Johannesburg" value={quoteForm.origin} onChange={(val) => setQuoteForm({...quoteForm, origin: val})} required={true} />
                    <CitySearchInput label="Delivery City" placeholder="e.g. Cape Town" value={quoteForm.destination} onChange={(val) => setQuoteForm({...quoteForm, destination: val})} required={true} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Preferred Loading Date</label><input type="date" className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold" value={quoteForm.date} onChange={(e) => setQuoteForm({...quoteForm, date: e.target.value})} required /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Cargo Description</label><input type="text" placeholder="e.g. 10T Building Materials" className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold" value={quoteForm.cargoDescription} onChange={(e) => setQuoteForm({...quoteForm, cargoDescription: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Est. Weight (Tons)</label><input type="number" placeholder="0" className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl font-bold" value={quoteForm.weightTons} onChange={(e) => setQuoteForm({...quoteForm, weightTons: e.target.value})} /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-2">Pallets</label><input type="number" placeholder="0" className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl font-bold" value={quoteForm.pallets} onChange={(e) => setQuoteForm({...quoteForm, pallets: e.target.value})} /></div>
                </div>
                <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="flex-1 py-4 text-slate-500 font-black text-lg hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                    <button type="submit" className="flex-[2] py-4 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">Send Request</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default Dashboard;
