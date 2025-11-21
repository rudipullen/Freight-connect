
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, X, Loader2, User, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import { DocumentType, CarrierDocument } from '../types';

interface Props {
  onComplete: () => void;
}

type EntityType = 'Individual' | 'Company';

const INDIVIDUAL_DOCS: { type: DocumentType; label: string; description: string }[] = [
    { type: 'ID Document', label: 'Identity Document (ID)', description: 'Official South African ID or Passport.' }
];

const COMPANY_DOCS: { type: DocumentType; label: string; description: string }[] = [
    { type: 'Company Registration', label: 'Company Registration (CIPC)', description: 'Official CIPC registration documents.' },
    { type: 'VAT Registration', label: 'VAT Registration', description: 'VAT 103 Registration Certificate.' },
    { type: 'Payment Rep ID', label: 'ID of Payment Responsible', description: 'ID of the person responsible for account payments.' }
];

const ShipperOnboarding: React.FC<Props> = ({ onComplete }) => {
    const [entityType, setEntityType] = useState<EntityType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Document State
    const [documents, setDocuments] = useState<CarrierDocument[]>([]);
    const [activeDocType, setActiveDocType] = useState<DocumentType | null>(null);
    const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
    const [isDocUploading, setIsDocUploading] = useState(false);
    const docInputRef = useRef<HTMLInputElement>(null);

    const requiredDocs = entityType === 'Individual' ? INDIVIDUAL_DOCS : COMPANY_DOCS;

    const handleOpenDocUpload = (type: DocumentType) => {
        setActiveDocType(type);
        setSelectedDocFile(null);
    };
    
    const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedDocFile(e.target.files[0]);
        }
    };

    const handleDocUpload = async () => {
        if (!selectedDocFile || !activeDocType) return;
    
        setIsDocUploading(true);
        
        // Simulate Upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newDoc: CarrierDocument = {
          id: Math.random().toString(36).substr(2, 9),
          type: activeDocType,
          fileName: selectedDocFile.name,
          fileSize: `${(selectedDocFile.size / 1024 / 1024).toFixed(2)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          url: '#'
        };
    
        setDocuments(prev => [...prev.filter(d => d.type !== activeDocType), newDoc]);
        setIsDocUploading(false);
        setActiveDocType(null);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        onComplete();
    };

    const getDocStatus = (type: DocumentType) => documents.find(d => d.type === type);
    const allDocsUploaded = entityType && requiredDocs.every(req => documents.find(d => d.type === req.type));

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Customer Registration</h1>
                <p className="text-slate-500">Verify your identity to start booking loads securely.</p>
            </div>

            {!entityType ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <button 
                        onClick={() => setEntityType('Individual')}
                        className="bg-white p-8 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center text-center group shadow-sm hover:shadow-md"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            <User size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Individual</h3>
                        <p className="text-sm text-slate-500">For personal shipments. Requires ID verification.</p>
                    </button>

                    <button 
                        onClick={() => setEntityType('Company')}
                        className="bg-white p-8 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center text-center group shadow-sm hover:shadow-md"
                    >
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            <Building2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Company</h3>
                        <p className="text-sm text-slate-500">For business logistics. Requires CIPC & VAT documents.</p>
                    </button>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <button 
                        onClick={() => {
                            setEntityType(null);
                            setDocuments([]);
                        }}
                        className="text-sm text-slate-500 hover:text-emerald-600 mb-4 flex items-center gap-1"
                    >
                        ← Change Account Type
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                            {entityType === 'Individual' ? <User className="text-blue-600" /> : <Building2 className="text-indigo-600" />}
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{entityType} Verification</h2>
                                <p className="text-sm text-slate-500">Upload the required documents below.</p>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {requiredDocs.map(doc => {
                                const uploadedDoc = getDocStatus(doc.type);
                                return (
                                    <div key={doc.type} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${uploadedDoc ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {uploadedDoc ? <CheckCircle size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{doc.label}</h4>
                                                <p className="text-sm text-slate-500">{doc.description}</p>
                                                {uploadedDoc && (
                                                    <p className="text-xs text-emerald-600 font-medium mt-1">Uploaded: {uploadedDoc.fileName}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {!uploadedDoc && (
                                            <button 
                                                onClick={() => handleOpenDocUpload(doc.type)}
                                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <Upload size={16} /> Upload
                                            </button>
                                        )}
                                        {uploadedDoc && (
                                            <button 
                                                onClick={() => handleOpenDocUpload(doc.type)}
                                                className="text-xs text-slate-400 hover:text-red-500 underline"
                                            >
                                                Change
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={!allDocsUploaded || isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg transition-all ${
                            allDocsUploaded 
                            ? 'bg-brand-900 text-white hover:bg-brand-800' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><ShieldCheck /> Submit for Verification</>}
                    </button>
                </div>
            )}

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
                        </div>
                        ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                            <Upload size={24} />
                            </div>
                            <p className="font-medium text-slate-800">Click to upload</p>
                            <p className="text-xs text-slate-500 mt-1">PDF, JPG or PNG</p>
                        </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                        onClick={() => setActiveDocType(null)}
                        className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                        >
                        Cancel
                        </button>
                        <button 
                        onClick={handleDocUpload}
                        disabled={!selectedDocFile || isDocUploading}
                        className={`flex-1 py-2.5 text-white font-bold rounded-lg flex justify-center items-center ${
                            !selectedDocFile || isDocUploading
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-brand-900 hover:bg-brand-800'
                        }`}
                        >
                        {isDocUploading ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
                        </button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default ShipperOnboarding;
