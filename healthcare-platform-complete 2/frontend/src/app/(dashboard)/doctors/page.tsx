'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, Star, Filter, Briefcase, ChevronRight, Building2, UserCircle2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { getAllStates, getDistrictsForState } from '@/lib/indiaLocations';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experience_years: number;
  clinic_name: string;
  clinic_address: string;
  state: string;
  district: string;
  locality: string;
  rating: string;
  email: string;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  state: string;
  district: string;
  phone: string;
  emergency_available: boolean;
}

interface Appointment {
  id: number;
  doctor_name: string;
  specialty: string;
  clinic_name: string;
  appointment_date: string;
  status: string;
}

export default function DoctorsPage() {
  const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals'>('doctors');
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [showAppointments, setShowAppointments] = useState(false);

  // Stats for the UI to prove massive scale
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalHospitals, setTotalHospitals] = useState(0);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'doctors') {
        const res = await apiClient.get('/doctors', { params: { search, specialty, state, district } });
        setDoctors(res.data.doctors);
        setTotalDoctors(res.data.total);
      } else {
        const res = await apiClient.get('/hospitals', { params: { search, state, district } });
        setHospitals(res.data.hospitals);
        setTotalHospitals(res.data.total);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await apiClient.get('/doctors/specialties');
      setSpecialties(res.data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await apiClient.get('/doctors/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    setStates(getAllStates());
    fetchSpecialties();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (state) setDistricts(getDistrictsForState(state));
    else setDistricts([]);
    setDistrict('');
  }, [state]);

  useEffect(() => {
    fetchData();
  }, [search, specialty, state, district, activeTab]);

  const handleBook = async () => {
    if (!selectedDoctor || !bookingDate) return;
    try {
      setIsBooking(true);
      await apiClient.post(`/doctors/${selectedDoctor.id}/book`, {
        appointment_date: `${bookingDate}T${bookingTime}:00`,
        consultation_mode: 'in-person'
      });
      setSelectedDoctor(null);
      fetchAppointments();
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-500">
        
        {/* Header & Hero Stats */}
        <div className="flex flex-col items-center text-center gap-10">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Healthcare Directory</h1>
            <p className="text-slate-600 font-medium text-lg max-w-3xl">Instant access to certified specialists, medical centers, and emergency clinical networks across India.</p>
          </div>
          <div className="flex bg-white rounded-[28px] p-2 shadow-sm border border-slate-200 w-fit shrink-0">
             <button
                onClick={() => { setActiveTab('doctors'); setSearch(''); }}
                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'doctors' ? 'bg-primary-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
             >
                <UserCircle2 size={18} /> {totalDoctors > 0 ? `${totalDoctors.toLocaleString()}+ Doctors` : 'AI Doctors'}
             </button>
             <button
                onClick={() => { setActiveTab('hospitals'); setSearch(''); }}
                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'hospitals' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
             >
                <Building2 size={18} /> {totalHospitals > 0 ? `${totalHospitals.toLocaleString()}+ Hospitals` : 'Regional Hospitals'}
             </button>
          </div>
        </div>

        {/* Search & Hierarchical Filters (Aerated) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Search Input */}
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-[24px] px-5 h-16 shadow-sm focus-within:ring-2 focus-within:ring-primary-600 transition-all group">
            <Search className="text-slate-400 group-focus-within:text-primary-600 shrink-0" size={22} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          
          {/* State Filter */}
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-[24px] px-5 h-16 shadow-sm focus-within:ring-2 focus-within:ring-primary-600 transition-all group">
            <MapPin className="text-slate-400 group-focus-within:text-primary-600 shrink-0" size={22} />
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer"
            >
              <option value="">All States in India</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Specialty Filter */}
          <div className={`flex items-center gap-4 border rounded-[24px] px-5 h-16 shadow-sm transition-all group ${activeTab === 'hospitals' ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed' : 'bg-white border-slate-200 focus-within:ring-2 focus-within:ring-primary-600'}`}>
            <Filter className={`shrink-0 ${activeTab === 'hospitals' ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-primary-600'}`} size={22} />
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              disabled={activeTab === 'hospitals'}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer disabled:cursor-not-allowed"
            >
              <option value="">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Massive Data Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : activeTab === 'doctors' ? (
          /* Doctors View (De-clumped) */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {doctors.map((d) => (
              <div key={d.id} className="bg-white border text-left border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-700 text-3xl font-black">
                      {d.name.split(' ').pop()?.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-xl text-sm font-black border border-yellow-200">
                      <Star size={16} className="fill-yellow-500 text-yellow-500" /> {d.rating}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-700 transition-colors tracking-tight">{d.name}</h3>
                  <p className="text-primary-600 text-sm font-black uppercase tracking-widest mt-1 mb-6">{d.specialty}</p>
                  
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-3">
                       <Briefcase size={18} className="text-slate-400 shrink-0" />
                       <span className="truncate">{d.experience_years} years • {d.qualifications}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <MapPin size={18} className="text-slate-400 shrink-0" />
                       <span className="truncate">{d.clinic_name}, {d.locality}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedDoctor(d)}
                  className="w-full mt-6 h-14 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  Book Session <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Hospitals View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hospitals.map((h) => (
              <div key={h.id} className="bg-white border text-left border-slate-200 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col group relative overflow-hidden">
                {h.emergency_available && (
                   <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-xl shadow-sm">
                     24/7 ER
                   </div>
                )}
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                  <Building2 size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{h.name}</h3>
                
                <div className="space-y-3 mt-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-start gap-2">
                     <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                     <span>{h.address}<br/>{h.district}, {h.state}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                   <div className="text-xs font-black text-slate-900 tracking-wider">
                     {h.phone}
                   </div>
                   <button className="text-indigo-600 hover:bg-indigo-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors">
                     <ChevronRight size={20} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Overlay Modal perfectly preserved */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Book Session</h2>
              <p className="text-slate-500 font-bold text-sm mb-8">Consulting with {selectedDoctor.name}</p>

              <div className="space-y-6 mb-10">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Select Date</label>
                  <input 
                    type="date" 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-primary-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Available Slots</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'].map(t => (
                      <button
                        key={t}
                        onClick={() => setBookingTime(t)}
                        className={`h-12 rounded-xl text-sm font-black transition-all ${
                          bookingTime === t ? 'bg-primary-700 text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-primary-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="flex-1 h-14 rounded-2xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBook}
                  disabled={isBooking || !bookingDate}
                  className="flex-1 h-14 btn-primary rounded-2xl font-black disabled:opacity-50"
                >
                  {isBooking ? 'Locking...' : 'Confirm Book'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
