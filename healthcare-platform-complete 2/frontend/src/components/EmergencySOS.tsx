'use client';

import { useState } from 'react';
import { AlertCircle, Phone, MapPin, Navigation, X } from 'lucide-react';

export default function EmergencySOS() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);

  const handleLocate = () => {
    setIsLocating(true);
    // Simulate GPS fetch and API call
    setTimeout(() => {
      setHospitals([
        { id: 1, name: 'Apollo Hospitals', distance: '1.2 km', address: 'Bannerghatta Road', time: '5 mins' },
        { id: 2, name: 'Fortis Hospital', distance: '2.5 km', address: 'Cunningham Road', time: '12 mins' },
        { id: 3, name: 'Manipal Hospital', distance: '3.8 km', address: 'Old Airport Road', time: '18 mins' },
      ]);
      setIsLocating(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[90px] md:bottom-8 right-4 md:right-8 z-[80] w-14 h-14 md:w-16 md:h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all animate-bounce hover:animate-none group"
        aria-label="Emergency SOS"
      >
        <AlertCircle size={32} className="group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-red-600 p-6 text-white flex justify-between items-start relative overflow-hidden">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
               <div>
                  <h2 className="text-3xl font-black mb-1 flex items-center gap-2">
                    <AlertCircle size={28} /> Emergency SOS
                  </h2>
                  <p className="text-red-100 font-medium">Get immediate assistance</p>
               </div>
               <button onClick={() => setIsOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors z-10">
                 <X size={20} />
               </button>
            </div>

            <div className="p-6 space-y-8">
              {/* National Hotlines */}
              <div>
                <h3 className="text-[11px] font-black tracking-widest uppercase text-neutral-400 mb-3">National Hotlines (India)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href="tel:112" className="flex items-center gap-3 p-4 border border-red-100 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="font-black text-neutral-900 leading-tight">112</p>
                      <p className="text-xs text-red-600 font-bold tracking-wide">National Emergency</p>
                    </div>
                  </a>
                  <a href="tel:108" className="flex items-center gap-3 p-4 border border-red-100 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="font-black text-neutral-900 leading-tight">108</p>
                      <p className="text-xs text-red-600 font-bold tracking-wide">Ambulance</p>
                    </div>
                  </a>
                  <a href="tel:1091" className="flex items-center gap-3 p-4 border border-red-100 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="font-black text-neutral-900 leading-tight">1091</p>
                      <p className="text-xs text-red-600 font-bold tracking-wide">Women Helpline</p>
                    </div>
                  </a>
                  <a href="tel:104" className="flex items-center gap-3 p-4 border border-red-100 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="font-black text-neutral-900 leading-tight">104</p>
                      <p className="text-xs text-red-600 font-bold tracking-wide">Health Helpline</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Nearest Hospitals */}
              <div>
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="text-[11px] font-black tracking-widest uppercase text-neutral-400">Nearest Hospitals</h3>
                   {hospitals.length === 0 && (
                     <button onClick={handleLocate} disabled={isLocating} className="text-xs font-bold text-primary-700 flex items-center gap-1 hover:bg-primary-50 px-3 py-1.5 rounded-full transition-colors">
                       <MapPin size={14} /> {isLocating ? 'Locating...' : 'Find Nearest'}
                     </button>
                   )}
                 </div>

                 {hospitals.length === 0 && !isLocating && (
                   <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                     <MapPin size={32} className="text-neutral-300 mb-3" />
                     <p className="text-sm font-semibold text-neutral-600">Location required to find nearby facilities.</p>
                     <p className="text-xs text-neutral-400 mt-1">We will securely grab your GPS coordinates.</p>
                   </div>
                 )}

                 {isLocating && (
                   <div className="space-y-3">
                     {[1,2,3].map(i => <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-2xl"></div>)}
                   </div>
                 )}

                 {hospitals.length > 0 && (
                   <div className="space-y-3">
                     {hospitals.map(h => (
                       <div key={h.id} className="border border-neutral-200 p-4 rounded-2xl flex items-center justify-between hover:border-primary-500 transition-colors">
                         <div>
                           <h4 className="font-bold text-neutral-900">{h.name}</h4>
                           <p className="text-xs text-neutral-500 mt-0.5">{h.address}</p>
                           <div className="flex gap-2 mt-2">
                             <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                               {h.distance}
                             </span>
                             <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded flex items-center gap-1">
                               {h.time} away
                             </span>
                           </div>
                         </div>
                         <button className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                           <Navigation size={18} className="ml-[-2px] mt-[2px]" />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
