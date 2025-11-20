
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { SA_CITIES } from '../constants';

interface CitySearchInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon?: React.ElementType;
  className?: string;
  required?: boolean;
}

const CitySearchInput: React.FC<CitySearchInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  icon: Icon = MapPin,
  className = "",
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    
    if (val.length > 0) {
      const filtered = SA_CITIES.filter(city => 
        city.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (city: string) => {
    onChange(city);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative z-20 ${className}`}>
       {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
       <div className="relative">
         <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={18} />
         </div>
         <input 
           type="text" 
           placeholder={placeholder}
           className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
           value={value}
           onChange={handleInput}
           onFocus={() => value && setShowSuggestions(true)}
           onBlur={() => {
             setTimeout(() => setShowSuggestions(false), 200);
           }}
           required={required}
         />
         {showSuggestions && suggestions.length > 0 && (
           <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
             {suggestions.map((city) => (
               <li 
                 key={city}
                 onMouseDown={(e) => {
                   e.preventDefault();
                   handleSelect(city);
                 }}
                 className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm text-slate-700 transition-colors"
               >
                 {city}
               </li>
             ))}
           </ul>
         )}
       </div>
    </div>
  );
};

export default CitySearchInput;
