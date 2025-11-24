
import React, { useState } from 'react';
import { UserRole, Listing, QuoteRequest, QuoteOffer, Booking } from '../types';
import { Activity, Banknote, Truck, Users, Clock, AlertTriangle, Calendar, MapPin, Edit2, Trash2, CheckCircle, Info, PlusCircle, Package, FileText, X, MessageSquare, TrendingDown, Percent, TrendingUp, BarChart2, PieChart, Hand, ShieldCheck, Box, Search, Plus, Trash, Zap, ChevronLeft, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, Pie, Cell } from 'recharts';
import CitySearchInput from './CitySearchInput';
import { SERVICE_CATEGORIES, VEHICLE_OPTIONS } from '../constants';

export interface Lane {
  origin: string;
  destination: string;
}

interface DashboardProps {
  role: UserRole;
  isPosting?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  listings?: Listing[];
  bookings?: Booking[];
  notifications?: {id: number, text: string, time: string, audience?: 'shipper' | 'carrier' | 'all'}[];
  quoteRequests?: QuoteRequest[];
  quoteOffers?: QuoteOffer[];
  preferredLanes?: Lane[];
  onPostListing?: (listing: Listing) => void;
  onUpdateListing?: (listing: Listing) => void;
  onDeleteListing?: (id: string) => void;
  onRequestQuote?: (quote: any) => void;
  onAcceptOffer?: (offerId: string, addresses?: { collection?: string, delivery?: string }) => void;
  onDeclineOffer?: (offerId: string) => void;
  onUpdateLanes?: (lanes: Lane[]) => void;
  onBypassVerification?: () => void;
}

const STANDARD_MARKUP = 0.10; // 10%

const StatCard = ({ title, value, icon: Icon, color, subtext }: { title: string, value: string, icon: any, color: string, subtext?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
    <div className={`p-4 rounded-full ${color} bg-opacity-10 mr-4`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ 
  role, 
  verificationStatus, 
  isPosting, 
  listings = [], 
  bookings = [],
  notifications = [],
  quoteRequests = [],
  quoteOffers = [],
  preferredLanes = [],
  onPostListing,
  onUpdateListing,
  onDeleteListing,
  onRequestQuote,
  onUpdateLanes,
  onBypassVerification
}) => {
  // Filter listings for the current carrier (mock ID 'c1' for demo)
  const myListings = listings.filter(l => l.carrierId === 'c1');
  const myCarrierBookings = bookings.filter(b => b.carrierId === 'c1');
  
  // Filter for current shipper (mock ID 's1')
  const myShipperBookings = bookings.filter(b => b.shipperId === 's1');
  const activeShipments = myShipperBookings.filter(b => b.status !== 'Completed' && b.status !== 'Delivered');
  
  // Carrier Stats
  const activeJobs = myCarrierBookings.filter(b => b.status !== 'Completed' && b.status !== 'Delivered');
  const totalRevenue = myCarrierBookings.reduce((acc, b) => acc + (b.baseRate || 0), 0);

  // Filter Notifications based on Role
  const displayNotifications = notifications.filter(n => {
     if (!n.audience || n.audience === 'all') return true;
     return n.audience === role;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // State to manage visibility of the Post/Edit form
  const [showPostForm, setShowPostForm] = useState(isPosting || false);

  // Shipper Quote Form State
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    origin: '',
    destination: '',
    date: '',
    vehicleType: VEHICLE_OPTIONS[0],
    serviceCategory: SERVICE_CATEGORIES[2],
    serviceType: 'Door-to-Door',
    cargoType: '',
    weight: ''
  });

  // Carrier Preferences State
  const [newLane, setNewLane] = useState({ origin: '', destination: '' });

  // Carrier Post Load Form
  const [postForm, setPostForm] = useState({
    origin: '',
    destination: '',
    date: '',
    collectionWindow: '', 
    deliveryWindow: '',
    transitTime: '',   
    vehicleSelect: VEHICLE_OPTIONS[0],
    vehicleCustom: '',
    serviceCategory: SERVICE_CATEGORIES[2], // Default to Linehaul
    serviceType: 'Door-to-Door' as 'Door-to-Door' | 'Depot-to-Depot',
    availabilityType: 'Full' as 'Full' | 'Shared Space',
    spaceDetails: '',
    availableTons: '',
    availablePallets: '',
    includesLoadingAssist: false,
    gitCover: false,
    gitLimit: '',
    baseRate: ''
  });

  const handleEditListing = (listing: Listing) => {
    setEditingId(listing.id);
    // Pre-fill form with existing data
    setPostForm({
      origin: listing.origin,
      destination: listing.destination,
      date: listing.date,
      collectionWindow: listing.collectionWindow || '',
      deliveryWindow: listing.deliveryWindow || '',
      transitTime: listing.transitTime || '',
      vehicleSelect: VEHICLE_OPTIONS.includes(listing.vehicleType) ? listing.vehicleType : 'Other',
      vehicleCustom: VEHICLE_OPTIONS.includes(listing.vehicleType) ? '' : listing.vehicleType,
      serviceCategory: listing.serviceCategory,
      serviceType: listing.serviceType,
      availabilityType: listing.availableDetails ? 'Shared Space' : 'Full',
      spaceDetails: listing.availableDetails || '',
      availableTons: listing.availableTons.toString(),
      availablePallets: listing.availablePallets.toString(),
      includesLoadingAssist: listing.includesLoadingAssist,
      gitCover: listing.gitCover,
      gitLimit: listing.gitLimit?.toString() || '',
      baseRate: listing.baseRate.toString()
    });
    setShowPostForm(true);
    // Ensure the form is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPostListing) return;
    
    const finalVehicleType = postForm.vehicleSelect === 'Other' 
      ? postForm.vehicleCustom 
      : postForm.vehicleSelect;

    // Markup Logic: Add 10% to the carrier's base rate
    const carrierRate = parseFloat(postForm.baseRate) || 0;
    const markup = STANDARD_MARKUP;
    const marketPrice = carrierRate * (1 + markup);

    // Common fields
    const listingData = {
      origin: postForm.origin,
      destination: postForm.destination,
      date: postForm.date,
      collectionWindow: postForm.collectionWindow,
      deliveryWindow: postForm.deliveryWindow,
      transitTime: postForm.transitTime,
      vehicleType: finalVehicleType,
      serviceCategory: postForm.serviceCategory,
      serviceType: postForm.serviceType,
      availableTons: parseFloat(postForm.availableTons) || 0,
      availablePallets: parseFloat(postForm.availablePallets) || 0,
      availableDetails: postForm.availabilityType === 'Shared Space' ? postForm.spaceDetails : undefined,
      includesLoadingAssist: postForm.includesLoadingAssist,
      gitCover: postForm.gitCover,
      gitLimit: postForm.gitCover ? (parseFloat(postForm.gitLimit) || 0) : undefined,
      baseRate: carrierRate,
      price: marketPrice
    };

    if (editingId && onUpdateListing) {
      // Update existing listing
      const existing = listings.find(l => l.id === editingId);
      if (existing) {
        const updatedListing = {
          ...existing,
          ...listingData
        };
        onUpdateListing(updatedListing);
      }
      setEditingId(null);
    } else {
      // Create new listing
      const newRoute: Listing = {
        id: Math.random().toString(36).substr(2, 9),
        carrierId: 'c1', // Mock ID
        carrierName: 'Swift Logistics', // Mock Name
        isBooked: false,
        ...listingData
      };
      onPostListing(newRoute);
    }

    // Reset Form
    setPostForm({
      origin: '',
      destination: '',
      date: '',
      collectionWindow: '',
      deliveryWindow: '',
      transitTime: '',
      vehicleSelect: VEHICLE_OPTIONS[0],
      vehicleCustom: '',
      serviceCategory: SERVICE_CATEGORIES[2],
      serviceType: 'Door-to-Door',
      availabilityType: 'Full',
      spaceDetails: '',
      availableTons: '',
      availablePallets: '',
      includesLoadingAssist: false,
      gitCover: false,
      gitLimit: '',
      baseRate: ''
    });
    setShowPostForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRequestQuote) {
      onRequestQuote({
        ...quoteForm,
        weight: parseFloat(quoteForm.weight) || 0,
      });
      
      setShowQuoteForm(false);
      setQuoteForm({
        origin: '',
        destination: '',
        date: '',
        vehicleType: VEHICLE_OPTIONS[0],
        serviceCategory: SERVICE_CATEGORIES[2],
        serviceType: 'Door-to-Door',
        cargoType: '',
        weight: ''
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  if (role === 'carrier') {
    return (
      <div className="space-y-6">
        {/* Verification Banner */}
        {verificationStatus !== 'verified' && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex justify-between items-center">
             <div>
                <h4 className="font-bold text-amber-800">Account Verification Required</h4>
                <p className="text-sm text-amber-700">Complete your profile to start accepting higher value loads.</p>
             </div>
             {onBypassVerification && (
               <button onClick={onBypassVerification} className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded hover:bg-amber-300">
                  Demo: Bypass
               </button>
             )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Carrier Dashboard</h2>
          <button 
            onClick={() => { setShowPostForm(!showPostForm); setEditingId(null); }}
            className="bg-brand-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-800 shadow-md transition-all"
          >
            {showPostForm ? <X size={20} /> : <PlusCircle size={20} />}
            {showPostForm ? 'Cancel Posting' : 'Post Empty Leg'}
          </button>
        </div>

        {/* Post Load Form */}
        {showPostForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Listing' : 'Post New Empty Leg'}</h3>
            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <CitySearchInput 
                    label="Origin City"
                    value={postForm.origin}
                    onChange={(val) => setPostForm({...postForm, origin: val})}
                    placeholder="e.g. Johannesburg"
                    className="z-30"
                    required
                 />
                 <CitySearchInput 
                    label="Destination City"
                    value={postForm.destination}
                    onChange={(val) => setPostForm({...postForm, destination: val})}
                    placeholder="e.g. Cape Town"
                    className="z-20"
                    required
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      value={postForm.date}
                      onChange={(e) => setPostForm({...postForm, date: e.target.value})}
                      required
                    />
                 </div>
                 <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Collection Window</label>
                     <input 
                       type="text" 
                       placeholder="e.g. 08:00 - 12:00"
                       className="w-full p-2 border border-slate-300 rounded-lg"
                       value={postForm.collectionWindow}
                       onChange={(e) => setPostForm({...postForm, collectionWindow: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Delivery Window</label>
                     <input 
                       type="text" 
                       placeholder="e.g. 14:00 - 17:00"
                       className="w-full p-2 border border-slate-300 rounded-lg"
                       value={postForm.deliveryWindow}
                       onChange={(e) => setPostForm({...postForm, deliveryWindow: e.target.value})}
                     />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Vehicle Type</label>
                      <select 
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        value={postForm.vehicleSelect}
                        onChange={(e) => setPostForm({...postForm, vehicleSelect: e.target.value})}
                      >
                         {VEHICLE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                  </div>
                  {postForm.vehicleSelect === 'Other' && (
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Specify Vehicle</label>
                        <input 
                          type="text"
                          placeholder="e.g. Flatbed Trailer"
                          className="w-full p-2 border border-slate-300 rounded-lg"
                          value={postForm.vehicleCustom}
                          onChange={(e) => setPostForm({...postForm, vehicleCustom: e.target.value})}
                          required
                        />
                    </div>
                  )}
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Service Category</label>
                      <select 
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        value={postForm.serviceCategory}
                        onChange={(e) => setPostForm({...postForm, serviceCategory: e.target.value})}
                      >
                         {SERVICE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
              </div>

              {/* Load Availability Selector */}
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Load Type</label>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <label className={`flex-1 border-2 rounded-xl p-3 cursor-pointer transition-all flex items-center gap-3 ${postForm.availabilityType === 'Full' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                          <input 
                              type="radio" 
                              name="availabilityType" 
                              value="Full" 
                              checked={postForm.availabilityType === 'Full'} 
                              onChange={() => setPostForm({...postForm, availabilityType: 'Full'})}
                              className="hidden"
                          />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${postForm.availabilityType === 'Full' ? 'border-emerald-500 bg-white' : 'border-slate-300'}`}>
                              {postForm.availabilityType === 'Full' && <div className="w-3 h-3 rounded-full bg-emerald-500"></div>}
                          </div>
                          <div>
                             <div className="flex items-center gap-2 font-bold">
                                 <Truck size={18} /> Full Truck Load
                             </div>
                             <div className="text-xs opacity-80">Entire vehicle capacity</div>
                          </div>
                      </label>

                      <label className={`flex-1 border-2 rounded-xl p-3 cursor-pointer transition-all flex items-center gap-3 ${postForm.availabilityType === 'Shared Space' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                          <input 
                              type="radio" 
                              name="availabilityType" 
                              value="Shared Space" 
                              checked={postForm.availabilityType === 'Shared Space'} 
                              onChange={() => setPostForm({...postForm, availabilityType: 'Shared Space'})}
                              className="hidden"
                          />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${postForm.availabilityType === 'Shared Space' ? 'border-emerald-500 bg-white' : 'border-slate-300'}`}>
                              {postForm.availabilityType === 'Shared Space' && <div className="w-3 h-3 rounded-full bg-emerald-500"></div>}
                          </div>
                          <div>
                             <div className="flex items-center gap-2 font-bold">
                                 <Box size={18} /> Shared Space / Co-load
                             </div>
                             <div className="text-xs opacity-80">Specific pallet spots or meters</div>
                          </div>
                      </label>
                  </div>

                  {postForm.availabilityType === 'Shared Space' && (
                      <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                          <label className="block text-sm font-bold text-slate-700 mb-1">Space Description</label>
                          <input 
                              type="text" 
                              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="e.g. 6 Pallet spots available, 3m deck space, or 5 tons only"
                              value={postForm.spaceDetails}
                              onChange={(e) => setPostForm({...postForm, spaceDetails: e.target.value})}
                          />
                      </div>
                  )}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-3 text-sm">Capacity & Extras</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Avail. Tons</label>
                          <input type="number" className="w-full p-2 border border-slate-300 rounded" placeholder="0" value={postForm.availableTons} onChange={e => setPostForm({...postForm, availableTons: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Avail. Pallets</label>
                          <input type="number" className="w-full p-2 border border-slate-300 rounded" placeholder="0" value={postForm.availablePallets} onChange={e => setPostForm({...postForm, availablePallets: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Base Rate (Your Earnings)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R</span>
                            <input type="number" className="w-full pl-8 p-2 border border-slate-300 rounded font-bold text-emerald-600" placeholder="0.00" value={postForm.baseRate} onChange={e => setPostForm({...postForm, baseRate: e.target.value})} required />
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={postForm.includesLoadingAssist} onChange={e => setPostForm({...postForm, includesLoadingAssist: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm text-slate-700">Driver Assists Loading</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={postForm.gitCover} onChange={e => setPostForm({...postForm, gitCover: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-slate-700">GIT Insurance Included</span>
                      </label>
                  </div>
                  {postForm.gitCover && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">GIT Limit (ZAR)</label>
                          <input 
                            type="number" 
                            className="w-full p-2 border border-slate-300 rounded max-w-xs" 
                            placeholder="e.g. 1000000"
                            value={postForm.gitLimit}
                            onChange={e => setPostForm({...postForm, gitLimit: e.target.value})}
                          />
                      </div>
                  )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowPostForm(false); setEditingId(null); }}
                    className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-brand-900 text-white font-bold rounded-lg hover:bg-brand-800 shadow-lg"
                  >
                    {editingId ? 'Update Listing' : 'Post Listing'}
                  </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Active Jobs" value={activeJobs.length.toString()} icon={Truck} color="bg-blue-500" />
          <StatCard title="Total Revenue" value={`R ${totalRevenue.toLocaleString()}`} icon={Banknote} color="bg-emerald-500" />
          <StatCard title="My Listings" value={myListings.length.toString()} icon={Box} color="bg-indigo-500" />
          <StatCard title="Platform Rating" value="4.8" icon={Activity} color="bg-amber-500" subtext="Top 10% of carriers" />
        </div>

        {/* Listings Management */}
        <div>
           <h3 className="text-lg font-bold text-slate-800 mb-4">My Active Listings</h3>
           {myListings.length === 0 ? (
             <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-500 mb-4">You haven't posted any empty legs yet.</p>
                <button onClick={() => setShowPostForm(true)} className="text-emerald-600 font-bold hover:underline">Post your first load</button>
             </div>
           ) : (
             <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600">Route</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Vehicle</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Price</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myListings.map(listing => (
                      <tr key={listing.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{listing.origin} <span className="text-slate-400">→</span> {listing.destination}</div>
                          <div className="text-xs text-slate-400">{listing.serviceType}</div>
                        </td>
                        <td className="px-6 py-4">{listing.date}</td>
                        <td className="px-6 py-4">
                           <div className="text-slate-800">{listing.vehicleType}</div>
                           <div className="text-xs text-slate-500">{listing.availableTons}T / {listing.availablePallets} plts</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">R {listing.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                           <button onClick={() => handleEditListing(listing)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                           <button onClick={() => onDeleteListing && onDeleteListing(listing.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )}
        </div>
      </div>
    );
  }

  // Shipper View
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Shipper Dashboard</h2>
          <button 
             onClick={() => setShowQuoteForm(!showQuoteForm)}
             className="bg-brand-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-800 shadow-md transition-all"
          >
             {showQuoteForm ? <X size={20} /> : <PlusCircle size={20} />}
             {showQuoteForm ? 'Cancel' : 'Request Quote'}
          </button>
       </div>

       {/* Quote Request Form */}
       {showQuoteForm && (
         <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-top-4 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Request Transport Quote</h3>
            <p className="text-sm text-slate-500 mb-4">Fill in the details to get competitive quotes from our carrier network.</p>
            <form onSubmit={handleQuoteSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <CitySearchInput 
                    label="Origin City"
                    value={quoteForm.origin}
                    onChange={(val) => setQuoteForm({...quoteForm, origin: val})}
                    placeholder="e.g. Johannesburg"
                    className="z-30"
                    required
                 />
                 <CitySearchInput 
                    label="Destination City"
                    value={quoteForm.destination}
                    onChange={(val) => setQuoteForm({...quoteForm, destination: val})}
                    placeholder="e.g. Durban"
                    className="z-20"
                    required
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Ready Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      value={quoteForm.date}
                      onChange={(e) => setQuoteForm({...quoteForm, date: e.target.value})}
                      required
                    />
                 </div>
                 <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Cargo Type</label>
                      <input 
                        type="text"
                        placeholder="e.g. Pallets, Machinery"
                        className="w-full p-2 border border-slate-300 rounded-lg"
                        value={quoteForm.cargoType}
                        onChange={(e) => setQuoteForm({...quoteForm, cargoType: e.target.value})}
                        required
                      />
                 </div>
                 <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Total Weight (Kg)</label>
                      <input 
                        type="number"
                        placeholder="e.g. 5000"
                        className="w-full p-2 border border-slate-300 rounded-lg"
                        value={quoteForm.weight}
                        onChange={(e) => setQuoteForm({...quoteForm, weight: e.target.value})}
                        required
                      />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Required Vehicle</label>
                      <select 
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        value={quoteForm.vehicleType}
                        onChange={(e) => setQuoteForm({...quoteForm, vehicleType: e.target.value})}
                      >
                         {VEHICLE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Service Category</label>
                      <select 
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        value={quoteForm.serviceCategory}
                        onChange={(e) => setQuoteForm({...quoteForm, serviceCategory: e.target.value})}
                      >
                         {SERVICE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Service Type</label>
                      <select 
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                        value={quoteForm.serviceType}
                        onChange={(e) => setQuoteForm({...quoteForm, serviceType: e.target.value})}
                      >
                         <option value="Door-to-Door">Door-to-Door</option>
                         <option value="Depot-to-Depot">Depot-to-Depot</option>
                      </select>
                  </div>
              </div>

              <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    className="px-8 py-3 bg-brand-900 text-white font-bold rounded-lg hover:bg-brand-800 shadow-lg flex items-center gap-2"
                  >
                    <Send size={18} /> Submit Request
                  </button>
              </div>
            </form>
         </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Active Shipments" value={activeShipments.length.toString()} icon={Package} color="bg-blue-500" />
          <StatCard title="Pending Quotes" value={quoteRequests.filter(q => q.status === 'Open').length.toString()} icon={FileText} color="bg-amber-500" />
          <StatCard title="Total Spent" value="R 45,200" icon={Banknote} color="bg-emerald-500" />
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4">Active Shipments</h3>
          {activeShipments.length === 0 ? (
             <p className="text-slate-500 italic">No active shipments in transit.</p>
          ) : (
             <div className="space-y-4">
                {activeShipments.map(booking => (
                   <div key={booking.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-white rounded-full text-blue-600 shadow-sm">
                              <Truck size={20} />
                           </div>
                           <div>
                              <p className="font-bold text-slate-800">{booking.origin} → {booking.destination}</p>
                              <p className="text-xs text-slate-500">Carrier: {booking.carrierName} • WB: {booking.waybillNumber}</p>
                           </div>
                       </div>
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{booking.status}</span>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

export default Dashboard;
