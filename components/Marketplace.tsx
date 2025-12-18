
import React, { useState } from 'react';
import { Search, MapPin, Calendar, Filter, CheckCircle, X, Truck, Info, PlusCircle } from 'lucide-react';
import { MOCK_LISTINGS } from '../constants';
import { Listing, UserRole } from '../types';
import CitySearchInput from './CitySearchInput';

interface Props {
  listings?: Listing[];
  role?: UserRole;
  onRequestQuote?: (data: any) => void;
}

const Marketplace: React.FC<Props> = ({ listings = MOCK_LISTINGS, role, onRequestQuote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  
  const filteredListings = listings.filter(l => 
    l.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = (listing: Listing) => {
    setSelectedListing(listing);
    setIsBooking(true);
    setIsViewingDetails(false);
  };

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
    setIsViewingDetails(true);
  };

  const confirmBooking = () => {
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

      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center animate-in fade-in">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
             <Search size={32} />
           </div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">No matching trucks found</h3>
           <p className="text-slate-500 mb-6 max-w-md mx-auto">We couldn't find any trucks for "{searchTerm}". You can request a custom quote and our carriers will get back to you.</p>
           {role === 'shipper' && (
             <button 
               onClick={() => onRequestQuote?.({ origin: searchTerm, destination: '', date: '', cargoDescription: '' })}
               className="bg-brand-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-800 flex items-center gap-2 mx-auto"
             >
               <PlusCircle size={20} /> Request a Custom Quote
             </button>
           )}
        </div>
      ) : (
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
                    <div><p className="text-xs text-slate-500 uppercase font-bold">Origin</p><p className="font-semibold text-slate-800">{listing.origin}</p></div>
                  </div>
                  <div className="flex items-start relative z-10">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 mr-3 border-2 border-white shadow-sm"></div>
                    <div><p className="text-xs text-slate-500 uppercase font-bold">Destination</p><p className="font-semibold text-slate-800">{listing.destination}</p></div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-slate-500">Date</p><p className="font-medium flex items-center gap-1"><Calendar size={14} /> {listing.date}</p></div>
                  <div><p className="text-slate-500">Capacity</p><p className="font-medium truncate">{listing.availableDetails || `${listing.availableTons}t / ${listing.availablePallets} plts`}</p></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">{listing.carrierName.substring(0,2)}</div>
                    <span className="text-xs font-medium text-slate-600">{listing.carrierName}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleViewDetails(listing)} className="flex-1 border bg-white text-slate-700 px-3 py-2 rounded-lg text-sm font-medium">Details</button>
                  <button onClick={() => handleBook(listing)} className="flex-1 bg-brand-900 text-white px-3 py-2 rounded-lg text-sm font-medium">Book Load</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {isViewingDetails && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
               <h3 className="text-xl font-bold">Load Details</h3>
               <button onClick={() => setIsViewingDetails(false)}><X size={24}/></button>
            </div>
            <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-100 rounded-xl p-6">
                    <p className="font-bold mb-4">Route Info</p>
                    <p>{selectedListing.origin} → {selectedListing.destination}</p>
                    <p className="text-sm text-slate-500 mt-2">{selectedListing.date}</p>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-xl text-center">
                    <p className="text-sm text-slate-500">Total Price</p>
                    <p className="text-3xl font-bold text-emerald-600">R {selectedListing.price.toLocaleString()}</p>
                    <button onClick={() => handleBook(selectedListing)} className="w-full bg-brand-900 text-white py-3 rounded-xl mt-4 font-bold">Book Now</button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBooking && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4">Confirm Booking</h3>
            <div className="bg-slate-50 p-4 rounded-lg mb-6"><p className="font-bold">{selectedListing.origin} → {selectedListing.destination}</p></div>
            <div className="flex gap-3">
              <button onClick={() => setIsBooking(false)} className="flex-1 py-3 text-slate-600">Cancel</button>
              <button onClick={confirmBooking} className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-lg">Pay & Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
