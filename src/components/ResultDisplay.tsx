import { AiyoResponse, OverrideMode } from "../types.js";
import { Calculator, ShieldAlert, AlertTriangle } from "lucide-react";

export function ResultDisplay({ result }: { result: AiyoResponse | null }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-surface-800 p-12 text-center border-2 border-dashed border-surface-200 bg-white rounded-3xl">
        <Calculator className="w-12 h-12 mb-4 text-surface-800 opacity-30" />
        <h3 className="text-xl font-sans font-medium text-surface-900">No Analysis Yet</h3>
        <p className="mt-2 text-sm text-surface-800">Submit your budget dilemma to see the AiyoDecide breakdown.</p>
      </div>
    );
  }

  if (result.override_mode === OverrideMode.EMERGENCY) {
    return (
      <div className="bg-red-50 p-6 rounded-3xl border border-red-200 space-y-6">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-display font-bold text-red-700">Safety Concern Detected</h2>
            <p className="mt-1 text-red-600">This situation involves potential illegal lending, scams, or coercion.</p>
          </div>
        </div>

        {result.localized_resources && result.localized_resources.length > 0 && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-red-100">
            <h3 className="font-semibold text-red-800 mb-3">Immediate Resources</h3>
            <ul className="space-y-4">
              {result.localized_resources.map((res, i) => (
                <li key={i} className="flex flex-col gap-1 text-sm">
                  <span className="font-bold text-red-800">{res.name}</span>
                  <span className="text-red-700">{res.why}</span>
                  <span className="text-red-900 font-mono mt-1">{res.url_or_phone}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Recommendation Header */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">✓</div>
          <div>
            <h4 className="font-bold text-surface-900">Aiyo Recommendation: {result.recommendation.recommended_option_name}</h4>
            <p className="text-sm text-surface-800 mt-1">{result.explanations.simple}</p>
          </div>
        </div>
        <div className="md:text-right flex-shrink-0">
          <span className="block text-[10px] uppercase font-bold text-primary-400">Decision Score</span>
          <span className="text-2xl font-bold text-primary-500">{result.score.decision_score}%</span>
        </div>
      </div>

      {/* Deep Dive / Expert Insight */}
      <div className="bg-surface-100 p-6 rounded-2xl border border-surface-300">
        <h2 className="text-sm font-bold text-primary-500 uppercase mb-3 italic">Expert Insight</h2>
        <p className="text-sm leading-relaxed text-primary-700">
          "{result.explanations.detailed}"
        </p>
      </div>

      {/* Extracted Key Numbers */}
      {result.key_numbers_extracted && result.key_numbers_extracted.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.key_numbers_extracted.map((kn, i) => (
            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-surface-200 text-surface-900 shadow-sm border border-surface-300">
              <span className="text-surface-800 mr-1">{kn.label}:</span> {kn.value} {kn.unit !== "string" ? kn.unit : ""}
            </span>
          ))}
        </div>
      )}

      {/* Options Comparison Grid */}
      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {result.options_compared.map((option, idx) => {
          const isWinner = option.option_name === result.recommendation.recommended_option_name;
          
          return (
            <div key={idx} className={`rounded-3xl p-6 flex flex-col shadow-sm ${isWinner ? 'bg-primary-500 text-white border border-transparent shadow-lg' : 'bg-white border border-surface-200'}`}>
              <div className="flex justify-between items-start mb-6 w-full gap-2">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase truncate ${isWinner ? 'bg-white/20 text-white' : 'bg-primary-200 text-primary-800'}`}>
                  Option {['A', 'B', 'C', 'D'][idx]}: {option.option_name}
                </span>
                <span className="text-2xl font-light whitespace-nowrap">RM {option.estimated_monthly_total_cost_myr.toLocaleString()}<span className={`text-sm ${isWinner ? 'opacity-60' : 'text-primary-400'}`}>/mo</span></span>
              </div>
              <h3 className={`text-xl font-medium mb-4 underline underline-offset-8 ${isWinner ? 'decoration-white/30' : 'decoration-primary-500'}`}>{option.option_name}</h3>

              <div className="space-y-4 flex-1">
                 {/* Cost Breakdown */}
                 <div className="space-y-2">
                   <p className={`text-[11px] uppercase font-bold tracking-wider ${isWinner ? 'text-white/60' : 'text-surface-800'}`}>Monthly Cost Breakdown</p>
                   {option.monthly_cost_breakdown_myr.map((cost, j) => (
                     <div key={j} className={`flex justify-between text-sm border-b border-dashed pb-1.5 ${isWinner ? 'border-white/20 text-white/90' : 'border-surface-200 text-surface-800'}`}>
                       <span>{cost.label}</span>
                       <span className="font-mono">RM {cost.amount_myr}</span>
                     </div>
                   ))}
                 </div>
                 
                 {/* Time Breakdown */}
                 {option.time_cost_breakdown && option.time_cost_breakdown.length > 0 && (
                   <div className="space-y-2 mt-4">
                     <p className={`text-[11px] uppercase font-bold tracking-wider ${isWinner ? 'text-white/60' : 'text-surface-800'}`}>Time Cost</p>
                     {option.time_cost_breakdown.map((time, k) => (
                       <div key={k} className={`flex justify-between text-sm border-b border-dashed pb-1.5 ${isWinner ? 'border-white/20 text-white/90' : 'border-surface-200 text-surface-800'}`}>
                         <span>{time.label}</span>
                         <span className="font-mono">{time.minutes_per_week} mins/wk</span>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              <div className={`mt-8 pt-6 border-t ${isWinner ? 'border-white/20' : 'border-surface-200'}`}>
                <p className={`text-xs uppercase mb-1 ${isWinner ? 'opacity-60' : 'text-primary-400'}`}>Yearly Impact Estimation</p>
                <p className="text-xl font-semibold">RM {(option.estimated_monthly_total_cost_myr * 12).toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pros & Cons / Trade-offs Summary */}
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
        <h3 className="font-bold text-surface-900 mb-4">Trade-off Analysis</h3>
        <ul className="space-y-4">
          {result.tradeoff_analysis.map((tradeoff, idx) => (
            <li key={idx} className="flex gap-3 items-start">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-semibold text-surface-900">{tradeoff.tradeoff}</p>
                <p className="text-xs text-surface-800 mt-1"><span className="font-medium text-primary-600">Favors:</span> {tradeoff.who_this_favors}</p>
                <p className="text-xs text-surface-800 mt-0.5">{tradeoff.notes}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Plan */}
      <div className="bg-primary-50 p-6 rounded-2xl border border-primary-200">
        <h3 className="font-bold text-primary-800 mb-3 uppercase text-xs tracking-widest">Next 7 Days Action Plan</h3>
        <ol className="list-decimal list-inside space-y-2">
          {result.recommendation.action_plan_next_7_days.map((action, i) => (
            <li key={i} className="text-sm text-primary-900">{action}</li>
          ))}
        </ol>
      </div>

      {/* Follow-up Questions / Missing Info */}
      {result.missing_info && result.missing_info.length > 0 && (
        <div className="bg-white p-5 rounded-xl border-l-4 border-amber-500 shadow-sm mt-4 relative overflow-hidden">
          <AlertTriangle className="absolute top-5 right-5 w-16 h-16 text-amber-500/10" />
          <p className="text-xs font-semibold text-amber-600 mb-3 uppercase tracking-wider">Missing Information - Reply to refine</p>
          <ul className="space-y-4">
            {result.missing_info.map((info, i) => (
              <li key={i} className="text-sm text-surface-900">
                <span className="font-medium block mb-1">• {info.question}</span>
                <span className="text-surface-800 text-xs block opacity-80">Why we need it: {info.why_needed}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Copy Paste Scripts */}
      {result.copy_paste_scripts && result.copy_paste_scripts.length > 0 && (
        <div className="space-y-3 mt-4 border-t border-surface-200 pt-6">
           <h3 className="text-sm font-bold text-surface-900">Useful Scripts</h3>
           {result.copy_paste_scripts.map((script, idx) => (
             <div key={idx} className="bg-surface-100 p-4 rounded-xl border border-surface-300">
               <p className="text-xs text-surface-800 font-medium mb-2 uppercase">{script.purpose}</p>
               <div className="bg-white p-3 rounded border border-surface-200 text-sm font-mono text-primary-900">
                 {script.message}
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
