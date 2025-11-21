

import React, { useState } from 'react';
import { UserRole, Listing, QuoteRequest, QuoteOffer, Booking } from '../types';
import { Activity, Banknote, Truck, Users, Clock, AlertTriangle, Calendar, MapPin, Edit2, Trash2, CheckCircle, Info, PlusCircle, Package, FileText, X, MessageSquare, TrendingDown, Percent, TrendingUp, BarChart2, PieChart, Hand, ShieldCheck, Box, Search, Plus, Trash } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, Pie, Cell } from 'recharts';
import CitySearchInput from './CitySearchInput';
import { SERVICE_CATEGORIES, VEHICLE_OPTIONS } from '../constants';

interface DashboardProps {
  role: UserRole;
  isPosting?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  listings?: Listing[];
  bookings?: Booking[];
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
  onPostListing,
  onUpdateListing,
  onDeleteListing,
  onRequestQuote,
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Shipper Quote State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    origin: '',
    destination: '',
    date: '',
    cargoType: '',
    vehicleType: VEHICLE_OPTIONS[0],
    vehicleCustom: '',
    serviceCategory: SERVICE_CATEGORIES[0],
    serviceType: 'Door-to-Door' as 'Door-to-Door' | 'Depot-to-Depot',
    parcels: [{ length: '', width: '', height: '', weight: '', quantity: '1' }]
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

  const handleAddParcel = () => {
      setQuoteForm(prev => ({
          ...prev,
          parcels: [...prev.parcels, { length: '', width: '', height: '', weight: '', quantity: '1' }]
      }));
  };

  const handleRemoveParcel = (index: number) => {
      if (quoteForm.parcels.length > 1) {
          setQuoteForm(prev => ({
              ...prev,
              parcels: prev.parcels.filter((_, i) => i !== index)
          }));
      }
  };

  const handleParcelChange = (index: number, field: string, value: string) => {
      const newParcels: any[] = [...quoteForm.parcels];
      newParcels[index][field] = value;
      setQuoteForm(prev => ({ ...prev, parcels: newParcels }));
  };

  const calculateTotalWeight = () => {
      return quoteForm.parcels.reduce((acc, p) => {
          const w = parseFloat(p.weight) || 0;
          const q = parseInt(p.quantity) || 0;
          return acc + (w * q);
      }, 0);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onRequestQuote) {
          const finalVehicle = quoteForm.vehicleType === 'Other' ? quoteForm.vehicleCustom : quoteForm.vehicleType;
          const totalWeight = calculateTotalWeight();

          const requestData: any = {
              ...quoteForm,
              vehicleType: finalVehicle,
              weight: totalWeight, // Set calculated total weight
              parcels: quoteForm.parcels.map(p => ({
                  length: parseFloat(p.length) || 0,
                  width: parseFloat(p.width) || 0,
                  height: parseFloat(p.height) || 0,
                  weight: parseFloat(p.weight) || 0,
                  quantity: parseInt(p.quantity) || 1
              }))
          };

          onRequestQuote(requestData);
      }
      setIsQuoteModalOpen(false);
      setQuoteForm({
          origin: '',
          destination: '',
          date: '',
          cargoType: '',
          vehicleType: VEHICLE_OPTIONS[0],
          vehicleCustom: '',
          serviceCategory: SERVICE_CATEGORIES[0],
          serviceType: 'Door-to-Door',
          parcels: [{ length: '', width: '', height: '', weight: '', quantity: '1' }]
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
             {/* Form code (same as before) */}
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
                   <input type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" value={postForm.date} onChange={(e) => setPostForm({...postForm, date: e.target.value})} required />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Collection Window</label>
                   <input type="text" placeholder="e.g. 08:00 - 12:00" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" value={postForm.collectionWindow} onChange={(e) => setPostForm({...postForm, collectionWindow: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Window</label>
                   <input type="text" placeholder="e.g. 14:00 - 18:00" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" value={postForm.deliveryWindow} onChange={(e) => setPostForm({...postForm, deliveryWindow: e.target.value})} />
                 </div>
               </div>
               <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Transit Time (SLA)</label>
                   <input type="text" placeholder="e.g., Overnight" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" value={postForm.transitTime} onChange={(e) => setPostForm({...postForm, transitTime: e.target.value})} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                       <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" value={postForm.vehicleSelect} onChange={(e) => setPostForm({...postForm, vehicleSelect: e.target.value})}>
                           {VEHICLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                       </select>
                   </div>
                   {postForm.vehicleSelect === 'Other' && (
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Specify Vehicle</label>
                           <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" value={postForm.vehicleCustom} onChange={(e) => setPostForm({...postForm, vehicleCustom: e.target.value})} required />
                       </div>
                   )}
               </div>
               <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Net Earnings (ZAR)</label>
                    <input type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" value={postForm.baseRate} onChange={(e) => setPostForm({...postForm, baseRate: e.target.value})} required />
                 </div>
               </div>
               <div className="pt-4 flex gap-3">
                 <button type="submit" className="flex-1 bg-brand-900 text-white py-3 rounded-lg font-bold hover:bg-brand-800">{editingId ? 'Update Route' : 'Post Route'}</button>
               </div>
             </form>
          </div>

          {/* List of Posted Routes */}
          <div className="mt-10">
             <h3 className="text-xl font-bold text-slate-800 mb-4">Your Posted Routes</h3>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-600">Route</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Vehicle</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Earnings</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myListings.map(listing => (
                        <tr key={listing.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                              <span className="font-medium text-slate-800">{listing.origin} → {listing.destination}</span>
                          </td>
                          <td className="px-6 py-4">{listing.vehicleType}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600">R {listing.baseRate.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleEdit(listing)} className="p-1.5 text-slate-400 hover:text-brand-600"><Edit2 size={16} /></button>
                            <button onClick={(e) => handleDelete(listing.id, e)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 </div>
             </div>
          </div>
        </div>
      );
    }

    // Carrier Dashboard Main View
    return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Carrier Dashboard</h2>
               <p className="text-slate-500 text-sm">Overview of your fleet operations and earnings.</p>
            </div>
            <button 
              onClick={() => { if(onPostListing) document.getElementById('post-btn')?.click() }} 
              className="bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-brand-800 shadow-sm"
            >
               <PlusCircle size={18} />
               Post Empty Leg
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard title="Active Listings" value={myListings.length.toString()} icon={Truck} color="bg-blue-500" />
           <StatCard title="Active Jobs" value={activeJobs.length.toString()} icon={Package} color="bg-emerald-500" />
           <StatCard title="Est. Earnings" value={`R ${totalRevenue.toLocaleString()}`} icon={Banknote} color="bg-purple-500" />
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Your Active Listings</h3>
            </div>
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
                        <th className="px-6 py-4 font-semibold text-slate-600">Vehicle</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Net Earnings</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myListings.map(listing => (
                        <tr key={listing.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">{listing.origin} → {listing.destination}</span>
                              <span className="text-xs text-slate-500">{listing.date}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{listing.vehicleType}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600">R {listing.baseRate.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                             <span className={`text-xs font-bold px-2 py-1 rounded ${listing.isBooked ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                 {listing.isBooked ? 'Booked' : 'Active'}
                             </span>
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

  // ----------------- SHIPPER DASHBOARD VIEW -----------------
  
  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Shipper Dashboard</h2>
            <p className="text-slate-500 text-sm">Manage your shipments and request new quotes.</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => document.querySelector<HTMLElement>('button[aria-label="Find Loads"]')?.click()}
               className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50"
             >
                <Search size={18} />
                Find Carrier
             </button>
             <button 
               onClick={() => setIsQuoteModalOpen(true)}
               className="bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-brand-800 shadow-sm"
             >
                <PlusCircle size={18} />
                Request Quote
             </button>
          </div>
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
          <StatCard title="Active Shipments" value={activeShipments.length.toString()} icon={Package} color="bg-purple-500" />
          <StatCard title="Open Requests" value={quoteRequests?.filter(r => r.status === 'Open' && r.shipperId === 's1').length.toString() || '0'} icon={FileText} color="bg-orange-500" />
          <StatCard title="Pending Offers" value={quoteOffers?.filter(o => o.status === 'Pending' && quoteRequests?.find(r => r.id === o.requestId)?.shipperId === 's1').length.toString() || '0'} icon={MessageSquare} color="bg-blue-500" />
        </div>

        {/* Active Shipments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Active Shipments</h3>
                <span className="text-xs text-slate-500">{activeShipments.length} active</span>
            </div>
            {activeShipments.length === 0 ? (
                 <div className="p-12 text-center flex flex-col items-center">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                      <Package size={32} />
                   </div>
                   <h3 className="text-lg font-medium text-slate-700">No active shipments</h3>
                   <p className="text-slate-500 max-w-sm mx-auto mb-6">You don't have any loads in transit right now. Request a quote or browse the marketplace to get started.</p>
                   <button 
                     onClick={() => setIsQuoteModalOpen(true)}
                     className="text-emerald-600 font-bold hover:underline"
                   >
                     Start a new shipment
                   </button>
                 </div>
            ) : (
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-600">Route</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Carrier</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeShipments.map(booking => (
                        <tr key={booking.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="font-medium text-slate-800">{booking.origin} → {booking.destination}</span>
                                <span className="text-xs text-slate-500">{new Date(booking.pickupDate).toLocaleDateString()}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{booking.carrierName}</td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                 booking.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                 booking.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                 'bg-amber-100 text-amber-700'
                             }`}>
                                 {booking.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-700">
                             R {booking.price.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 </div>
            )}
        </div>

        {/* Recent Quote Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">Recent Quote Requests</h3>
                 </div>
                 <div className="p-0">
                     {(!quoteRequests || quoteRequests.filter(r => r.shipperId === 's1').length === 0) ? (
                         <div className="p-6 text-center text-slate-500 text-sm">No requests found.</div>
                     ) : (
                         <div className="divide-y divide-slate-100">
                             {quoteRequests.filter(r => r.shipperId === 's1').slice(0, 3).map(req => {
                                 const offerCount = quoteOffers ? quoteOffers.filter(o => o.requestId === req.id).length : 0;
                                 return (
                                     <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                                         <div>
                                             <p className="font-bold text-slate-800 text-sm">{req.origin} to {req.destination}</p>
                                             <p className="text-xs text-slate-500">{req.vehicleType} • {req.status}</p>
                                         </div>
                                         <div className="text-right">
                                             <span className="block font-bold text-emerald-600 text-sm">{offerCount} Offers</span>
                                             <span className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     )}
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
                    <button 
                      onClick={() => document.querySelector<HTMLElement>('button[aria-label="Requested Quotes"]')?.click()} // Helper to navigate if tab exists but visually hidden in dashboard
                      className="w-full bg-white border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50 text-sm"
                    >
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
                         
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Type</label>
                             <input 
                                type="text" 
                                placeholder="e.g. Palletized Goods, Furniture, Machinery" 
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={quoteForm.cargoType}
                                onChange={(e) => setQuoteForm({...quoteForm, cargoType: e.target.value})}
                                required
                             />
                         </div>
                         
                         {/* Dynamic Parcel List */}
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                             <div className="flex justify-between items-center mb-3">
                                 <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                     <Box size={16} className="text-slate-500" /> Cargo Details
                                 </h4>
                                 <span className="text-xs font-bold text-slate-500">
                                     Total: {calculateTotalWeight().toLocaleString()} kg
                                 </span>
                             </div>
                             
                             <div className="space-y-3">
                                 {quoteForm.parcels.map((parcel, idx) => (
                                     <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-end">
                                         <div className="w-16">
                                             <label className="text-[10px] text-slate-500 font-bold block mb-1">Qty</label>
                                             <input 
                                                 type="number" min="1"
                                                 className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                                 value={parcel.quantity}
                                                 onChange={(e) => handleParcelChange(idx, 'quantity', e.target.value)}
                                                 placeholder="1"
                                             />
                                         </div>
                                         <div className="flex-1 grid grid-cols-3 gap-2">
                                             <div>
                                                 <label className="text-[10px] text-slate-500 font-bold block mb-1">Len (cm)</label>
                                                 <input type="number" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded" placeholder="L" value={parcel.length} onChange={(e) => handleParcelChange(idx, 'length', e.target.value)} />
                                             </div>
                                             <div>
                                                 <label className="text-[10px] text-slate-500 font-bold block mb-1">Wid (cm)</label>
                                                 <input type="number" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded" placeholder="W" value={parcel.width} onChange={(e) => handleParcelChange(idx, 'width', e.target.value)} />
                                             </div>
                                             <div>
                                                 <label className="text-[10px] text-slate-500 font-bold block mb-1">Hgt (cm)</label>
                                                 <input type="number" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded" placeholder="H" value={parcel.height} onChange={(e) => handleParcelChange(idx, 'height', e.target.value)} />
                                             </div>
                                         </div>
                                         <div className="w-24">
                                             <label className="text-[10px] text-slate-500 font-bold block mb-1">Unit Wgt (kg)</label>
                                             <input type="number" className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded" placeholder="Kg" value={parcel.weight} onChange={(e) => handleParcelChange(idx, 'weight', e.target.value)} />
                                         </div>
                                         {quoteForm.parcels.length > 1 && (
                                             <button 
                                                 type="button"
                                                 onClick={() => handleRemoveParcel(idx)}
                                                 className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded mb-0.5"
                                             >
                                                 <Trash size={16} />
                                             </button>
                                         )}
                                     </div>
                                 ))}
                             </div>
                             
                             <button 
                                 type="button"
                                 onClick={handleAddParcel}
                                 className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                             >
                                 <Plus size={14} /> Add Another Item
                             </button>
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