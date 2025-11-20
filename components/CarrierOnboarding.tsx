
import React, { useState, useRef } from 'react';
import { Upload, FileText, Calendar, CheckCircle, X, AlertCircle, ChevronRight, Loader2, Truck, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { DocumentType, CarrierDocument, Vehicle } from '../types';
import CitySearchInput from './CitySearchInput';

interface Props {
  onComplete: () => void;
}

const REQUIRED_DOCS: { type: DocumentType; label: string; description: string; requiresExpiry: boolean }[] = [
  { 
    type: 'Company Registration', 
    label: 'Company Registration (CIPC)', 
    description: 'Upload your official CIPC registration document.',
    requiresExpiry: false 
  },
  { 
    type: 'COF', 
    label: 'Certificate of Fitness (COF)', 
    description: 'Valid COF for your primary vehicle.',
    requiresExpiry: true 
  },
  { 
    type: 'GIT Insurance', 
    label: 'Goods In Transit (GIT) Insurance', 
    description: 'Proof of active GIT insurance policy.',
    requiresExpiry: true 
  },
  { 
    type: 'Driver PrDP', 
    label: 'Driver PrDP License', 
    description: 'Professional Driving Permit for the main driver.',
    requiresExpiry: true 
  },
];

const VEHICLE_TYPES = ['Flatbed', 'Refrigerated', 'Box Truck', 'Tanker', 'Other'];

const CarrierOnboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Document State
  const [documents, setDocuments] = useState<CarrierDocument[]>([]);
  const [activeDocType, setActiveDocType] = useState<DocumentType | null>(null);
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [docExpiryDate, setDocExpiryDate] = useState('');
  const [isDocUploading, setIsDocUploading] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Vehicle State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehiclePhotoFiles, setVehiclePhotoFiles] = useState<File[]>([]);
  const [isVehicleUploading, setIsVehicleUploading] = useState(false);
  const vehiclePhotoInputRef = useRef<HTMLInputElement>(null);
  
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    type: 'Flatbed',
    regNumber: '',
    capacityTons: 0,
    capacityPallets: 0,
    photos: []
  });
  const [isCustomType, setIsCustomType] = useState(false);

  // Route Preferences State
  const [routePrefs, setRoutePrefs] = useState({
    origin: '',
    destination: ''
  });

  // --- Document Handlers ---

  const handleOpenDocUpload = (type: DocumentType) => {
    setActiveDocType(type);
    setSelectedDocFile(null);
    setDocExpiryDate('');
  };

  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedDocFile(e.target.files[0]);
    }
  };

  const handleDocUpload = async () => {
    if (!selectedDocFile || !activeDocType) return;

    setIsDocUploading(true);
    
    // Simulate Firebase Storage Upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock Storage URL to simulate a successful upload to a bucket
    const mockStorageUrl = `https://firebasestorage.googleapis.com/v0/b/freightconnect.appspot.com/o/carriers%2Fdocs%2F${encodeURIComponent(selectedDocFile.name)}?alt=media&token=${Math.random().toString(36)}`;

    const newDoc: CarrierDocument = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeDocType,
      fileName: selectedDocFile.name,
      fileSize: `${(selectedDocFile.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: docExpiryDate || undefined,
      status: 'Pending', // Default status
      url: mockStorageUrl // Store the simulated URL
    };

    setDocuments(prev => [...prev.filter(d => d.type !== activeDocType), newDoc]);
    setIsDocUploading(false);
    setActiveDocType(null);
  };

  // --- Vehicle Handlers ---

  const handleVehiclePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setVehiclePhotoFiles(prev => [...prev, ...files]);
    }
  };

  const removeVehiclePhoto = (index: number) => {
    setVehiclePhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVehicle = async () => {
    setIsVehicleUploading(true);
    
    // Simulate photo uploads
    const photoUrls: string[] = [];
    if (vehiclePhotoFiles.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      vehiclePhotoFiles.forEach(file => {
          photoUrls.push(URL.createObjectURL(file)); // Mock URL for display
      });
    }

    const vehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      type: newVehicle.type || 'Unknown',
      regNumber: newVehicle.regNumber || 'UNKNOWN',
      capacityTons: Number(newVehicle.capacityTons) || 0,
      capacityPallets: Number(newVehicle.capacityPallets) || 0,
      photos: photoUrls
    };

    setVehicles(prev => [...prev, vehicle]);
    
    // Reset Form
    setNewVehicle({
      type: 'Flatbed',
      regNumber: '',
      capacityTons: 0,
      capacityPallets: 0,
      photos: []
    });
    setIsCustomType(false);
    setVehiclePhotoFiles([]);
    setIsVehicleUploading(false);
    setIsVehicleModalOpen(false);
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // --- Final Submission ---

  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    // Simulate API call to submit profile for verification
    const carrierUid = 'carrier_' + Math.random().toString(36).substr(2, 8);

    console.log('--- SUBMITTING APPLICATION ---');
    console.log(`Simulating submission for Carrier UID: ${carrierUid}`);
    
    // 1. Log Document writes to 'documents' collection
    console.log(`\n1. Linking ${documents.length} documents in Firestore collection 'documents'...`);
    documents.forEach(doc => {
        console.log(`   > SET documents/${doc.id}`, {
            ownerId: carrierUid,
            type: doc.type,
            storageUrl: doc.url,
            fileName: doc.fileName,
            expiryDate: doc.expiryDate || null,
            status: doc.status,
            rejectionReason: doc.rejectionReason || null,
            uploadedAt: new Date().toISOString()
        });
    });
    
    // 2. Log Vehicle writes to 'vehicles' subcollection
    console.log(`\n2. Saving ${vehicles.length} vehicles to subcollection 'vehicles'...`);
    vehicles.forEach(v => {
        console.log(`   > POST /carriers/${carrierUid}/vehicles/${v.id}`, {
            ...v,
            createdAt: new Date().toISOString()
        });
    });

    // 3. Log Route Preferences
    console.log(`\n3. Saving Route Preferences: ${routePrefs.origin} to ${routePrefs.destination}`);
    
    console.log('\n4. Updating profile verification status to PENDING');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onComplete();
  };

  const getDocStatus = (type: DocumentType) => documents.find(d => d.type === type);
  const allDocsUploaded = REQUIRED_DOCS.every(req => documents.find(d => d.type === req.type));
  const atLeastOneVehicle = vehicles.length > 0;

  const getStatusColor = (status: 'Pending' | 'Verified' | 'Rejected') => {
    switch(status) {
      case 'Verified': return 'text-emerald-600 bg-emerald-50';
      case 'Rejected': return 'text-red-600 bg-red-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  const getStatusIcon = (status: 'Pending' | 'Verified' | 'Rejected') => {
    switch(status) {
      case 'Verified': return <CheckCircle size={12} className="mr-1" />;
      case 'Rejected': return <X size={12} className="mr-1" />;
      default: return <Loader2 size={12} className="mr-1 animate-spin" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Complete Your Profile</h1>
        <div className="flex items-center gap-4 text-sm">
           <div className={`flex items-center gap-2 ${step === 1 ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 1 ? 'border-emerald-600 bg-emerald-50' : step > 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-300'}`}>
                {step > 1 ? <CheckCircle size={14} /> : '1'}
             </div>
             Documents
           </div>
           <div className="w-8 h-0.5 bg-slate-200"></div>
           <div className={`flex items-center gap-2 ${step === 2 ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 2 ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>2</div>
             Fleet & Operations
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Company Documents</h2>
              {REQUIRED_DOCS.map((doc) => {
                const uploadedDoc = getDocStatus(doc.type);
                return (
                  <div 
                    key={doc.type}
                    className={`bg-white p-5 rounded-xl border transition-all ${
                      uploadedDoc 
                        ? (uploadedDoc.status === 'Rejected' ? 'border-red-200 shadow-sm' : 'border-emerald-200 shadow-sm') 
                        : 'border-slate-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{doc.label}</h3>
                          {uploadedDoc && (
                            <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(uploadedDoc.status)}`}>
                              {getStatusIcon(uploadedDoc.status)} {uploadedDoc.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{doc.description}</p>
                        
                        {uploadedDoc ? (
                          <div className="mt-1">
                            <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg inline-flex">
                                <div className="flex items-center gap-1">
                                   <FileText size={14} className="text-slate-400" />
                                   <span className="truncate max-w-[150px]">{uploadedDoc.fileName}</span>
                                </div>
                                {uploadedDoc.expiryDate && (
                                  <div className="flex items-center gap-1 text-amber-600">
                                    <Calendar size={14} />
                                    <span>Exp: {uploadedDoc.expiryDate}</span>
                                  </div>
                                )}
                                <button 
                                  onClick={() => handleOpenDocUpload(doc.type)}
                                  className="text-brand-600 hover:text-brand-800 font-medium ml-2"
                                >
                                  {uploadedDoc.status === 'Rejected' ? 'Re-upload' : 'Edit'}
                                </button>
                            </div>
                            {uploadedDoc.status === 'Rejected' && uploadedDoc.rejectionReason && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md text-xs text-red-700 flex items-start gap-2">
                                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                    <span><span className="font-bold">Reason:</span> {uploadedDoc.rejectionReason}</span>
                                </div>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleOpenDocUpload(doc.type)}
                            className="flex items-center text-sm font-medium text-brand-600 hover:text-brand-800"
                          >
                            <Upload size={16} className="mr-2" />
                            Upload Document
                          </button>
                        )}
                      </div>
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        uploadedDoc 
                          ? (uploadedDoc.status === 'Verified' ? 'bg-emerald-100 text-emerald-600' : uploadedDoc.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600')
                          : 'bg-slate-100 text-slate-300'
                      }`}>
                        {uploadedDoc 
                           ? (uploadedDoc.status === 'Verified' ? <CheckCircle size={20} /> : uploadedDoc.status === 'Rejected' ? <X size={20} /> : <Loader2 size={20} className="animate-spin" />) 
                           : <FileText size={20} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">Fleet & Operations</h2>
                  <button 
                    onClick={() => setIsVehicleModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700"
                  >
                    <Plus size={18} />
                    Add Vehicle
                  </button>
               </div>

               {vehicles.length === 0 ? (
                 <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                      <Truck size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800">No Vehicles Added</h3>
                    <p className="text-slate-500 mb-4">Add at least one vehicle to start receiving load offers.</p>
                    <button 
                      onClick={() => setIsVehicleModalOpen(true)}
                      className="text-brand-600 font-medium hover:underline"
                    >
                      Add your first vehicle
                    </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-4">
                    {vehicles.map((v) => (
                      <div key={v.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                              {v.photos && v.photos.length > 0 ? (
                                <img src={v.photos[0]} alt="Vehicle" className="w-full h-full object-cover" />
                              ) : (
                                <Truck className="text-slate-400" />
                              )}
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-800">{v.regNumber}</h4>
                               <p className="text-sm text-slate-600">{v.type} • {v.capacityTons} Tons</p>
                               <p className="text-xs text-slate-400 mt-1">Pallet Capacity: {v.capacityPallets}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleDeleteVehicle(v.id)}
                           className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                    ))}
                 </div>
               )}

               {/* New Route Preferences Section */}
               <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Preferred Operating Route</h3>
                  <p className="text-sm text-slate-500 mb-4">Help us match you with loads by specifying your primary route or base of operations.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CitySearchInput 
                        label="Primary Origin"
                        placeholder="e.g. Johannesburg"
                        value={routePrefs.origin}
                        onChange={(val) => setRoutePrefs(prev => ({...prev, origin: val}))}
                        className="z-30"
                        required={true}
                      />
                      <CitySearchInput 
                        label="Primary Destination"
                        placeholder="e.g. Cape Town"
                        value={routePrefs.destination}
                        onChange={(val) => setRoutePrefs(prev => ({...prev, destination: val}))}
                        className="z-20"
                        required={true}
                      />
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-8">
            <h3 className="font-bold text-slate-800 mb-4">Verification Progress</h3>
            
            <div className="flex items-center gap-3 mb-6">
               <div className="relative">
                 <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center text-slate-400 font-bold">
                    {step === 1 
                      ? Math.round((documents.length / REQUIRED_DOCS.length) * 50) 
                      : 50 + (vehicles.length > 0 ? 50 : 0)
                    }%
                 </div>
               </div>
               <div>
                 <p className="text-sm font-medium text-slate-800">Application Status</p>
                 <p className="text-xs text-slate-500">
                   {step === 1 ? 'Uploading Documents' : 'Adding Vehicles'}
                 </p>
               </div>
            </div>

            <div className="space-y-3 text-sm border-t border-slate-100 pt-4 mb-6">
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle size={16} className={allDocsUploaded ? "text-emerald-500" : "text-slate-300"} />
                <span>Required Documents</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle size={16} className={vehicles.length > 0 ? "text-emerald-500" : "text-slate-300"} />
                <span>Vehicle & Route Info</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle size={16} className="text-slate-300" />
                <span>Admin Verification</span>
              </div>
            </div>

            <div className="space-y-3">
              {step === 1 ? (
                <button 
                  onClick={() => setStep(2)}
                  disabled={!allDocsUploaded}
                  className={`w-full py-3 rounded-lg font-bold flex justify-center items-center transition-all ${
                    allDocsUploaded 
                      ? 'bg-brand-900 text-white hover:bg-brand-800 shadow-md' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Next: Fleet & Operations
                  <ChevronRight size={18} className="ml-2" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmitProfile}
                    disabled={!atLeastOneVehicle || isSubmitting || !routePrefs.origin || !routePrefs.destination}
                    className={`flex-1 py-3 rounded-lg font-bold flex justify-center items-center transition-all ${
                      atLeastOneVehicle && routePrefs.origin && routePrefs.destination
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Submit Application
                        <CheckCircle size={18} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {activeDocType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Upload {activeDocType}</h3>
              <button onClick={() => setActiveDocType(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* File Drop Zone */}
              <div 
                onClick={() => docInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  selectedDocFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50'
                }`}
              >
                <input 
                  type="file" 
                  ref={docInputRef} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocFileSelect}
                />
                
                {selectedDocFile ? (
                   <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-emerald-500">
                        <FileText size={24} />
                      </div>
                      <p className="font-medium text-slate-800">{selectedDocFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(selectedDocFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedDocFile(null); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium mt-2"
                      >
                        Remove
                      </button>
                   </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                      <Upload size={24} />
                    </div>
                    <p className="font-medium text-slate-800">Click to upload document</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                  </div>
                )}
              </div>

              {/* Expiry Date Input (Conditional) */}
              {REQUIRED_DOCS.find(d => d.type === activeDocType)?.requiresExpiry && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                  <input 
                    type="date" 
                    value={docExpiryDate}
                    onChange={(e) => setDocExpiryDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    We'll remind you before this expires.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setActiveDocType(null)}
                  className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDocUpload}
                  disabled={!selectedDocFile || (REQUIRED_DOCS.find(d => d.type === activeDocType)?.requiresExpiry && !docExpiryDate) || isDocUploading}
                  className={`flex-1 py-2.5 text-white font-bold rounded-lg flex justify-center items-center ${
                    !selectedDocFile || isDocUploading
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-brand-900 hover:bg-brand-800'
                  }`}
                >
                  {isDocUploading ? <Loader2 className="animate-spin" size={18} /> : 'Save Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Add/Edit Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Add Vehicle</h3>
                    <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                        <select 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={isCustomType ? 'Other' : newVehicle.type}
                            onChange={(e) => {
                                if (e.target.value === 'Other') {
                                    setIsCustomType(true);
                                    setNewVehicle({...newVehicle, type: ''});
                                } else {
                                    setIsCustomType(false);
                                    setNewVehicle({...newVehicle, type: e.target.value});
                                }
                            }}
                        >
                            {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {isCustomType && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Specify Type</label>
                            <input 
                                type="text"
                                placeholder="e.g. Lowbed, Tautliner"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                value={newVehicle.type}
                                onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                        <input 
                            type="text" 
                            placeholder="e.g., ABC 123 GP"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                            value={newVehicle.regNumber}
                            onChange={(e) => setNewVehicle({...newVehicle, regNumber: e.target.value.toUpperCase()})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (Tons)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                value={newVehicle.capacityTons}
                                onChange={(e) => setNewVehicle({...newVehicle, capacityTons: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (Pallets)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                value={newVehicle.capacityPallets}
                                onChange={(e) => setNewVehicle({...newVehicle, capacityPallets: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    {/* Vehicle Photo Upload (Multiple) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Photos</label>
                        
                        {/* Photo List */}
                        {vehiclePhotoFiles.length > 0 && (
                           <div className="grid grid-cols-3 gap-3 mb-3">
                             {vehiclePhotoFiles.map((file, idx) => (
                               <div key={idx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                 <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                 <button 
                                   onClick={() => removeVehiclePhoto(idx)}
                                   className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                 >
                                   <X size={12} />
                                 </button>
                               </div>
                             ))}
                           </div>
                        )}

                        <div 
                            onClick={() => vehiclePhotoInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                             <input 
                                type="file" 
                                ref={vehiclePhotoInputRef} 
                                className="hidden" 
                                accept="image/*"
                                multiple
                                onChange={handleVehiclePhotoSelect}
                            />
                            <div className="flex flex-col items-center text-slate-400">
                                <ImageIcon size={24} className="mb-1" />
                                <span className="text-xs">Click to upload photos</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={handleAddVehicle}
                            disabled={!newVehicle.regNumber || !newVehicle.capacityTons || !newVehicle.type || isVehicleUploading}
                            className={`w-full py-3 rounded-lg font-bold text-white flex justify-center items-center ${
                                !newVehicle.regNumber || !newVehicle.type || isVehicleUploading
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-emerald-500 hover:bg-emerald-600'
                            }`}
                        >
                            {isVehicleUploading ? <Loader2 className="animate-spin" size={20} /> : 'Save Vehicle'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default CarrierOnboarding;
