import { useState, useRef } from "react";
import { Loader2, ImagePlus, X, Send, Calculator, Wallet, LayoutDashboard } from "lucide-react";
import { analyzeTradeOff, fileToBase64 } from "./services/ai";
import { AiyoResponse } from "./types";
import { ResultDisplay } from "./components/ResultDisplay";
import { FinancialSnapshotPage } from "./components/FinancialSnapshotPage";
import { DashboardPage } from "./components/DashboardPage";

export default function App() {
  const [currentView, setCurrentView] = useState<"decision" | "snapshot" | "dashboard">("decision");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiyoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveSnapshot = (snapshotText: string) => {
    setText((prev) => prev + snapshotText);
    setCurrentView("decision");
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      let imageData;
      if (file) {
        imageData = await fileToBase64(file);
      }
      
      const response = await analyzeTradeOff(text, imageData);
      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong comparing your options.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 font-sans text-surface-900 selection:bg-primary-100 selection:text-primary-900 flex">
      {/* Sidebar */}
      <aside className="w-16 bg-white border-r border-surface-200 flex flex-col flex-shrink-0">
        <div className="h-18 flex items-center justify-center border-b border-surface-200">
          {/* Logo removed from sidebar top */}
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-4 items-center">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
              currentView === "dashboard" ? "bg-primary-50 text-primary-900" : "text-surface-800 hover:bg-surface-100 hover:text-surface-900"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className={`w-5 h-5 flex-shrink-0 ${currentView === "dashboard" ? "text-primary-600" : ""}`} />
          </button>
          
          <button
            onClick={() => setCurrentView("decision")}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
              currentView === "decision" ? "bg-primary-50 text-primary-900" : "text-surface-800 hover:bg-surface-100 hover:text-surface-900"
            }`}
            title="Decision Analyst"
          >
            <Calculator className={`w-5 h-5 flex-shrink-0 ${currentView === "decision" ? "text-primary-600" : ""}`} />
          </button>
          
          <button
            onClick={() => setCurrentView("snapshot")}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
              currentView === "snapshot" ? "bg-primary-50 text-primary-900" : "text-surface-800 hover:bg-surface-100 hover:text-surface-900"
            }`}
            title="Financial Snapshot"
          >
            <Wallet className={`w-5 h-5 flex-shrink-0 ${currentView === "snapshot" ? "text-primary-600" : ""}`} />
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-surface-200 sticky top-0 z-10 hidden sm:block">
          <div className="px-8 h-18 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">A</div>
               <span className="font-sans font-semibold text-xl tracking-tight text-surface-900">AiyoDecide</span>
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {currentView === "dashboard" && <DashboardPage />}
            {currentView === "decision" && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Input Form */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-200">
                    <h2 className="text-sm font-bold text-primary-500 uppercase mb-4">Current Scenario</h2>
                    
                    <form onSubmit={handleAnalyze} className="space-y-4">
                      <div>
                        <label htmlFor="dilemma" className="sr-only">Describe your situation</label>
                        <textarea
                          id="dilemma"
                          rows={6}
                          className="w-full rounded-xl border-surface-300 bg-surface-50 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors resize-none placeholder:text-surface-800/60 border"
                          placeholder="e.g. Should I rent a condo in PJ for RM1800/mo or stay in Klang for RM600 and take the LRT+Grab everyday?"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          disabled={isAnalyzing}
                        />
                      </div>

                      {/* File Upload Box */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          disabled={isAnalyzing}
                        />
                        {!file ? (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-surface-300 rounded-xl text-sm font-medium text-surface-800 hover:border-primary-500 hover:text-primary-800 hover:bg-surface-100 transition-colors bg-white"
                            disabled={isAnalyzing}
                          >
                            <ImagePlus className="w-4 h-4" />
                            Add File (Optional)
                          </button>
                        ) : (
                          <div className="relative flex items-center gap-3 py-3 px-4 bg-surface-100 border border-surface-200 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                               {file.type.startsWith("image/") ? (
                                 <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                               ) : (
                                 <ImagePlus className="w-4 h-4 text-surface-800" />
                               )}
                            </div>
                            <span className="text-sm text-surface-900 truncate min-w-0 flex-1">{file.name}</span>
                            <button
                              type="button"
                              onClick={clearFile}
                              className="p-1.5 text-surface-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={isAnalyzing}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isAnalyzing || (!text.trim() && !file)}
                          className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-700 disabled:bg-surface-200 disabled:text-surface-800 text-white py-3.5 rounded-xl font-medium transition-all active:scale-[0.98]"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Analyzing Trade-offs...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Decide Lah!
                            </>
                          )}
                        </button>
                      </div>
                      
                      {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                          {error}
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-8">
                  <ResultDisplay result={result} />
                </div>

              </div>
            )}
            
            {currentView === "snapshot" && (
              <div className="max-w-3xl mx-auto">
                <FinancialSnapshotPage
                  isOpen={true}
                  onClose={() => setCurrentView("decision")}
                  onSave={handleSaveSnapshot}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
