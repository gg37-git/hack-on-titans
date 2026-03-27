'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Menu, X, Heart, UserCircle, LogOut } from 'lucide-react';
import EmergencySOS from '@/components/EmergencySOS';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    <div className="flex min-h-screen bg-[#f8fafc] text-neutral-900">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-72 h-full shadow-2xl animate-in slide-in-from-left duration-300 relative flex flex-col">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 bg-neutral-100 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="p-8 border-b border-neutral-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-2xl flex items-center justify-center text-white">
                <Heart size={22} fill="white" />
              </div>
              <span className="text-xl font-black text-neutral-900 tracking-tight">HealthCare.</span>
            </div>
            {/* Mobile Nav Content could be extracted to a shared component, but for now we'll focus on functionality */}
            <div className="flex-1 p-6 space-y-4">
               {/* Quick links for mobile */}
               <button onClick={() => {router.push('/dashboard'); setIsMobileMenuOpen(false);}} className="w-full text-left p-4 rounded-2xl font-bold bg-neutral-50">Dashboard</button>
               <button onClick={() => {router.push('/symptom-checker'); setIsMobileMenuOpen(false);}} className="w-full text-left p-4 rounded-2xl font-bold bg-neutral-50">Symptom Checker</button>
               <button onClick={() => {router.push('/ai-doc'); setIsMobileMenuOpen(false);}} className="w-full text-left p-4 rounded-2xl font-bold bg-neutral-50">AI Doctor</button>
            </div>
            <div className="p-6 border-t border-neutral-50 bg-neutral-50/50">
              <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-bold text-red-500">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-neutral-100 rounded-xl">
             <Menu size={20} />
           </button>
           <div className="flex items-center gap-2">
             <Heart size={20} className="text-primary-700 fill-primary-700" />
             <span className="font-black text-lg tracking-tight">HealthCare.</span>
           </div>
           <div className="w-9 h-9 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center">
             <UserCircle size={20} />
           </div>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-12 xl:p-16 animate-in fade-in duration-500 w-full">
          {children}
        </main>
        <EmergencySOS />
      </div>
    </div>
    </>
  );
}
