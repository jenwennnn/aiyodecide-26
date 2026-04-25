import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Copy, FileText, Smartphone, TrendingUp, AlertTriangle, ShieldCheck, Activity, BrainCircuit } from "lucide-react";

export function DashboardPage() {
  const chartData = [
    { name: "Week 1", score: 65 },
    { name: "Week 2", score: 68 },
    { name: "Week 3", score: 70 },
    { name: "Week 4", score: 64 },
    { name: "Week 5", score: 72 },
    { name: "Week 6", score: 75 },
    { name: "Week 7", score: 78 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Your Financial Health</h1>
          <p className="text-surface-600 mt-1">Overview of your AiyoSafe Score and recent impacts.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AiyoSafe Score Widget */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-surface-200 shadow-sm flex flex-col sm:flex-row gap-8 items-center sm:items-start">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-surface-100" strokeWidth="12" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="stroke-primary-500"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="351.858"
                  strokeDashoffset={351.858 - (351.858 * 72) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-surface-900 tracking-tighter">72</span>
                <span className="text-xs font-bold text-surface-500 uppercase tracking-widest">Fair</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" />
              +8 this month
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                AiyoSafe Score
                <BrainCircuit className="w-4 h-4 text-primary-500" />
              </h2>
              <p className="text-sm text-surface-600 mt-2 leading-relaxed">
                Score dropped <span className="font-semibold text-red-600">-6</span> this week mainly due to higher discretionary spending and 2 high-risk transfers. 
                If you reduce eating-out by <span className="font-semibold text-primary-700">RM120/week</span>, your score is projected to recover to <span className="font-semibold text-emerald-600">78</span> in 3 weeks.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-100">
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 hover:bg-surface-100 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-xs font-semibold text-surface-600 group-hover:text-primary-700 transition-colors">Cashflow Resilience</span>
                   <span className="text-xs font-bold text-primary-600">65/100</span>
                </div>
                <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-400 w-[65%] rounded-full"></div>
                </div>
              </div>
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 hover:bg-surface-100 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-xs font-semibold text-surface-600 group-hover:text-primary-700 transition-colors">Spending Control</span>
                   <span className="text-xs font-bold text-primary-600">82/100</span>
                </div>
                <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[82%] rounded-full"></div>
                </div>
              </div>
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 hover:bg-surface-100 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-xs font-semibold text-surface-600 group-hover:text-primary-700 transition-colors">Debt & Credit Risk</span>
                   <span className="text-xs font-bold text-primary-600">78/100</span>
                </div>
                <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-400 w-[78%] rounded-full"></div>
                </div>
              </div>
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 hover:bg-surface-100 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-xs font-semibold text-surface-600 group-hover:text-primary-700 transition-colors">Fraud/Scam Exp</span>
                   <span className="text-xs font-bold text-primary-600">50/100</span>
                </div>
                <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                   <div className="h-full bg-red-400 w-[50%] rounded-full"></div>
                </div>
              </div>
              <div className="col-span-2 p-3 bg-surface-50 rounded-xl border border-surface-200 hover:bg-surface-100 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-xs font-semibold text-surface-600 group-hover:text-primary-700 transition-colors">Goal Progress (Emergency Fund)</span>
                   <span className="text-xs font-bold text-primary-600">41%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                   <div className="h-full bg-primary-500 w-[41%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact So Far */}
        <div className="bg-primary-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary-700 rounded-full opacity-20 blur-2xl"></div>
          
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-300" />
            Impact so far
          </h2>
          
          <div className="space-y-5 relative z-10">
            <div>
              <div className="text-primary-200 text-xs font-medium uppercase tracking-wider mb-1">Money Saved</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold tracking-tight">RM 450</span>
                <span className="text-sm text-primary-300 pb-1">this month</span>
              </div>
              <div className="text-xs text-primary-400 mt-1">Total: RM 1,250 lifetime</div>
            </div>
            
            <div className="bg-primary-800/50 rounded-xl p-3 border border-primary-700/50 space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-xs text-primary-200">Fees Avoided</span>
                 <span className="text-sm font-semibold">RM 85</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-primary-200">Interest Avoided</span>
                 <span className="text-sm font-semibold">RM 120</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-primary-200">Time Saved</span>
                 <span className="text-sm font-semibold text-primary-300">1h 50m /wk</span>
               </div>
            </div>
            
            <div className="flex items-start gap-3 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
               <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
               <div>
                 <div className="text-xs font-bold text-emerald-300">Risk Incidents Prevented</div>
                 <div className="text-xs text-emerald-100/70 mt-1">2 high-risk scams blocked</div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-sm">
        <h3 className="text-base font-bold text-surface-900 mb-6">Score Improvement Over Time</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
