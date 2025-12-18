
import React, { useState, useRef } from 'react';
import { Upload, FileText, Calendar, CheckCircle, X, AlertCircle, ChevronRight, Loader2, Truck, Trash2, Plus, Image as ImageIcon, Building, MapPin, CreditCard, Users, ShieldCheck } from 'lucide-react';
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
  {
    type: 'Vehicle License',
    label: 'Operator Disk / Vehicle License',
    description: 'Valid vehicle license disc upload.',
    requiresExpiry: true
  }
];

const VEHICLE_TYPES = ['Flatbed', 'Tautliner', 'Rigid', 'Refrigerated', 'Superlink', 'Superlink Tautliner', 'Pantech', '8 Ton', '1 Ton'];

const CarrierOnboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    companyName: '',
    regNumber: '',
    vatNumber: '',
    address: '',
    bankName: '',
    accountNumber: '',
    accountType: 'Current',
    branchCode: ''
  });

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockStorageUrl = `https://storage.freightconnect.co.za/mock/${selectedDocFile.name}`;
    const newDoc: CarrierDocument = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeDocType,
      fileName: selectedDocFile.name,
      fileSize: `${(selectedDocFile.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: docExpiryDate || undefined,
      status: 'Pending',
      url: mockStorageUrl
    };
    setDocuments(prev => [...prev.filter(d => d.type !== activeDocType), newDoc]);
    setIsDocUploading(false);
    setActiveDocType(null);
  };

  const handleAddVehicle = async () => {
    setIsVehicleUploading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const vehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      type: newVehicle.type || 'Flatbed',
      regNumber: newVehicle.regNumber || 'UNKNOWN',
      capacityTons: Number(newVehicle.capacityTons) || 0,
      capacityPallets: Number(newVehicle.capacityPallets) || 0,
      hasTailLift: false,
      isHazmatCertified: false,
      isRefrigerated: false,
      isAvailable: true,
      photos: []
    };
    setVehicles(prev => [...prev, vehicle]);
    setNewVehicle({ type: 'Flatbed', regNumber: '', capacityTons: 0, capacityPallets: 0, photos: [] });
    setIsVehicleUploading(false);
    setIsVehicleModalOpen(false);
  };

  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onComplete();
  };

  const allDocsUploaded = REQUIRED_DOCS.every(req => documents.find(d => d.type === req.type));
  const profileComplete = profile.companyName && profile.regNumber && profile.address && profile.bankName && profile.accountNumber;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Become a Partner Carrier</h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">Follow our three-step onboarding to verify your account and start earning on FreightConnect.</p>
        
        <div className="flex items-center justify-center gap-4 mt-12 mb-4">
           {[1, 2, 3].map(i => (
             <React.Fragment key={i}>
                <div className={`flex flex-col items-center gap-2 ${step === i ? 'text-brand-900' : step > i ? 'text-emerald-500' : 'text-slate-300'}`}>
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all font-black text-lg ${step === i ? 'border-brand-900 bg-brand-50' : step > i ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                      {step > i ? <CheckCircle size={24} /> : i}
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest">{i === 1 ? 'Profile' : i === 2 ? 'Documents' : 'Fleet'}</span>
                </div>
                {i < 3 && <div className={`w-16 h-1 bg-slate-100 rounded-full transition-all ${step > i ? 'bg-emerald-500' : ''}`}></div>}
             </React.Fragment>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-12">
        {step === 1 && (
           <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <section className="space-y-6">
                 <h3 className="text-sm font-black text-brand-500 uppercase tracking-widest flex items-center gap-2"><Building size={16}/> Company Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Company Legal Name</label>
                       <input type="text" className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all" value={profile.companyName} onChange={e => setProfile({...profile, companyName: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Registration Number (CIPC)</label>
                       <input type="text" className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all" value={profile.regNumber} onChange={e => setProfile({...profile, regNumber: e.target.value})} />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">VAT Number (Optional)</label>
                       <input type="text" className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all" value={profile.vatNumber} onChange={e => setProfile({...profile, vatNumber: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Primary Operating Address</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                          <input type="text" className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                       </div>
                    </div>
                 </div>
              </section>

              <section className="space-y-6 border-t pt-10">
                 <h3 className="text-sm font-black text-brand-500 uppercase tracking-widest flex items-center gap-2"><CreditCard size={16}/> Payout Details (Banking)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bank Name</label>
                       <select className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all" value={profile.bankName} onChange={e => setProfile({...profile, bankName: e.target.value})}>
                          <option value="">Select Bank</option>
                          <option value="FNB">First National Bank</option>
                          <option value="Standard">Standard Bank</option>
                          <option value="Nedbank">Nedbank</option>
                          <option value="Absa">Absa</option>
                          <option value="Capitec">Capitec</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Account Number</label>
                       <input type="text" className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all" value={profile.accountNumber} onChange={e => setProfile({...profile, accountNumber: e.target.value})} />
                    </div>
                 </div>
              </section>

              <button onClick={() => setStep(2)} disabled={!profileComplete} className="w-full py-5 bg-brand-900 text-white rounded-3xl font-black text-xl hover:bg-brand-800 disabled:opacity-30 transition-all active:scale-95 shadow-xl shadow-brand-900/20">Next: Document Verification</button>
           </div>
        )}

        {step === 2 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-sm font-black text-brand-500 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16}/> Compliance Uploads</h3>
              <div className="space-y-4">
                 {REQUIRED_DOCS.map(doc => {
                    const uploaded = documents.find(d => d.type === doc.type);
                    return (
                       <div key={doc.type} className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${uploaded ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 hover:border-brand-200'}`}>
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${uploaded ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <FileText size={24}/>
                             </div>
                             <div>
                                <h4 className="font-black text-slate-800">{doc.label}</h4>
                                <p className="text-xs text-slate-500 font-medium">{doc.description}</p>
                             </div>
                          </div>
                          <button onClick={() => handleOpenDocUpload(doc.type)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${uploaded ? 'bg-white text-emerald-600' : 'bg-brand-900 text-white hover:bg-brand-800'}`}>
                             {uploaded ? 'Re-upload' : 'Upload File'}
                          </button>
                       </div>
                    );
                 })}
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-xl">Back</button>
                 <button onClick={() => setStep(3)} disabled={!allDocsUploaded} className="flex-[2] py-5 bg-brand-900 text-white rounded-3xl font-black text-xl hover:bg-brand-800 disabled:opacity-30 shadow-xl shadow-brand-900/20">Next: Fleet Setup</button>
              </div>
           </div>
        )}

        {step === 3 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-black text-brand-500 uppercase tracking-widest flex items-center gap-2"><Truck size={16}/> Fleet Configuration</h3>
                 <button onClick={() => setIsVehicleModalOpen(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2"><Plus size={16}/> Add Truck</button>
              </div>
              
              {vehicles.length === 0 ? (
                 <div className="p-16 border-2 border-dashed border-slate-100 rounded-[40px] text-center bg-slate-50">
                    <Truck size={64} className="mx-auto text-slate-200 mb-6" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Add your first vehicle to complete onboarding</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map(v => (
                       <div key={v.id} className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center">
                                <Truck size={24}/>
                             </div>
                             <div>
                                <h4 className="font-black text-slate-800">{v.regNumber}</h4>
                                <p className="text-[10px] font-black uppercase text-slate-400">{v.type} • {v.capacityTons}T</p>
                             </div>
                          </div>
                          <button onClick={() => setVehicles(vehicles.filter(item => item.id !== v.id))} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                       </div>
                    ))}
                 </div>
              )}

              <div className="flex gap-4">
                 <button onClick={() => setStep(2)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-xl">Back</button>
                 <button onClick={handleSubmitProfile} disabled={vehicles.length === 0 || isSubmitting} className="flex-[2] py-5 bg-emerald-500 text-white rounded-3xl font-black text-xl hover:bg-emerald-600 disabled:opacity-30 shadow-xl shadow-emerald-500/20">
                    {isSubmitting ? <Loader2 className="animate-spin" size={24}/> : 'Finish & Submit'}
                 </button>
              </div>
           </div>
        )}
      </div>

      {/* Doc Modal */}
      {activeDocType && (
         <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Upload {activeDocType}</h3>
                  <button onClick={() => setActiveDocType(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><X size={20}/></button>
               </div>
               <div className="space-y-6">
                  <div onClick={() => docInputRef.current?.click()} className="border-4 border-dashed border-slate-100 rounded-[32px] p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                     <input type="file" ref={docInputRef} className="hidden" onChange={handleDocFileSelect} />
                     <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:shadow-lg transition-all">
                        <Upload size={32} className="text-slate-400 group-hover:text-emerald-500" />
                     </div>
                     <p className="font-black text-slate-800">{selectedDocFile ? selectedDocFile.name : 'Choose File'}</p>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">PDF, JPG, PNG up to 10MB</p>
                  </div>
                  {REQUIRED_DOCS.find(d => d.type === activeDocType)?.requiresExpiry && (
                     <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Document Expiry Date</label>
                        <input type="date" className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all" value={docExpiryDate} onChange={e => setDocExpiryDate(e.target.value)} />
                     </div>
                  )}
                  <button onClick={handleDocUpload} disabled={!selectedDocFile || isDocUploading} className="w-full py-4 bg-brand-900 text-white rounded-2xl font-black shadow-lg shadow-brand-900/20 active:scale-95 transition-all">
                     {isDocUploading ? <Loader2 size={24} className="animate-spin mx-auto"/> : 'Securely Upload'}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Vehicle Modal */}
      {isVehicleModalOpen && (
         <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Add Fleet Vehicle</h3>
                  <button onClick={() => setIsVehicleModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><X size={20}/></button>
               </div>
               <div className="space-y-6">
                  <div>
                     <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Truck Configuration</label>
                     <select className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500" value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}>
                        {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Registration Plate</label>
                     <input type="text" className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500 uppercase" value={newVehicle.regNumber} onChange={e => setNewVehicle({...newVehicle, regNumber: e.target.value.toUpperCase()})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Tonnage</label>
                        <input type="number" className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500" value={newVehicle.capacityTons} onChange={e => setNewVehicle({...newVehicle, capacityTons: Number(e.target.value)})} />
                     </div>
                     <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Max Pallets</label>
                        <input type="number" className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500" value={newVehicle.capacityPallets} onChange={e => setNewVehicle({...newVehicle, capacityPallets: Number(e.target.value)})} />
                     </div>
                  </div>
                  <button onClick={handleAddVehicle} disabled={!newVehicle.regNumber || isVehicleUploading} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                     {isVehicleUploading ? <Loader2 size={24} className="animate-spin mx-auto"/> : 'Register Vehicle'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default CarrierOnboarding;