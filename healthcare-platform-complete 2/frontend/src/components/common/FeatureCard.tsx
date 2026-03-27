'use client';

import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function FeatureCard({ title, description, icon, color }: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-2xl border border-neutral-200 bg-white hover:border-primary-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-700 transition-colors">
        {title}
      </h3>
      <p className="text-neutral-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
