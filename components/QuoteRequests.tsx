

import React, { useState } from 'react';
import { QuoteRequest, QuoteOffer, UserRole } from '../types';
import { DollarSign, Send, X, CheckCircle, Search, Package, ChevronDown, ChevronUp, CreditCard, MapPin, ShieldCheck, FileText, Percent, Radio, Globe, Clock } from 'lucide-react';

interface QuoteRequestsProps {
  role?: UserRole;
  shipperId?: string;
  requests: QuoteRequest[];
  offers?: QuoteOffer[];
  onSubmitOffer: (offer: QuoteOffer) => void;
  onAcceptOffer?: (offerId: string, addresses?: { collection?: string, delivery?: string }) => void;
  onDeclineOffer?: (offerId: string) => void;
}

const MARKUP_PERCENTAGE = 0.10;

const QuoteRequests: React.FC<QuoteRequestsProps> = ({ 
  role = 'carrier', 
  shipperId, 
  requests, 
  offers = [], 
  onSubmitOffer, 
  onAcceptOffer, 
  onDeclineOffer 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  
  // Carrier Offer State
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerTransitTime, setOfferTransitTime] = useState('');
  
  // Shipper Payment State
  const [paymentOffer, setPaymentOffer] = useState<QuoteOffer | null>(null);
  const [paymentAddress, setPaymentAddress] = useState({ collection: '', delivery: '' });
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Filter Requests based on Role
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.cargoType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (role === 'carrier') {
      // Carriers see ALL open requests
      return req.status === 'Open' && matchesSearch;
    } else {
      // Shippers see ONLY their requests
      return req.shipperId === shipperId && matchesSearch;
    }
  });

  const handleCarrierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const newOffer: QuoteOffer = {
      id: Math.random().toString(36).substr(2, 9),
      requestId: selectedRequest.id,
      carrierId: 'c1', // Mock ID
      carrierName: 'Swift Logistics', // Mock Name
      amount: parseFloat(offerAmount), // This is the carrier's earnings
      transitTime: offerTransitTime,
      message: offerMessage,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    onSubmitOffer(newOffer);
    
    setSuccessMsg(`Quote sent for request #${selectedRequest.id.toUpperCase()}`);
    setTimeout(() => setSuccessMsg(null), 3000);
    
    // Reset and close
    setSelectedRequest(null);
    setOfferAmount('');
    setOfferMessage('');
    setOfferTransitTime('');
  };

  const handlePaymentSubmit = () => {
    if (!paymentOffer || !onAcceptOffer) return;
    
    const request = requests.find(r => r.id === paymentOffer.requestId);
    
    if (request?.serviceType === 'Door-to-Door') {
      if (!paymentAddress.collection.trim() || !paymentAddress.delivery.trim()) {
        alert("Please provide both Collection and Delivery addresses for this Door-to-Door service.");
        return;
      }
    }

    onAcceptOffer(paymentOffer.id, paymentAddress);
    
    setPaymentOffer(null);
    setPaymentAddress({ collection: '', delivery: '' });
    setSuccessMsg('Booking confirmed and payment processed successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleRequestExpand = (id: string) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const calculateShipperPrice = (carrierAmount: number) => {
      return carrierAmount * (1 + MARKUP_PERCENTAGE);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {role === 'carrier' ? 'Marketplace Requests' : 'Your Quote Requests'}
            </h2>
            {role === 'shipper' && (
                <div className="flex items-center gap-2 mt-1">
                    <Globe size={14} className="text-emerald-600" />
                    <p className="text-emerald-700 text-sm font-bold">Broadcast to Network Active</p>
                </div>
            )}
            {role === 'carrier' && (
                <p className="text-slate-500 text-sm">
                   View and quote on loads posted by shippers.
                </p>
            )}
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search origin, destination..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={20} />
          {successMsg}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center border border-slate-200 border-dashed">
           <Package size={48} className="mx-auto text-slate-300 mb-4" />
           <h3 className="text-lg font-medium text-slate-600">No requests found</h3>
           <p className="text-slate-500">
             {role === 'carrier' ? 'Check back later for new opportunities.' : 'You haven\'t created any requests yet.'}
           </p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-6 ${role === 'carrier' ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
          {filteredRequests.map(req => {
            // Carrier View Card
            if (role === 'carrier') {
              return (
                <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-md w-fit">
                          {req.vehicleType}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                           {req.serviceCategory}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-4 relative mb-6">
                      <div className="absolute left-1.5 top-1.5 bottom-6 w-0.5 bg-slate-100"></div>
                      <div className="flex items-start relative z-10">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 mr-3 border-2 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Origin</p>
                          <p className="font-bold text-slate-800">{req.origin}</p>
                        </div>
                      </div>
                      <div className="flex items-start relative z-10">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 mr-3 border-2 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Destination</p>
                          <p className="font-bold text-slate-800">{req.destination}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                       <div className="flex justify-between">
                          <span className="text-slate-500">Service</span>
                          <span className="font-medium text-slate-700">{req.serviceType === 'Door-to-Door' ? 'Collect & Deliver' : 'Depot-to-Depot'}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500">Cargo</span>
                          <span className="font-medium text-slate-700">{req.cargoType}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500">Weight</span>
                          <span className="font-medium text-slate-700">{req.weight} Tons</span>
                       </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                     <button 
                       onClick={() => setSelectedRequest(req)}
                       className="w-full py-2.5 bg-brand-900 text-white rounded-lg font-bold text-sm hover:bg-brand-800 flex justify-center items-center gap-2 transition-colors"
                     >
                       <DollarSign size={16} />
                       Submit Quote
                     </button>
                  </div>
                </div>
              );
            } else {
              // Shipper View (List Item with Expandable Offers)
              const requestOffers = offers.filter(o => o.requestId === req.id);
              const isExpanded = expandedRequestId === req.id;
              
              return (
                <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleRequestExpand(req.id)}>
                     <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Package size={24} />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-800">{req.origin} to {req.destination}</h3>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${req.status === 'Booked' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {req.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">
                            {req.vehicleType} • {req.weight} Tons • {new Date(req.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{req.serviceCategory}</p>
                     </div>
                     <div className="text-right hidden md:block">
                        <span className="block font-bold text-slate-700">{requestOffers.length} Offers</span>
                        <span className="text-xs text-slate-400">Click to view</span>
                     </div>
                     <div className="ml-auto">
                        {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                     </div>
                  </div>
                  
                  {isExpanded && (
                      <div className="bg-slate-50 border-t border-slate-200 p-5 animate-in fade-in slide-in-from-top-2">
                          <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Carrier Offers</h4>
                          {requestOffers.length === 0 ? (
                              <p className="text-sm text-slate-500 italic">No offers received yet. Your request is visible to {role === 'shipper' ? 'network carriers' : 'transporters'}.</p>
                          ) : (
                              <div className="space-y-3">
                                  {requestOffers.map(offer => (
                                      <div key={offer.id} className={`bg-white border rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 ${offer.status === 'Declined' ? 'opacity-50 border-slate-200' : 'border-slate-200 shadow-sm'}`}>
                                          <div className="flex items-center gap-4 flex-1">
                                              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                                  {offer.carrierName.substring(0,2)}
                                              </div>
                                              <div>
                                                  <div className="flex items-center gap-2">
                                                      <span className="font-bold text-slate-800">{offer.carrierName}</span>
                                                      {offer.status === 'Accepted' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">ACCEPTED</span>}
                                                      {offer.status === 'Declined' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">DECLINED</span>}
                                                  </div>
                                                  <p className="text-sm text-slate-500">{offer.message || "No message provided"}</p>
                                                  {offer.transitTime && (
                                                    <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                                                        <Clock size={10} /> SLA: {offer.transitTime}
                                                    </p>
                                                  )}
                                                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                                                      <ShieldCheck size={10} /> Verified Carrier
                                                  </div>
                                              </div>
                                          </div>
                                          
                                          <div className="text-right">
                                              <span className="block text-2xl font-bold text-emerald-600">R {calculateShipperPrice(offer.amount).toLocaleString()}</span>
                                              <span className="text-xs text-slate-400 block">Total Price (Inc. Fees)</span>
                                          </div>
                                          
                                          {offer.status === 'Pending' && req.status === 'Open' && (
                                              <div className="flex gap-2">
                                                  <button 
                                                    onClick={() => onDeclineOffer && onDeclineOffer(offer.id)}
                                                    className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-100"
                                                  >
                                                      Decline
                                                  </button>
                                                  <button 
                                                    onClick={() => setPaymentOffer(offer)}
                                                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 shadow-sm"
                                                  >
                                                      Accept & Pay
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Carrier Quote Submission Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Submit Quote</h3>
                        <p className="text-sm text-slate-500">Request #{selectedRequest.id.toUpperCase()}</p>
                    </div>
                    <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
                        <X size={24} />
                    </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg mb-6 text-sm space-y-2 border border-slate-200">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Route</span>
                        <span className="font-medium text-slate-800">{selectedRequest.origin} → {selectedRequest.destination}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle</span>
                        <span className="font-medium text-slate-800">{selectedRequest.vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Service Type</span>
                        <span className="font-medium text-slate-800">{selectedRequest.serviceCategory}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Collection</span>
                        <span className="font-medium text-slate-800">{selectedRequest.serviceType === 'Door-to-Door' ? 'Collect & Deliver' : 'Depot-to-Depot'}</span>
                    </div>
                </div>
                
                <form onSubmit={handleCarrierSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Your Rate (Net Earnings)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">R</span>
                            <input 
                              type="number" 
                              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-lg"
                              placeholder="0.00"
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                              required
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Customer will see a marked-up price (approx. R {offerAmount ? (parseFloat(offerAmount) * 1.1).toFixed(0) : '0'})</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Transit Time (SLA)</label>
                        <input 
                          type="text"
                          placeholder="e.g. Overnight, 2-3 Days"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          value={offerTransitTime}
                          onChange={(e) => setOfferTransitTime(e.target.value)}
                          required
                        />
                        <p className="text-xs text-slate-500 mt-1">Expected delivery time from pickup.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Message to Shipper</label>
                        <textarea 
                           className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                           placeholder="e.g., Can collect tomorrow morning. Reliable service..."
                           rows={3}
                           value={offerMessage}
                           onChange={(e) => setOfferMessage(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                          type="submit" 
                          className="w-full py-3 bg-brand-900 text-white font-bold rounded-lg hover:bg-brand-800 flex justify-center items-center gap-2 shadow-lg shadow-brand-900/20"
                        >
                            <Send size={18} />
                            Send Quote
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Shipper Payment Modal */}
      {paymentOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-slate-800">Confirm & Pay</h3>
                 <button onClick={() => setPaymentOffer(null)} className="text-slate-400 hover:text-slate-600">
                     <X size={24} />
                 </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6 flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm">
                      <CreditCard size={24} />
                  </div>
                  <div>
                      <p className="text-xs text-emerald-700 font-bold uppercase">Total Amount to Escrow</p>
                      <p className="text-2xl font-bold text-emerald-900">R {calculateShipperPrice(paymentOffer.amount).toLocaleString()}</p>
                  </div>
              </div>

              {/* Address Inputs for Door-to-Door Service */}
              {requests.find(r => r.id === paymentOffer.requestId)?.serviceType === 'Door-to-Door' && (
                <div className="mb-6 space-y-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <MapPin size={16} className="text-brand-600" />
                        Confirm Addresses
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Collection Address <span className="text-red-500">*</span></label>
                        <textarea 
                          className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          rows={2}
                          placeholder="Full collection address..."
                          value={paymentAddress.collection}
                          onChange={(e) => setPaymentAddress({...paymentAddress, collection: e.target.value})}
                          required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Delivery Address <span className="text-red-500">*</span></label>
                        <textarea 
                          className="w-full p-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          rows={2}
                          placeholder="Full delivery address..."
                          value={paymentAddress.delivery}
                          onChange={(e) => setPaymentAddress({...paymentAddress, delivery: e.target.value})}
                          required
                        />
                    </div>
                </div>
              )}

              <div className="space-y-2 text-sm text-slate-600 mb-6">
                 <div className="flex justify-between">
                    <span>Carrier</span>
                    <span className="font-bold text-slate-800">{paymentOffer.carrierName}</span>
                 </div>
                 {paymentOffer.transitTime && (
                    <div className="flex justify-between">
                        <span>Transit SLA</span>
                        <span className="font-bold text-slate-800">{paymentOffer.transitTime}</span>
                    </div>
                 )}
                 <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>Included</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Protection</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><ShieldCheck size={12} /> Secure Escrow</span>
                 </div>
              </div>

              <button 
                 onClick={handlePaymentSubmit}
                 className="w-full py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
              >
                 Pay Securely
              </button>
              
              <p className="text-xs text-center text-slate-400 mt-4">
                  Funds are held in escrow and only released to the carrier upon successful delivery confirmation.
              </p>
           </div>
        </div>
      )}

    </div>
  );
};

export default QuoteRequests;