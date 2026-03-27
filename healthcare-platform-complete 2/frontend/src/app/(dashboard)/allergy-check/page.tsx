'use client';

import React from 'react';
import AllergyRiskChecker from '@/components/AllergyRiskChecker';
import { ShieldAlert, History, Info } from 'lucide-react';

export default function AllergyCheckPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side: Information & Context */}
        <div className="lg:w-1/3">
          <div className="bg-gradient-to-br from-primary/10 to-rose-50 p-8 rounded-3xl border border-primary/10 sticky top-8">
            <div className="bg-white p-3 rounded-2xl w-fit shadow-sm mb-6">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black mb-4">Allergy Reaction Risk Predictor</h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Our advanced AI model cross-references your medical history, current prescriptions, and daily food intake to identify hidden allergy risks before they happen.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <History className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Automated History</h4>
                  <p className="text-xs text-slate-500">Every check is saved to your secure clinical profile for doctor review.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Info className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Evidence-Based Analysis</h4>
                  <p className="text-xs text-slate-500">Trained on 2000+ clinical records using Random Forest classification.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/50 rounded-2xl border border-white/50 text-[10px] text-slate-400 italic">
              DISCLAIMER: This tool provides predictive risk assessment and does not constitute medical diagnosis. Always consult a healthcare professional.
            </div>
          </div>
        </div>

        {/* Right side: The Checker Wizard */}
        <div className="lg:w-2/3">
          <AllergyRiskChecker />
        </div>
      </div>
    </div>
  );
}
