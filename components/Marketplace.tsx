
import React, { useState } from 'react';
import { Search, MapPin, Calendar, Filter, CheckCircle, X, Truck, Info, Clock } from 'lucide-react';
import { MOCK_LISTINGS } from '../constants';
import { Listing } from '../types';
import CitySearchInput from './CitySearchInput';

interface Props {
  listings?: Listing[];
}

const Marketplace: React.FC<Props> = ({ listings = MOCK_LISTINGS }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  
  // State for address inputs when booking Door-to-Door
  const [addressDetails, setAddressDetails] = useState({ collection: '', delivery: '' });
  
  const filteredListings = listings.filter(l => 
    l.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = (listing: Listing) => {
    setSelectedListing(listing);
    setAddressDetails({ collection: '', delivery: '' }); // Reset addresses
    setIsBooking(true);
    setIsViewingDetails(false);
  };

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
    setIsViewingDetails(true);
  };

  const confirmBooking = () => {
    // Validation for Door-to-Door
    if (selectedListing?.serviceType === 'Door-to-Door') {
      if (!addressDetails.collection.trim() || !addressDetails.delivery.trim()) {
        alert('Please provide both collection and delivery addresses for this Door-to-Door service.');
        return;
      }
    }

    // In a real app, this would call Firebase functions to create a Stripe Payment Intent
    // and save the addresses to the booking object
    alert(`Booking confirmed! Funds held in escrow for Listing #${selectedListing?.id}`);
    setIsBooking(false);
    setSelectedListing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Find Trucks</h2>
        
        <div className="flex w-full md:w-auto gap-2">
          <CitySearchInput 
             value={searchTerm}
             onChange={setSearchTerm}
             placeholder="Search Origin or Destination..."
             icon={Search}
             className="flex-1 md:w-64"
          />
          <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredListings.map(listing => (
          <div key={listing.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded w-fit">
                    {listing.vehicleType}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded w-fit border border-slate-200">
                    {listing.serviceType === 'Door-to-Door' ? 'Collect & Deliver' : 'Depot-to-Depot'}
                    </span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 font-bold text-lg block">
                    R {listing.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Inc. VAT</span>
                </div>
              </div>
              
              <div className="space-y-4 relative">
                <div className="absolute left-1.5 top-1.5 bottom-8 w-0.5 bg-slate-200"></div>
                
                <div className="flex items-start relative z-10">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 mr-3 border-2 border-white shadow-sm"></div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Origin</p>
                    <p className="font-semibold text-slate-800">{listing.origin}</p>
                    {listing.collectionWindow && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {listing.collectionWindow}
                        </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start relative z-10">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 mr-3 border-2 border-white shadow-sm"></div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Destination</p>
                    <p className="font-semibold text-slate-800">{listing.destination}</p>
                    {listing.deliveryWindow && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {listing.deliveryWindow}
                        </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                   <p className="text-slate-500">Date</p>
                   <p className="font-medium flex items-center gap-1">
                     <Calendar size={14} /> {listing.date}
                   </p>
                </div>
                <div>
                   <p className="text-slate-500">Capacity</p>
                   <p className="font-medium truncate">
                     {listing.availableDetails 
                        ? listing.availableDetails 
                        : `${listing.availableTons}t / ${listing.availablePallets} plts`
                     }
                   </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100">
               <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                    {listing.carrierName.substring(0,2)}
                  </div>
                  <span className="text-xs font-medium text-slate-600">{listing.carrierName}</span>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => handleViewDetails(listing)}
                   className="flex-1 border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                 >
                   View Details
                 </button>
                 <button 
                   onClick={() => handleBook(listing)}
                   className="flex-1 bg-brand-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-800 transition-colors"
                 >
                   Book Load
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {isViewingDetails && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div>
                 <h3 className="text-xl font-bold text-slate-800">Load Details</h3>
                 <p className="text-sm text-slate-500">ID: #{selectedListing.id.toUpperCase()}</p>
               </div>
               <button onClick={() => setIsViewingDetails(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                 <X size={24} />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
               <div className="flex flex-col md:flex-row gap-8">
                  {/* Route Visual */}
                  <div className="flex-1">
                     <div className="bg-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
                        <div className="space-y-8 relative">
                          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-300 border-l border-dashed border-slate-400"></div>
                          
                          <div className="flex items-start relative z-10">
                            <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-sm flex-shrink-0"></div>
                            <div className="ml-4">
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Pickup</p>
                              <p className="text-lg font-bold text-slate-800">{selectedListing.origin}</p>
                              <p className="text-sm text-slate-600">{selectedListing.date}</p>
                              {selectedListing.collectionWindow && (
                                  <p className="text-xs font-bold text-blue-600 mt-1">{selectedListing.collectionWindow}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start relative z-10">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex-shrink-0"></div>
                            <div className="ml-4">
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Delivery</p>
                              <p className="text-lg font-bold text-slate-800">{selectedListing.destination}</p>
                              <p className="text-sm text-slate-600">Est. 1-2 days transit</p>
                              {selectedListing.deliveryWindow && (
                                  <p className="text-xs font-bold text-emerald-600 mt-1">{selectedListing.deliveryWindow}</p>
                              )}
                            </div>
                          </div>
                        </div>
                     </div>

                     <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                           <Truck className="text-blue-600" size={20} />
                           <h4 className="font-bold text-blue-900">Vehicle Specifications</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                              <p className="text-blue-400 text-xs">Type</p>
                              <p className="text-blue-800 font-medium">{selectedListing.vehicleType}</p>
                           </div>
                           <div>
                              <p className="text-blue-400 text-xs">Service</p>
                              <p className="text-blue-800 font-medium">
                                {selectedListing.serviceType === 'Door-to-Door' ? 'Collect & Deliver' : 'Depot-to-Depot'}
                              </p>
                           </div>
                           <div>
                              <p className="text-blue-400 text-xs">Capacity</p>
                              <p className="text-blue-800 font-medium">
                                 {selectedListing.availableTons} Tons / {selectedListing.availablePallets} Pallets
                              </p>
                           </div>
                           <div className="col-span-2">
                              <p className="text-blue-400 text-xs">Space Available</p>
                              <p className="text-blue-800 font-medium">
                                 {selectedListing.availableDetails || 'Full Truck Load Available'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="md:w-72 flex flex-col">
                     <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
                        <p className="text-sm text-slate-500 mb-1">Total Rate</p>
                        <div className="flex items-baseline gap-1">
                          <h3 className="text-3xl font-bold text-emerald-600 mb-1">R {selectedListing.price.toLocaleString()}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Includes VAT</p>
                        
                        <div className="space-y-3 text-sm border-t border-slate-100 pt-3">
                           <div className="flex justify-between">
                              <span className="text-slate-600">Base Rate</span>
                              <span className="font-medium">Included</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-600">Platform Fee</span>
                              <span className="font-medium">Included</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-600">Insurance</span>
                              <span className="font-medium text-emerald-600">Verified</span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Carrier Info</p>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                             {selectedListing.carrierName.substring(0,2)}
                           </div>
                           <div>
                              <p className="font-bold text-slate-800">{selectedListing.carrierName}</p>
                              <p className="text-xs text-emerald-600 flex items-center gap-1">
                                 <CheckCircle size={10} /> Verified Carrier
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="mt-auto">
                        <button 
                          onClick={() => handleBook(selectedListing)}
                          className="w-full bg-brand-900 text-white py-3 rounded-xl font-bold hover:bg-brand-800 transition-colors shadow-lg shadow-brand-900/20"
                        >
                          Book Now
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBooking && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Confirm Booking</h3>
            
            <div className="bg-slate-50 p-4 rounded-lg mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Route</span>
                <span className="font-medium">{selectedListing.origin} → {selectedListing.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Carrier</span>
                <span className="font-medium">{selectedListing.carrierName}</span>
              </div>

              {/* Address Inputs for Door-to-Door */}
              {selectedListing.serviceType === 'Door-to-Door' && (
                 <div className="pt-3 mt-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <MapPin size={12} /> Collection & Delivery
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Collection Address <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                                rows={2}
                                placeholder={`Full address in ${selectedListing.origin}...`}
                                value={addressDetails.collection}
                                onChange={(e) => setAddressDetails({...addressDetails, collection: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Delivery Address <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                                rows={2}
                                placeholder={`Full address in ${selectedListing.destination}...`}
                                value={addressDetails.delivery}
                                onChange={(e) => setAddressDetails({...addressDetails, delivery: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                 </div>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-800 font-bold">Total Escrow Amount</span>
                <div className="text-right">
                   <span className="text-emerald-600 font-bold block">R {selectedListing.price.toLocaleString()}</span>
                   <span className="text-[10px] text-slate-400">Inc. VAT</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 text-center">
              Funds will be held in secure escrow until Proof of Delivery (POD) is verified.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsBooking(false)}
                className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBooking}
                className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors flex justify-center items-center gap-2"
              >
                <CheckCircle size={18} />
                Pay & Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
