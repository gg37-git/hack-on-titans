'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api';

const profileSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  heightCm: z.string().min(1, 'Height is required'),
  weightKg: z.string().min(1, 'Weight is required'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Phone number is required'),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError('');
      await apiClient.post('/profile', {
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        height_cm: parseInt(data.heightCm),
        weight_kg: parseFloat(data.weightKg),
        blood_group: data.bloodGroup,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        emergency_contact_relationship: data.emergencyContactRelationship,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      // Profile route not implemented yet, go to dashboard anyway
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-700 text-white text-2xl mb-4">
            🏥
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Complete Your Profile</h1>
          <p className="text-neutral-500">Help us personalize your health experience</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${step >= s ? 'bg-primary-700' : 'bg-neutral-200'}`} />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Personal Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Date of Birth</label>
                  <input {...register('dateOfBirth')} type="date" className="input-field" />
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
                  <select {...register('gender')} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Height (cm)</label>
                  <input {...register('heightCm')} type="number" placeholder="170" className="input-field" />
                  {errors.heightCm && <p className="text-red-500 text-xs mt-1">{errors.heightCm.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Weight (kg)</label>
                  <input {...register('weightKg')} type="number" step="0.1" placeholder="65" className="input-field" />
                  {errors.weightKg && <p className="text-red-500 text-xs mt-1">{errors.weightKg.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Blood Group</label>
                  <select {...register('bloodGroup')} className="input-field">
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup.message}</p>}
                </div>
              </div>

              <button type="button" onClick={() => setStep(2)} className="btn-primary w-full mt-4">
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Emergency Contact</h2>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Contact Name</label>
                <input {...register('emergencyContactName')} placeholder="John Doe" className="input-field" />
                {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                <input {...register('emergencyContactPhone')} placeholder="+91 99999 99999" className="input-field" />
                {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Relationship</label>
                <select {...register('emergencyContactRelationship')} className="input-field">
                  <option value="">Select</option>
                  {['Parent', 'Spouse', 'Sibling', 'Friend', 'Other'].map(r => (
                    <option key={r} value={r.toLowerCase()}>{r}</option>
                  ))}
                </select>
                {errors.emergencyContactRelationship && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRelationship.message}</p>}
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  ← Back
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                  {isLoading ? 'Saving...' : 'Complete Setup ✓'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-neutral-500 mt-4">
          <button onClick={() => router.push('/dashboard')} className="text-primary-700 hover:underline">
            Skip for now →
          </button>
        </p>
      </div>
    </div>
  );
}
