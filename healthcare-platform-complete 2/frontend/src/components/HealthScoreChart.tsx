import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface ChartProps {
  data: any[];
  loading?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#eab308'; // Yellow
  if (score >= 40) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const color = getScoreColor(score);
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-2xl min-w-[200px]">
        <p className="text-sm font-bold text-slate-500 mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black" style={{ color }}>{score}</div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
              {getScoreLabel(score)}
            </span>
          </div>
        </div>
        
        {data.breakdown && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <p className="text-[10px] font-black tracking-widest text-slate-400 mb-2 uppercase">Metrics</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Sleep</span>
              <span className="font-semibold text-slate-700">{data.breakdown.sleep_score}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Activity</span>
              <span className="font-semibold text-slate-700">{data.breakdown.exercise_score}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Vitals</span>
              <span className="font-semibold text-slate-700">{data.breakdown.bp_score}%</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function HealthScoreChart({ data, loading }: ChartProps) {
  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 animate-pulse">
        <Activity className="text-slate-300 animate-bounce" size={32} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100">
        <p className="text-slate-400 font-medium">No health score data available for this week.</p>
      </div>
    );
  }

  // Calculate average, trend and chart data format
  const validScores = data.filter(d => d.score > 0);
  const avgScore = validScores.length > 0 
    ? Math.round(validScores.reduce((acc, curr) => acc + curr.score, 0) / validScores.length) 
    : 0;
    
  const latestScore = validScores.length > 0 ? validScores[validScores.length - 1].score : 0;
  const previousScore = validScores.length > 1 ? validScores[validScores.length - 2].score : 0;
  
  const trend = latestScore > previousScore ? 'up' : latestScore < previousScore ? 'down' : 'flat';
  
  const chartData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: d.score,
    breakdown: d.breakdown || null
  }));

  // Find lowest metric to provide actionable tip
  let lowestDay = data[data.length - 1]; // default to today
  if (validScores.length > 0) {
     lowestDay = validScores.reduce((prev, current) => (prev.score < current.score) ? prev : current);
  }

  let improvementTip = "Keep up the good work!";
  if (lowestDay && lowestDay.breakdown) {
    const bd = lowestDay.breakdown;
    const lowestMetric = Object.entries(bd).sort((a: any, b: any) => a[1] - b[1])[0];
    
    switch(lowestMetric[0]) {
      case 'sleep_score': improvementTip = "Try to get 7-8 hours of sleep tonight to boost your recovery score."; break;
      case 'exercise_score': improvementTip = "Your activity level dropped. A 30-min walk can improve your score."; break;
      case 'stress_score': improvementTip = "Stress levels seem high. Consider a 10-minute meditation session."; break;
      case 'bmi_score': improvementTip = "Focus on balanced nutrition today to support your metabolic health."; break;
      case 'bp_score': improvementTip = "Reduce sodium intake and stay hydrated for better cardiovascular scores."; break;
    }
  }

  // Create gradient id
  const gradientId = 'colorScore';

  return (
    <div className="w-full bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            Weekly Health Trend
          </h2>
          <p className="text-sm text-slate-500">Your simulated health projection over the last 7 days</p>
        </div>
        
        <div className="flex items-center gap-6 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Week Avg</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black" style={{ color: getScoreColor(avgScore) }}>
                {avgScore}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
          </div>
          
          <div className="h-10 w-[1px] bg-slate-200"></div>
          
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Trend</p>
            <div className="flex items-center gap-2">
              {trend === 'up' && <TrendingUp className="text-green-500 w-6 h-6" />}
              {trend === 'down' && <TrendingDown className="text-red-500 w-6 h-6" />}
              {trend === 'flat' && <Minus className="text-slate-400 w-6 h-6" />}
              <span className={`text-sm font-black ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-slate-500'
              }`}>
                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="30%" stopColor="#eab308" />
                <stop offset="60%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} />
            <ReferenceLine y={80} stroke="#10b981" strokeOpacity={0.2} strokeDasharray="3 3" />
            <ReferenceLine y={60} stroke="#eab308" strokeOpacity={0.2} strokeDasharray="3 3" />
            <ReferenceLine y={40} stroke="#f97316" strokeOpacity={0.2} strokeDasharray="3 3" />
            
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={`url(#${gradientId})`} 
              strokeWidth={4} 
              dot={{ r: 5, fill: '#fff', strokeWidth: 3 }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="bg-white text-indigo-600 p-2 rounded-xl shadow-sm">
          <Activity size={20} />
        </div>
        <div>
          <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-1">AI Recommendation</h4>
          <p className="text-sm text-indigo-800 font-medium">{improvementTip}</p>
        </div>
      </div>
    </div>
  );
}
