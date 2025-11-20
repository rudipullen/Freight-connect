import React, { useState } from 'react';
import { Terminal, Copy, Check, Eye, EyeOff, RefreshCw, Server, FileJson, Webhook, Shield } from 'lucide-react';

const ApiIntegration: React.FC = () => {
  const [apiKey, setApiKey] = useState('sk_live_51Mz...');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('sk_live_51Mz928374923874');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateKey = () => {
    if(window.confirm('Are you sure? This will invalidate your current key immediately.')) {
      setApiKey('sk_live_' + Math.random().toString(36).substr(2, 18));
      alert('New API Key Generated');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Developer API & Integration</h2>
          <p className="text-slate-500">Automate bookings, pull PODs, and sync invoices directly with your ERP.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           System Operational
        </div>
      </div>

      {/* API Key Management */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
         <div className="flex items-center gap-3 mb-6">
            <Terminal className="text-emerald-400" size={24} />
            <h3 className="text-lg font-bold">Production API Credentials</h3>
         </div>
         
         <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Secret Key</label>
               <div className="flex gap-2">
                  <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center px-4 py-3 font-mono text-sm relative">
                      {showKey ? apiKey : 'sk_live_••••••••••••••••••••••••'}
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 text-slate-500 hover:text-slate-300"
                      >
                         {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg border border-slate-600 transition-colors flex items-center justify-center w-12"
                    title="Copy Key"
                  >
                     {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                  <button 
                    onClick={regenerateKey}
                    className="bg-slate-700 hover:bg-red-900/50 text-white px-4 rounded-lg border border-slate-600 hover:border-red-900 transition-colors flex items-center justify-center w-12"
                    title="Roll Key"
                  >
                     <RefreshCw size={18} />
                  </button>
               </div>
               <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                 <Shield size={12} /> Keep this key secret. Do not expose it in client-side code.
               </p>
            </div>
         </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Server size={20} />
             </div>
             <h4 className="font-bold text-slate-800 mb-2">Direct Booking Injection</h4>
             <p className="text-sm text-slate-500 mb-4">Push bulk loads directly from SAP/Oracle using our <code className="bg-slate-100 px-1 rounded text-slate-700">/v1/bookings</code> endpoint.</p>
             <a href="#" className="text-sm font-bold text-blue-600 hover:underline">View Documentation →</a>
         </div>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FileJson size={20} />
             </div>
             <h4 className="font-bold text-slate-800 mb-2">Automated Invoicing</h4>
             <p className="text-sm text-slate-500 mb-4">Retrieve consolidated invoices and reconcile payments automatically via API.</p>
             <a href="#" className="text-sm font-bold text-purple-600 hover:underline">View Schema →</a>
         </div>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Webhook size={20} />
             </div>
             <h4 className="font-bold text-slate-800 mb-2">POD Webhooks</h4>
             <p className="text-sm text-slate-500 mb-4">Receive real-time JSON payloads when a POD is verified or a load is disputed.</p>
             <a href="#" className="text-sm font-bold text-orange-600 hover:underline">Configure Webhooks →</a>
         </div>
      </div>

      {/* Endpoint Preview */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
            <h3 className="font-bold text-slate-800">Quick Reference</h3>
            <div className="flex gap-2 text-xs">
               <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-mono">GET</span>
               <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono">POST</span>
            </div>
         </div>
         <div className="p-6 space-y-4">
            <div className="font-mono text-sm">
                <div className="flex items-center gap-4 mb-2">
                   <span className="text-blue-600 font-bold">POST</span>
                   <span className="text-slate-600">https://api.freightconnect.co.za/v1/bookings</span>
                </div>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto">
<pre>{`{
  "origin": "Johannesburg",
  "destination": "Cape Town",
  "vehicle_type": "Refrigerated",
  "pickup_date": "2024-07-15T08:00:00Z",
  "reference": "PO-998877"
}`}</pre>
                </div>
            </div>

            <div className="font-mono text-sm pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4 mb-2">
                   <span className="text-emerald-600 font-bold">GET</span>
                   <span className="text-slate-600">https://api.freightconnect.co.za/v1/pods/{'{booking_id}'}</span>
                </div>
                <p className="text-slate-500 text-xs">Returns signed PDF URL and metadata for the specified booking.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ApiIntegration;
