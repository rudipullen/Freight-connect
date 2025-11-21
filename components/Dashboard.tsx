
import React, { useState } from 'react';
import { UserRole, Listing, QuoteRequest, QuoteOffer } from '../types';
import { Activity, Banknote, Truck, Users, Clock, AlertTriangle, Calendar, MapPin, Edit2, Trash2, CheckCircle, Info, PlusCircle, Package, FileText, X, MessageSquare, TrendingDown, Percent, TrendingUp, BarChart2, PieChart, Hand, ShieldCheck, Box } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, Pie, Cell } from 'recharts';
import CitySearchInput from './CitySearchInput';
import { SERVICE_CATEGORIES, VEHICLE_OPTIONS } from '../constants';

interface DashboardProps {
  role: UserRole;
  isPosting?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  listings?: Listing[];
  notifications?: {id: number, text: string, time: string}[];
  quoteRequests?: QuoteRequest[];
  quoteOffers?: QuoteOffer[];
  onPostListing?: (listing: Listing) => void;
  onUpdateListing?: (listing: Listing) => void;
  onDeleteListing?: (id: string) => void;
  onRequestQuote?: (quote: any) => void;
  onAcceptOffer?: (offerId: string, addresses?: { collection?: string, delivery?: string }) => void;
  onDeclineOffer?: (offerId: string) => void;
}

const revenueData = [
  { name: 'Mon', jobs: 4, revenue: 2400 },
  { name: 'Tue', jobs: 3, revenue: 1398 },
  { name: 'Wed', jobs: 9, revenue: 9800 },
  { name: 'Thu', jobs: 2, revenue: 3908 },
  { name: 'Fri', jobs: 6, revenue: 4800 },
  { name: 'Sat', jobs: 2, revenue: 3800 },
  { name: 'Sun', jobs: 1, revenue: 4300 },
];

const marketPriceData = [
    { day: 'Mon', price: 1200 },
    { day: 'Tue', price: 1150 },
    { day: 'Wed', price: 1100 },
    { day: 'Thu', price: 1180 },
    { day: 'Fri', price: 1250 },
    { day: 'Sat', price: 1300 },
    { day: 'Sun', price: 1350 },
];

const truckUtilizationData = [
    { name: 'Utilized', value: 78, color: '#10b981' },
    { name: 'Idle', value: 22, color: '#e2e8f0' }
];

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
  notifications = [],
  quoteRequests = [],
  quoteOffers = [],
  onPostListing,
  onUpdateListing,
  onDeleteListing,
  onRequestQuote,
}) => {
  // Filter listings for the current carrier (mock ID 'c1' for demo)
  const myListings = listings.filter(l => l.carrierId === 'c1');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Shipper Quote State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    origin: '',
    destination: '',
    date: '',
    cargoType: '',
    weight: '',
    vehicleType: VEHICLE_OPTIONS[0],
    vehicleCustom: '',
    serviceCategory: SERVICE_CATEGORIES[0],
    serviceType: 'Door-to-Door' as 'Door-to-Door' | 'Depot-to-Depot',
    includeDims: false,
    length: '',
    width: '',
    height: ''
  });

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
    includesLoadingAssist: false,
    gitCover: false,
    gitLimit: '',
    baseRate: ''
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPostListing) return;
    
    const finalVehicleType = postForm.vehicleSelect === 'Other' 
      ? postForm.vehicleCustom 
      : postForm.vehicleSelect;

    // Markup Logic: Add 10% to the carrier's base rate
    const carrierRate = parseFloat(postForm.baseRate);
    const markup = STANDARD_MARKUP;
    const marketPrice = carrierRate * (1 + markup);

    if (editingId && onUpdateListing) {
      // Update existing listing
      const existing = listings.find(l => l.id === editingId);
      if (existing) {
        onUpdateListing({
          ...existing,
          origin: postForm.origin,
          destination: postForm.destination,
          date: postForm.date,
          collectionWindow: postForm.collectionWindow,
          deliveryWindow: postForm.deliveryWindow,
          transitTime: postForm.transitTime,
          vehicleType: finalVehicleType,
          serviceCategory: postForm.serviceCategory,
          serviceType: postForm.serviceType,
          availableDetails: postForm.availabilityType === 'Shared Space' ? postForm.spaceDetails : undefined,
          includesLoadingAssist: postForm.includesLoadingAssist,
          gitCover: postForm.gitCover,
          gitLimit: postForm.gitCover ? parseFloat(postForm.gitLimit) : undefined,
          baseRate: carrierRate,
          price: marketPrice
        });
      }
      setEditingId(null);
    } else {
      // Create new listing
      const newRoute: Listing = {
        id: Math.random().toString(36).substr(2, 9),
        carrierId: 'c1', // Mock ID
        carrierName: 'Swift Logistics', // Mock Name
        origin: postForm.origin,
        destination: postForm.destination,
        date: postForm.date,
        collectionWindow: postForm.collectionWindow,
        deliveryWindow: postForm.deliveryWindow,
        transitTime: postForm.transitTime,
        vehicleType: finalVehicleType,
        serviceCategory: postForm.serviceCategory,
        serviceType: postForm.serviceType,
        availableTons: 0, // Default
        availablePallets: 0, // Default
        availableDetails: postForm.availabilityType === 'Shared Space' ? postForm.spaceDetails : undefined,
        includesLoadingAssist: postForm.includesLoadingAssist,
        gitCover: postForm.gitCover,
        gitLimit: postForm.gitCover ? parseFloat(postForm.gitLimit) : undefined,
        baseRate: carrierRate,
        price: marketPrice,
        isBooked: false
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
      includesLoadingAssist: false,
      gitCover: false,
      gitLimit: '',
      baseRate: ''
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onRequestQuote) {
          const finalVehicle = quoteForm.vehicleType === 'Other' ? quoteForm.vehicleCustom : quoteForm.vehicleType;
          
          const requestData: any = {
              ...quoteForm,
              vehicleType: finalVehicle
          };

          if (quoteForm.includeDims && quoteForm.length && quoteForm.width && quoteForm.height) {
              requestData.dimensions = {
                  length: parseFloat(quoteForm.length),
                  width: parseFloat(quoteForm.width),
                  height: parseFloat(quoteForm.height)
              };
          }

          onRequestQuote(requestData);
      }
      setIsQuoteModalOpen(false);
      setQuoteForm({
          origin: '',
          destination: '',
          date: '',
          cargoType: '',
          weight: '',
          vehicleType: VEHICLE_OPTIONS[0],
          vehicleCustom: '',
          serviceCategory: SERVICE_CATEGORIES[0],
          serviceType: 'Door-to-Door',
          includeDims: false,
          length: '',
          width: '',
          height: ''
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEdit = (route: Listing) => {
    const isCustom = !VEHICLE_OPTIONS.includes(route.vehicleType) && route.vehicleType !== 'Other';
    
    setPostForm({
      origin: route.origin,
      destination: route.destination,
      date: route.date,
      collectionWindow: route.collectionWindow || '',
      deliveryWindow: route.deliveryWindow || '',
      transitTime: route.transitTime || '',
      vehicleSelect: isCustom ? 'Other' : route.vehicleType,
      vehicleCustom: isCustom ? route.vehicleType : '',
      serviceCategory: route.serviceCategory || SERVICE_CATEGORIES[2],
      serviceType: route.serviceType || 'Door-to-Door',
      availabilityType: route.availableDetails ? 'Shared Space' : 'Full',
      spaceDetails: route.availableDetails || '',
      includesLoadingAssist: route.includesLoadingAssist || false,
      gitCover: route.gitCover || false,
      gitLimit: route.gitLimit ? route.gitLimit.toString() : '',
      baseRate: route.baseRate.toString()
    });
    setEditingId(route.id);
    setShowSuccess(false);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this listing?')) {
      if (onDeleteListing) onDeleteListing(id);
    }
  };

  // ----------------- ACCESS CONTROL CHECKS -----------------

  if (role === 'carrier') {
    if (verificationStatus !== 'verified') {
       return (
         <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
           <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
           <h2 className="text-xl font-bold text-slate-800 mb-2">Account Verification Required</h2>
           <p className="text-slate-600">Please complete the onboarding process to access your dashboard.</p>
         </div>
       );
    }

    if (isPosting) {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingId ? 'Edit Route' : 'Post Empty Leg'}
            </h2>
          </div>
          
          {showSuccess && (
             <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg mb-6 flex items-center border border-emerald-200 animate-in fade-in slide-in-from-top-4">
               <CheckCircle className="mr-2" size={20} />
               Listing {editingId ? 'updated' : 'posted'} successfully! It is now visible in the marketplace.
             </div>
          )}
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
             <form onSubmit={handlePostSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <CitySearchInput 
                    label="Origin"
                    placeholder="e.g., Johannesburg"
                    value={postForm.origin}
                    onChange={(val) => setPostForm(prev => ({...prev, origin: val}))}
                    required={true}
                 />
                 
                 <CitySearchInput 
                    label="Destination"
                    placeholder="e.g., Cape Town"
                    value={postForm.destination}
                    onChange={(val) => setPostForm(prev => ({...prev, destination: val}))}
                    required={true}
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Date Available</label>
                   <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                     <input 
                       type="date" 
                       className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                       value={postForm.date}
                       onChange={(e) => setPostForm({...postForm, date: e.target.value})}
                       required
                     />
                   </div>
                 </div>

                 {/* Window Inputs */}
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Collection Window</label>
                   <input 
                     type="text" 
                     placeholder="e.g. 08:00 - 12:00"
                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     value={postForm.collectionWindow}
                     onChange={(e) => setPostForm({...postForm, collectionWindow: e.target.value})}
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Window</label>
                   <input 
                     type="text" 
                     placeholder="e.g. 14:00 - 18:00"
                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     value={postForm.deliveryWindow}
                     onChange={(e) => setPostForm({...postForm, deliveryWindow: e.target.value})}
                   />
                 </div>
               </div>

               {/* Transit Time SLA */}
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transit Time (SLA)</label>
                  <input 
                    type="text"
                    placeholder="e.g., Overnight, 2 Days, Same Day"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={postForm.transitTime}
                    onChange={(e) => setPostForm({...postForm, transitTime: e.target.value})}
                  />
                  <p className="text-xs text-slate-500 mt-1">Expected delivery time from collection.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                   <select 
                     className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     value={postForm.vehicleSelect}
                     onChange={(e) => setPostForm({...postForm, vehicleSelect: e.target.value})}
                   >
                     {VEHICLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                 </div>
                 
                 {postForm.vehicleSelect === 'Other' && (
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Specify Vehicle Type</label>
                     <input 
                       type="text"
                       placeholder="Type your vehicle description..."
                       className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                       value={postForm.vehicleCustom}
                       onChange={(e) => setPostForm({...postForm, vehicleCustom: e.target.value})}
                       required
                     />
                   </div>
                 )}
               </div>

                {/* Service Category Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                    <select 
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={postForm.serviceCategory}
                        onChange={(e) => setPostForm({...postForm, serviceCategory: e.target.value})}
                    >
                        {SERVICE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Service Type Section */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Collection Method</label>
                    <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer border border-slate-200 rounded-lg px-4 py-3 hover:bg-slate-50 transition-colors flex-1">
                        <input 
                        type="radio" 
                        name="serviceType" 
                        value="Door-to-Door"
                        checked={postForm.serviceType === 'Door-to-Door'}
                        onChange={() => setPostForm({...postForm, serviceType: 'Door-to-Door'})}
                        className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-slate-800">Collect & Deliver</span>
                            <span className="block text-xs text-slate-500">Door-to-Door Service</span>
                        </div>
                    </label>
                    <label className="flex items-center cursor-pointer border border-slate-200 rounded-lg px-4 py-3 hover:bg-slate-50 transition-colors flex-1">
                        <input 
                        type="radio" 
                        name="serviceType" 
                        value="Depot-to-Depot"
                        checked={postForm.serviceType === 'Depot-to-Depot'}
                        onChange={() => setPostForm({...postForm, serviceType: 'Depot-to-Depot'})}
                        className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                        />
                         <div className="ml-3">
                            <span className="block text-sm font-medium text-slate-800">Depot-to-Depot</span>
                            <span className="block text-xs text-slate-500">Hub-to-Hub Service</span>
                        </div>
                    </label>
                    </div>
                </div>

                {/* Additional Services / Insurance */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Additional Services</label>
                    
                    {/* Loading Assistance */}
                    <label className="flex items-start cursor-pointer border border-slate-200 rounded-lg px-4 py-3 hover:bg-slate-50 transition-colors bg-slate-50">
                        <input 
                            type="checkbox" 
                            className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            checked={postForm.includesLoadingAssist}
                            onChange={(e) => setPostForm({...postForm, includesLoadingAssist: e.target.checked})}
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Users size={16} /> Driver / Crew Assists with Loading
                            </span>
                            <span className="block text-xs text-slate-500">Check this if your price includes manual loading/offloading help.</span>
                        </div>
                    </label>

                    {/* GIT Insurance */}
                    <div className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50">
                        <label className="flex items-start cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                checked={postForm.gitCover}
                                onChange={(e) => setPostForm({...postForm, gitCover: e.target.checked})}
                            />
                            <div className="ml-3">
                                <span className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheck size={16} /> Goods In Transit (GIT) Cover Included
                                </span>
                                <span className="block text-xs text-slate-500">Does your rate include insurance for the goods?</span>
                            </div>
                        </label>
                        
                        {postForm.gitCover && (
                            <div className="mt-3 ml-7 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-xs font-bold text-slate-600 mb-1">Coverage Limit (ZAR)</label>
                                <input 
                                    type="number" 
                                    placeholder="e.g. 500000" 
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={postForm.gitLimit}
                                    onChange={(e) => setPostForm({...postForm, gitLimit: e.target.value})}
                                    required={postForm.gitCover}
                                />
                            </div>
                        )}
                    </div>
                </div>

               {/* Capacity Section */}
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Space Available</label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="availabilityType" 
                        value="Full"
                        checked={postForm.availabilityType === 'Full'}
                        onChange={() => setPostForm({...postForm, availabilityType: 'Full'})}
                        className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">Full Vehicle</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="availabilityType" 
                        value="Shared Space"
                        checked={postForm.availabilityType === 'Shared Space'}
                        onChange={() => setPostForm({...postForm, availabilityType: 'Shared Space'})}
                        className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">Shared Space (Part Load)</span>
                    </label>
                  </div>

                  {postForm.availabilityType === 'Shared Space' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Description of Space</label>
                      <input 
                        type="text"
                        placeholder="e.g., 3 Pallet spaces, 5 meters deck, Half truck..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={postForm.spaceDetails}
                        onChange={(e) => setPostForm({...postForm, spaceDetails: e.target.value})}
                        required
                      />
                    </div>
                  )}
               </div>

               {/* Rate and Markup Section */}
               <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Required Rate (Net Earnings)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">R</span>
                        <input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={postForm.baseRate}
                        onChange={(e) => setPostForm({...postForm, baseRate: e.target.value})}
                        required
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">This is the amount you will be paid.</p>
                 </div>
               </div>

               <div className="pt-4 flex gap-3">
                 {editingId && (
                   <button 
                     type="button"
                     onClick={() => {
                       setEditingId(null);
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
                        includesLoadingAssist: false,
                        gitCover: false,
                        gitLimit: '',
                        baseRate: ''
                       });
                     }}
                     className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200"
                   >
                     Cancel
                   </button>
                 )}
                 <button 
                   type="submit" 
                   className="flex-1 bg-brand-900 text-white py-3 rounded-lg font-bold hover:bg-brand-800 transition-colors flex justify-center items-center gap-2"
                 >
                   {editingId ? 'Update Route' : 'Post Route'}
                   <Truck size={20} />
                 </button>
               </div>
             </form>
          </div>

          {/* List of Posted Routes */}
          <div className="mt-10">
             <h3 className="text-xl font-bold text-slate-800 mb-4">Your Posted Routes</h3>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               {myListings.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">
                   You haven't posted any routes yet.
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-600">Route</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Service & SLA</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Vehicle</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Net Earnings</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myListings.map(listing => (
                        <tr key={listing.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">{listing.origin} → {listing.destination}</span>
                              <span className="text-xs text-slate-500">{listing.date}</span>
                              {(listing.collectionWindow || listing.deliveryWindow) && (
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                    {listing.collectionWindow} {listing.deliveryWindow ? `- ${listing.deliveryWindow}` : ''}
                                </span>
                              )}
                            </div>
                          </td>
                           <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-slate-700">{listing.serviceCategory}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 w-fit">
                                    {listing.serviceType === 'Door-to-Door' ? 'Collect & Deliver' : 'Depot-to-Depot'}
                                </span>
                                {listing.transitTime && (
                                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                                        <Clock size={10} /> SLA: {listing.transitTime}
                                    </span>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full w-fit">{listing.vehicleType}</span>
                                {listing.includesLoadingAssist && (
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                        <Users size={10} /> Driver Assists
                                    </span>
                                )}
                                {listing.gitCover && (
                                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                                        <ShieldCheck size={10} /> GIT: R{listing.gitLimit ? (listing.gitLimit/1000).toFixed(0) + 'k' : 'Included'}
                                    </span>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-emerald-600">R {listing.baseRate.toLocaleString()}</span>
                            <span className="block text-[10px] text-slate-400">Earnings</span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => handleEdit(listing)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => handleDelete(listing.id, e)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 </div>
               )}
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Shipper Dashboard</h2>
          <button 
            onClick={() => setIsQuoteModalOpen(true)}
            className="bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-brand-800 shadow-sm"
          >
             <PlusCircle size={18} />
             Request Quote
          </button>
        </div>

        {showSuccess && (
           <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-2 text-emerald-800 animate-in fade-in slide-in-from-top-2">
               <CheckCircle size={20} />
               <span className="font-medium">Operation successful! Carrier has been notified.</span>
           </div>
        )}

        {notifications.length > 0 && (
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2 flex items-start gap-3">
              <Info className="text-blue-600 mt-0.5" size={18} />
              <div>
                 <h4 className="text-sm font-bold text-blue-800">Marketplace Updates</h4>
                 <ul className="mt-1 space-y-1">
                    {notifications.slice(0,3).map((n) => (
                      <li key={n.id} className="text-xs text-blue-700 flex items-center gap-2">
                         <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                         {n.text} <span className="text-blue-400 opacity-75">- {n.time}</span>
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Bookings" value="5" icon={Package} color="bg-purple-500" />
          <StatCard title="Open Requests" value={quoteRequests.filter(r => r.status === 'Open').length.toString()} icon={FileText} color="bg-orange-500" />
          <StatCard title="Pending Offers" value={quoteOffers.filter(o => o.status === 'Pending').length.toString()} icon={MessageSquare} color="bg-blue-500" />
        </div>

        {/* MARKET STATISTICS FOR CUSTOMERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800">Market Price Trends</h3>
                        <p className="text-xs text-slate-500">Average lane price per ton (ZAR)</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        <TrendingDown size={14} />
                        Prices down 5% this week
                    </div>
                </div>
                <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={marketPriceData}>
                         <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                               <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                         <Tooltip 
                           contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                         />
                         <Area type="monotone" dataKey="price" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4">Market Insights</h3>
                   
                   <div className="mb-4 pb-4 border-b border-slate-50">
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cheapest Day to Ship</p>
                       <p className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                          <Calendar size={20} /> Wednesday
                       </p>
                       <p className="text-xs text-slate-400 mt-1">Approx 12% cheaper than Monday.</p>
                   </div>
                   
                   <div>
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">Avg Transporter Reliability</p>
                       <p className="text-xl font-bold text-amber-500 flex items-center gap-2">
                          ★ 4.8 / 5.0
                       </p>
                       <p className="text-xs text-slate-400 mt-1">Based on last 30 days of delivery.</p>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Manage Your Quotes</h3>
                    <p className="text-xs text-slate-500 mb-4">View all requests, compare offers, and book in one place.</p>
                    <button className="w-full bg-white border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50 text-sm">
                        View Requested Quotes
                    </button>
                </div>
            </div>
        </div>

        {/* Request Quote Modal */}
        {isQuoteModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Request a Quote</h3>
                        <button onClick={() => setIsQuoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleQuoteSubmit} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <CitySearchInput 
                                label="Origin"
                                placeholder="Start location..."
                                value={quoteForm.origin}
                                onChange={(val) => setQuoteForm({...quoteForm, origin: val})}
                                required
                             />
                             <CitySearchInput 
                                label="Destination"
                                placeholder="End location..."
                                value={quoteForm.destination}
                                onChange={(val) => setQuoteForm({...quoteForm, destination: val})}
                                required
                             />
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Type</label>
                                 <input 
                                    type="text" 
                                    placeholder="e.g. Palletized Goods" 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={quoteForm.cargoType}
                                    onChange={(e) => setQuoteForm({...quoteForm, cargoType: e.target.value})}
                                    required
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Weight (Kgs)</label>
                                 <input 
                                    type="number" 
                                    placeholder="0" 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={quoteForm.weight}
                                    onChange={(e) => setQuoteForm({...quoteForm, weight: e.target.value})}
                                    required
                                 />
                             </div>
                         </div>

                         {/* Dimensions Toggle and Inputs */}
                         <div>
                            <label className="flex items-center cursor-pointer gap-2 mb-3">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    checked={quoteForm.includeDims}
                                    onChange={(e) => setQuoteForm({...quoteForm, includeDims: e.target.checked})}
                                />
                                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Box size={16} /> Include Dimensions (Optional)
                                </span>
                            </label>
                            
                            {quoteForm.includeDims && (
                                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Length (cm)</label>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={quoteForm.length}
                                            onChange={(e) => setQuoteForm({...quoteForm, length: e.target.value})}
                                            required={quoteForm.includeDims}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Width (cm)</label>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={quoteForm.width}
                                            onChange={(e) => setQuoteForm({...quoteForm, width: e.target.value})}
                                            required={quoteForm.includeDims}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Height (cm)</label>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={quoteForm.height}
                                            onChange={(e) => setQuoteForm({...quoteForm, height: e.target.value})}
                                            required={quoteForm.includeDims}
                                        />
                                    </div>
                                </div>
                            )}
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                                 <input 
                                    type="date" 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={quoteForm.date}
                                    onChange={(e) => setQuoteForm({...quoteForm, date: e.target.value})}
                                    required
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                                 <select 
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={quoteForm.vehicleType}
                                    onChange={(e) => setQuoteForm({...quoteForm, vehicleType: e.target.value})}
                                 >
                                     {VEHICLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                 </select>
                             </div>
                         </div>

                         {quoteForm.vehicleType === 'Other' && (
                             <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Specify Vehicle Type</label>
                               <input 
                                 type="text"
                                 placeholder="Type vehicle description..."
                                 className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                 value={quoteForm.vehicleCustom}
                                 onChange={(e) => setQuoteForm({...quoteForm, vehicleCustom: e.target.value})}
                                 required
                               />
                             </div>
                         )}

                        {/* Service Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                            <select 
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={quoteForm.serviceCategory}
                                onChange={(e) => setQuoteForm({...quoteForm, serviceCategory: e.target.value})}
                            >
                                {SERVICE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Collection Method</label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer border border-slate-200 rounded-lg px-4 py-3 hover:bg-slate-50 transition-colors flex-1">
                                    <input 
                                    type="radio" 
                                    name="quoteServiceType" 
                                    value="Door-to-Door"
                                    checked={quoteForm.serviceType === 'Door-to-Door'}
                                    onChange={() => setQuoteForm({...quoteForm, serviceType: 'Door-to-Door'})}
                                    className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-slate-800">Collect & Deliver</span>
                                    </div>
                                </label>
                                <label className="flex items-center cursor-pointer border border-slate-200 rounded-lg px-4 py-3 hover:bg-slate-50 transition-colors flex-1">
                                    <input 
                                    type="radio" 
                                    name="quoteServiceType" 
                                    value="Depot-to-Depot"
                                    checked={quoteForm.serviceType === 'Depot-to-Depot'}
                                    onChange={() => setQuoteForm({...quoteForm, serviceType: 'Depot-to-Depot'})}
                                    className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-slate-800">Depot-to-Depot</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                         <div className="pt-4">
                             <button 
                               type="submit"
                               className="w-full py-3 bg-brand-900 text-white font-bold rounded-lg hover:bg-brand-800 transition-colors flex items-center justify-center gap-2"
                             >
                                 <PlusCircle size={20} />
                                 Send Request to Marketplace
                             </button>
                         </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
