import { useState, useRef } from "react";
import { X, Plus, Users, Wallet, CreditCard, PiggyBank, RefreshCw, Target, Shield, UploadCloud, Loader2 } from "lucide-react";
import { extractFinancialDocument, fileToBase64 } from "../services/ai";

interface Subscription {
  id: string;
  name: string;
  cost: number | "";
  shared: boolean;
  totalPeople: number;
}

interface FinancialSnapshotPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snapshotText: string) => void;
}

const COMMON_SUBS = [
  "Spotify", "Netflix", "YouTube Premium", "iCloud", "Google One", "Gym", 
  "ChatGPT Plus", "Claude", "Gemini", "Canva", "GrabUnlimited"
];

const SUGGESTED_CONSTRAINTS = [
  "Must keep RM500 buffer",
  "No spending cuts on childcare",
  "Prefer halal merchants / local SMEs",
  "Cannot compromise on safety",
];

export function FinancialSnapshotPage({ isOpen, onClose, onSave }: FinancialSnapshotPageProps) {
  const [income, setIncome] = useState<number | "">("");
  const [rent, setRent] = useState<number | "">("");
  const [transport, setTransport] = useState<number | "">("");
  const [debt, setDebt] = useState<number | "">("");
  const [savingsTarget, setSavingsTarget] = useState<number | "">("");

  // Goals
  const [emergencyCurrent, setEmergencyCurrent] = useState<number | "">("");
  const [emergencyTarget, setEmergencyTarget] = useState<number | "">("");
  const [customGoalName, setCustomGoalName] = useState("");
  const [customGoalTarget, setCustomGoalTarget] = useState<number | "">("");

  // Constraints
  const [constraints, setConstraints] = useState<string[]>([]);
  const [newConstraint, setNewConstraint] = useState("");

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [newSubName, setNewSubName] = useState("");
  const [newSubCost, setNewSubCost] = useState<number | "">("");

  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsExtracting(true);
    try {
      const file = e.target.files[0];
      const fileData = await fileToBase64(file);
      const data = await extractFinancialDocument(fileData);
      
      if (data.income) setIncome(data.income);
      if (data.rent) setRent(data.rent);
      if (data.transport) setTransport(data.transport);
      if (data.debt) setDebt(data.debt);
      
      if (data.subscriptions && data.subscriptions.length > 0) {
        const newSubs = data.subscriptions.map(s => ({
          id: crypto.randomUUID(),
          name: s.name,
          cost: s.cost || 0,
          shared: false,
          totalPeople: 2
        }));
        setSubscriptions(prev => [...prev, ...newSubs]);
      }
    } catch (error) {
      console.error("Failed to extract data", error);
      alert("Failed to analyze the document. Please try again or enter manually.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddConstraint = () => {
    if (!newConstraint) return;
    setConstraints([...constraints, newConstraint]);
    setNewConstraint("");
  };

  const removeConstraint = (idx: number) => {
    setConstraints(constraints.filter((_, i) => i !== idx));
  };

  const handleAddSub = () => {
    if (!newSubName) return;
    setSubscriptions([
      ...subscriptions,
      {
        id: crypto.randomUUID(),
        name: newSubName,
        cost: newSubCost,
        shared: false,
        totalPeople: 2,
      }
    ]);
    setNewSubName("");
    setNewSubCost("");
  };

  const handleQuickAdd = (name: string) => {
    setSubscriptions([
      ...subscriptions,
      {
        id: crypto.randomUUID(),
        name,
        cost: "",
        shared: false,
        totalPeople: 2,
      }
    ]);
  };

  const updateSub = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(subs => subs.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSub = (id: string) => {
    setSubscriptions(subs => subs.filter(s => s.id !== id));
  };

  const calculateTotalSubs = () => {
    return subscriptions.reduce((total, sub) => {
      const cost = typeof sub.cost === "number" ? sub.cost : 0;
      return total + (sub.shared ? cost / sub.totalPeople : cost);
    }, 0);
  };

  const handleSave = () => {
    let text = `\n\n--- My Financial Snapshot ---\n`;
    if (income) text += `Income: RM ${income}/month\n`;
    
    let mustPay = 0;
    if (rent) mustPay += Number(rent);
    if (transport) mustPay += Number(transport);
    if (debt) mustPay += Number(debt);
    
    if (mustPay > 0) {
      text += `Must-pay Bills: RM ${mustPay}/month`;
      const breakdowns = [];
      if (rent) breakdowns.push(`Rent: RM ${rent}`);
      if (transport) breakdowns.push(`Transport: RM ${transport}`);
      if (debt) breakdowns.push(`Debt: RM ${debt}`);
      if (breakdowns.length > 0) {
        text += ` (${breakdowns.join(", ")})\n`;
      } else {
        text += `\n`;
      }
    }
    
    if (savingsTarget) text += `Savings Target: RM ${savingsTarget}/month\n`;
    
    // Goals
    const hasGoals = emergencyTarget || customGoalTarget;
    if (hasGoals) {
      text += `\n🎯 Goals:\n`;
      if (emergencyTarget) {
        text += `- Emergency Fund: RM ${emergencyCurrent || 0} / RM ${emergencyTarget}\n`;
      }
      if (customGoalName && customGoalTarget) {
        text += `- ${customGoalName}: Target RM ${customGoalTarget}\n`;
      }
    }

    // Constraints
    if (constraints.length > 0) {
      text += `\n⚠️ Constraints:\n`;
      constraints.forEach(c => text += `- ${c}\n`);
    }

    const subTotal = calculateTotalSubs();
    if (subscriptions.length > 0) {
      text += `Subscriptions (Total: RM ${subTotal.toFixed(2)}/month):\n`;
      subscriptions.forEach(sub => {
        const cost = typeof sub.cost === "number" ? sub.cost : 0;
        if (sub.shared) {
          const myShare = cost / sub.totalPeople;
          text += `- ${sub.name}: RM ${myShare.toFixed(2)}/mo (RM ${cost} shared with ${sub.totalPeople} people)\n`;
        } else {
          text += `- ${sub.name}: RM ${cost.toFixed(2)}/mo\n`;
        }
      });
    }

    onSave(text);
    onClose();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm w-full flex flex-col border border-surface-200 animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-6 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-lg text-surface-900">Financial Snapshot</h2>
            <p className="text-xs text-surface-800">Build your financial context to get better recommendations</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">

          {/* Auto-fill from Document */}
          <div className="bg-primary-50 rounded-2xl p-4 border border-primary-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-primary-900 mb-1">Auto-fill with AI</h3>
              <p className="text-xs text-primary-700">Upload a bank statement, bill, or payslip to automatically extract numbers.</p>
            </div>
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
              disabled={isExtracting}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {isExtracting ? "Analyzing..." : "Upload File"}
            </button>
          </div>
          
          {/* Income & Bills */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary-500 uppercase flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Basics
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase font-bold text-surface-800 block mb-1">Monthly Income (RM)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border-surface-300 bg-surface-50 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors border"
                  placeholder="e.g. 4500"
                  value={income} onChange={e => setIncome(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-surface-800 block mb-1">Savings Target (RM/mo) <span className="text-surface-800/50 font-normal normal-case">(Optional)</span></label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border-surface-300 bg-surface-50 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors border"
                  placeholder="e.g. 1000"
                  value={savingsTarget} onChange={e => setSavingsTarget(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
            </div>
            
            <div className="p-4 bg-surface-100 rounded-xl border border-surface-200">
               <label className="text-[11px] uppercase font-bold text-surface-800 block mb-3">Must-Pay Bills (RM/mo)</label>
               <div className="grid grid-cols-3 gap-3">
                 <div>
                    <span className="text-xs text-surface-800 block mb-1">Rent/Mortgage</span>
                    <input type="number" className="w-full rounded-lg border-surface-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none border" placeholder="0" value={rent} onChange={e => setRent(e.target.value ? Number(e.target.value) : "")}/>
                 </div>
                 <div>
                    <span className="text-xs text-surface-800 block mb-1">Transport</span>
                    <input type="number" className="w-full rounded-lg border-surface-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none border" placeholder="0" value={transport} onChange={e => setTransport(e.target.value ? Number(e.target.value) : "")}/>
                 </div>
                 <div>
                    <span className="text-xs text-surface-800 block mb-1">Debt/Loans</span>
                    <input type="number" className="w-full rounded-lg border-surface-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none border" placeholder="0" value={debt} onChange={e => setDebt(e.target.value ? Number(e.target.value) : "")}/>
                 </div>
               </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary-500 uppercase flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Subscriptions
              </h3>
              <div className="text-xs font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-md">
                Total: RM {calculateTotalSubs().toFixed(2)}/mo
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {COMMON_SUBS.map(sub => (
                <button 
                  key={sub}
                  onClick={() => handleQuickAdd(sub)}
                  className="text-xs font-medium px-3 py-1.5 bg-surface-100 hover:bg-primary-100 text-surface-900 hover:text-primary-800 rounded-full border border-surface-200 hover:border-primary-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {sub}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {subscriptions.map(sub => (
                <div key={sub.id} className="p-3 bg-white border border-surface-200 rounded-xl shadow-sm flex flex-wrap gap-3 items-start md:items-center">
                  <div className="flex-1 min-w-[120px]">
                    <input 
                      type="text" 
                      value={sub.name}
                      onChange={e => updateSub(sub.id, { name: e.target.value })}
                      className="w-full text-sm font-medium focus:outline-none placeholder:text-surface-800/40 bg-transparent"
                      placeholder="Subscription Name"
                    />
                  </div>
                  <div className="w-24">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-surface-800">RM</span>
                      <input 
                        type="number" 
                        value={sub.cost}
                        onChange={e => updateSub(sub.id, { cost: e.target.value ? Number(e.target.value) : "" })}
                        className="w-full text-sm py-1.5 pl-8 pr-2 rounded-lg bg-surface-50 border border-surface-300 focus:border-primary-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-surface-800 shrink-0 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sub.shared}
                        onChange={e => updateSub(sub.id, { shared: e.target.checked })}
                        className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                      />
                      Shared
                    </label>
                    {sub.shared && (
                      <div className="flex items-center gap-1.5 bg-surface-100 px-2 py-1 rounded-md">
                        <Users className="w-3 h-3 text-surface-800" />
                        <span className="text-[10px] text-surface-800 uppercase font-bold">Total Ppl:</span>
                        <input 
                          type="number"
                          min="2"
                          value={sub.totalPeople}
                          onChange={e => updateSub(sub.id, { totalPeople: Math.max(2, parseInt(e.target.value) || 2) })}
                          className="w-12 text-xs py-0.5 px-1 bg-white border border-surface-300 rounded focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeSub(sub.id)} className="p-1.5 text-surface-800 hover:text-red-500 hover:bg-red-50 rounded-lg ml-auto transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="text" 
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSub()}
                placeholder="Other subscription..."
                className="flex-1 rounded-lg border-surface-300 bg-surface-50 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors border"
              />
              <button 
                onClick={handleAddSub}
                disabled={!newSubName}
                className="px-4 py-2 bg-surface-200 hover:bg-primary-100 text-primary-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary-500 uppercase flex items-center gap-2">
              <Target className="w-4 h-4" /> Personal Goals
            </h3>
            <div className="p-4 bg-surface-100 rounded-xl border border-surface-200 space-y-4">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-surface-900 block mb-1">Emergency Fund</label>
                  <div className="flex items-center gap-2">
                    <input type="number" className="w-full rounded-lg border-surface-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none border" placeholder="Current (RM)" value={emergencyCurrent} onChange={e => setEmergencyCurrent(e.target.value ? Number(e.target.value) : "")}/>
                    <span className="text-surface-800">/</span>
                    <input type="number" className="w-full rounded-lg border-surface-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none border" placeholder="Target (RM)" value={emergencyTarget} onChange={e => setEmergencyTarget(e.target.value ? Number(e.target.value) : "")}/>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-200">
                <label className="text-xs font-bold text-surface-900 block mb-2">Custom Savings Goal</label>
                <div className="flex items-center gap-2">
                  <input type="text" className="w-1/2 rounded-lg border-surface-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none border" placeholder="e.g. Wedding, Travel" value={customGoalName} onChange={e => setCustomGoalName(e.target.value)}/>
                  <input type="number" className="w-1/2 rounded-lg border-surface-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none border" placeholder="Target RM" value={customGoalTarget} onChange={e => setCustomGoalTarget(e.target.value ? Number(e.target.value) : "")}/>
                </div>
              </div>

            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary-500 uppercase flex items-center gap-2">
              <Shield className="w-4 h-4" /> Constraints & Priorities
            </h3>

            {constraints.length > 0 && (
              <ul className="space-y-2">
                {constraints.map((c, idx) => (
                  <li key={idx} className="flex items-center justify-between p-2.5 bg-white border border-surface-200 rounded-xl">
                    <span className="text-sm text-surface-900">{c}</span>
                    <button onClick={() => removeConstraint(idx)} className="p-1 text-surface-800 hover:text-red-500 rounded-lg"><X className="w-4 h-4"/></button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <input 
                type="text" 
                value={newConstraint}
                onChange={e => setNewConstraint(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddConstraint()}
                placeholder="e.g. Must keep RM500 buffer"
                className="flex-1 rounded-lg border-surface-300 bg-surface-50 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none border"
              />
              <button 
                onClick={handleAddConstraint}
                disabled={!newConstraint}
                className="px-4 py-2 bg-surface-200 hover:bg-primary-100 text-primary-900 text-sm font-medium rounded-lg disabled:opacity-50"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTED_CONSTRAINTS.filter(c => !constraints.includes(c)).map(c => (
                <button 
                  key={c}
                  onClick={() => {
                    setConstraints([...constraints, c]);
                  }}
                  className="text-xs font-medium px-3 py-1 bg-surface-50 text-surface-800 rounded-full border border-surface-200 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                >
                  + {c}
                </button>
              ))}
            </div>

          </div>
        </div>

        <div className="p-6 border-t border-surface-200 bg-surface-50 rounded-b-3xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-surface-800 hover:bg-surface-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            Add to Dilemma
          </button>
        </div>
      </div>
  );
}
