'use client';

import { useState, useEffect } from 'react';
import { Plus, Bell, Clock, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api';

interface MedicalAlert {
  id: number;
  title: string;
  description: string;
  alert_type: string;
  severity: string;
  is_active: boolean;
  due_date: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<MedicalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    alert_type: 'medication',
    severity: 'info',
    due_date: ''
  });

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/alerts');
      setAlerts(res.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title) return;
    try {
      const res = await apiClient.post('/alerts', newAlert);
      setAlerts([res.data, ...alerts]);
      setNewAlert({ title: '', description: '', alert_type: 'medication', severity: 'info', due_date: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding alert:', error);
    }
  };

  const toggleAlert = async (id: number, currentStatus: boolean) => {
    try {
      await apiClient.put(`/alerts/${id}`, { is_active: !currentStatus });
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const deleteAlert = async (id: number) => {
    try {
      await apiClient.delete(`/alerts/${id}`);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header (Centered) */}
        <div className="flex flex-col items-center text-center gap-6 border-b border-neutral-200 pb-12">
           <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-3xl flex items-center justify-center text-3xl shadow-lg border border-primary-50">🔔</div>
           <div className="space-y-2">
             <h1 className="text-5xl font-black text-neutral-900 tracking-tight">Medical Alerts</h1>
             <p className="text-neutral-500 font-medium text-lg max-w-2xl">Scheduled reminders for medications, checkups, and vaccinations.</p>
           </div>
           {!isAdding && (
             <button 
               onClick={() => setIsAdding(true)}
               className="btn-primary px-10 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary-200"
             >
               <Plus size={22} /> Create Alert
             </button>
           )}
        </div>

        {isAdding && (
          <div className="card animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4">New Reminder</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Alert Title</label>
                  <input
                    type="text"
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    placeholder="E.g. Morning Medication"
                    className="input-field h-12"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Type</label>
                  <select
                    value={newAlert.alert_type}
                    onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                    className="input-field h-12"
                  >
                    <option value="medication">Medication</option>
                    <option value="checkup">Doctor Checkup</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Severity</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="input-field h-12"
                  >
                    <option value="info">Normal</option>
                    <option value="warning">Important</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Due Date/Time</label>
                  <input
                    type="datetime-local"
                    value={newAlert.due_date}
                    onChange={(e) => setNewAlert({ ...newAlert, due_date: e.target.value })}
                    className="input-field h-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Description (Optional)</label>
                <textarea
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  placeholder="E.g. Take 1 tablet after breakfast..."
                  className="input-field min-h-[80px]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Reminder</button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-neutral-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white border text-center py-20 rounded-[48px] space-y-6 shadow-sm border-dashed border-2">
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">🔔</div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-neutral-900">No active alerts</h3>
              <p className="text-neutral-500 max-w-xs mx-auto text-sm font-medium">Keep your health on track by setting reminders for your treatments and visits.</p>
            </div>
            <button onClick={() => setIsAdding(true)} className="text-primary-700 font-black hover:scale-105 transition-transform">Set your first reminder →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {alerts.map((a) => (
              <div key={a.id} className={`bg-white border rounded-3xl p-6 shadow-sm flex items-start justify-between group transition-all ${
                !a.is_active ? 'opacity-60 grayscale-[0.5]' : 'border-neutral-200 hover:border-primary-200'
              }`}>
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    a.severity === 'critical' ? 'bg-red-50 text-red-600' : 
                    a.severity === 'warning' ? 'bg-orange-50 text-orange-600' : 
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {a.is_active ? <Bell size={24} className="animate-wiggle" /> : <Bell size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                      {a.title}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        a.severity === 'critical' ? 'bg-red-100 text-red-700' : 
                        a.severity === 'warning' ? 'bg-orange-100 text-orange-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {a.severity}
                      </span>
                    </h3>
                    <div className="flex flex-col gap-1 mt-1 text-sm text-neutral-500">
                      {a.due_date && (
                        <p className="flex items-center gap-1 font-medium text-neutral-700">
                          <Clock size={14} /> {new Date(a.due_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      )}
                      {a.description && (
                        <p className="text-neutral-500 italic">"{a.description}"</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleAlert(a.id, a.is_active)}
                    className={`p-2 rounded-full transition-colors ${
                      a.is_active ? 'text-green-600 hover:bg-green-50' : 'text-neutral-400 hover:bg-neutral-100'
                    }`}
                    title={a.is_active ? 'Mark as completed' : 'Re-activate'}
                  >
                    <CheckCircle2 size={22} />
                  </button>
                  <button 
                    onClick={() => deleteAlert(a.id)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete reminder"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-neutral-900 p-6 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📱</div>
              <div>
                <h4 className="font-bold text-lg">Never miss a dose</h4>
                <p className="text-neutral-400 text-sm">Sync your medical alerts with your phone's calendar.</p>
              </div>
           </div>
           <button className="bg-white text-neutral-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-neutral-100 transition-colors whitespace-nowrap">
             Generate Calendar Link
           </button>
        </div>
      </div>
    </div>
  );
}
