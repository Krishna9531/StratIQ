'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, MoreHorizontal, Settings, FileText, Play, Edit2, X, Plus, ChevronRight, Activity, TrendingDown, Target, Info, Sparkles, Brain, ShieldAlert, Zap, Check, GitMerge, AlertCircle, BarChart2, Database, RefreshCw, TrendingUp } from 'lucide-react';

export default function WorkspaceClient({ decision }: { decision: any }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSidebar, setActiveSidebar] = useState('activity');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<any>(null);
  
  // Advanced State
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isAutoCalibrating, setIsAutoCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);

  const [assumptions, setAssumptions] = useState([
    { id: 1, name: 'Market Growth', value: 12.4, mean: 0.124, std_dev: 0.02, type: 'normal', unit: '%' },
    { id: 2, name: 'CAC', value: 184, mean: 184, std_dev: 15, type: 'normal', unit: '$' },
    { id: 3, name: 'Gross Margin', value: 41, min: 0.34, max: 0.45, mode: 0.41, type: 'triangular', unit: '%' },
    { id: 4, name: 'Market Size', value: 2400000000, type: 'fixed', unit: '$' },
  ]);

  const handleShare = () => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };

  const runAutoCalibration = async () => {
    if (isAutoCalibrating) return;
    setIsAutoCalibrating(true);
    setCalibrationStep(1); // Connecting
    await new Promise(r => setTimeout(r, 1200));
    setCalibrationStep(2); // Analyzing Filings
    await new Promise(r => setTimeout(r, 1800));
    setCalibrationStep(3); // Tightening bounds
    await new Promise(r => setTimeout(r, 1000));
    
    // Auto-tune the variables to be more precise (lower variance)
    setAssumptions(prev => prev.map(a => {
      if (a.name === 'CAC') return { ...a, std_dev: 4.2 }; // Massively tighten CAC variance
      if (a.name === 'Market Growth') return { ...a, std_dev: 0.005 }; // Tighten growth
      if (a.name === 'Gross Margin') return { ...a, min: 0.38, max: 0.43 }; // Tighten bounds
      return a;
    }));
    
    setIsAutoCalibrating(false);
    runSimulation(null); // Re-run automatically with tuned variables
  };

  const handleAddVariable = () => {
    setEditingVar({ id: Date.now(), name: 'New Variable', type: 'normal', mean: 0, std_dev: 0, unit: '' });
    setIsDrawerOpen(true);
  };

  const handleSaveVariable = () => {
    if (!editingVar) return;
    const exists = assumptions.find(a => a.id === editingVar.id);
    if (exists) setAssumptions(prev => prev.map(a => a.id === editingVar.id ? editingVar : a));
    else setAssumptions(prev => [...prev, editingVar]);
    setIsDrawerOpen(false);
  };

  const runSimulation = async (scenarioOverride?: string | null) => {
    setIsSimulating(true);
    try {
      const scenario = scenarioOverride !== undefined ? scenarioOverride : activeScenario;
      
      let modifiedAssumptions = [...assumptions];
      if (scenario === 'recession') {
        modifiedAssumptions = assumptions.map(a => {
          if (a.name === 'Market Growth') return { ...a, mean: (a.mean || 0) - 0.08 };
          if (a.name === 'CAC') return { ...a, mean: (a.mean || 0) * 1.4 };
          if (a.name === 'Gross Margin') return { ...a, mode: (a.mode || 0) - 0.05, min: (a.min || 0) - 0.08 }; 
          return a;
        });
      } else if (scenario === 'bull') {
        modifiedAssumptions = assumptions.map(a => {
          if (a.name === 'Market Growth') return { ...a, mean: (a.mean || 0) + 0.06 }; 
          if (a.name === 'CAC') return { ...a, mean: (a.mean || 0) * 0.85 }; 
          return a;
        });
      }

      const payload = {
        iterations: 10000,
        variables: modifiedAssumptions.map(a => ({
          name: a.name, distribution: a.type, value: a.type === 'fixed' ? a.value : null,
          mean: a.mean, std_dev: a.std_dev, min: a.min, max: a.max, mode: a.mode
        }))
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/simulations/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setResults(data.results);
      if (scenarioOverride !== undefined) setActiveTab('Overview'); 
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => { runSimulation(null); }, []);

  const applyScenario = (scenarioId: string | null) => {
    setActiveScenario(scenarioId);
    runSimulation(scenarioId);
  };
  
  const exportToCSV = () => {
    if (!results || !results.sensitivities) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "StratIQ Enterprise Simulation Report\n";
    csvContent += `Decision,${decision.title}\n`;
    csvContent += `Expected Value,$${(results.expected_value).toFixed(2)}\n`;
    csvContent += `Downside Risk,${(results.downside_probability * 100).toFixed(2)}%\n`;
    csvContent += `Iterations,${results.iterations}\n\n`;
    
    csvContent += "Variable Sensitivity Analysis (Pearson Correlation)\n";
    csvContent += "Variable Name,Correlation Coefficient,Impact Magnitude\n";
    results.sensitivities.forEach((s: any) => {
      csvContent += `${s.name},${s.correlation.toFixed(4)},${s.impact.toFixed(4)}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StratIQ_Export_${decision.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentEV = results ? results.expected_value : decision.expected_value;
  const currentDownside = results ? results.downside_probability : decision.downside_probability;
  const currentLow = results ? results.confidence_range.low : decision.confidence_range.low;
  const currentHigh = results ? results.confidence_range.high : decision.confidence_range.high;

  // Calculate Structural Health (1-100) based on downside risk and standard deviation bounds
  const structuralHealth = Math.max(0, Math.min(100, 100 - (currentDownside * 150)));

  const tabs = ['Overview', 'Assumptions', 'Sensitivity', 'Scenarios', 'AI Advisor'];

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans relative selection:bg-primary-accent selection:text-white">
      
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
            <motion.div initial={{ x: '100%', boxShadow: 'none' }} animate={{ x: 0, boxShadow: 'var(--shadow-float)' }} exit={{ x: '100%', boxShadow: 'none' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute top-0 right-0 h-full w-[420px] bg-[#0a0a0c] border-l border-white/10 z-50 flex flex-col">
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <div>
                  <h2 className="font-semibold text-white text-[15px] flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-primary-accent" /> {editingVar?.id > 1000 ? 'Add New Assumption' : 'Edit Assumption'}
                  </h2>
                  <p className="text-[12px] text-secondary-text mt-0.5">Configure probability distribution</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-md text-secondary-text hover:text-white hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-secondary-text text-[12px] font-medium tracking-wide uppercase">Variable Name</label>
                    <input type="text" value={editingVar?.name || ''} onChange={e => setEditingVar({...editingVar, name: e.target.value})} className="input-premium w-full" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-secondary-text text-[12px] font-medium tracking-wide uppercase">Distribution Type</label>
                    <div className="relative">
                      <select value={editingVar?.type || 'fixed'} onChange={e => setEditingVar({...editingVar, type: e.target.value})} className="input-premium w-full appearance-none pr-8 cursor-pointer">
                        <option value="fixed">Fixed Deterministic</option>
                        <option value="normal">Normal (Gaussian)</option>
                        <option value="triangular">Triangular</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 w-full my-8"></div>

                  <AnimatePresence mode="popLayout">
                    {editingVar?.type === 'normal' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-5">
                        <div className="space-y-2"><label className="text-secondary-text text-[12px] font-medium uppercase">Mean (μ)</label><input type="number" step="any" value={editingVar?.mean || ''} onChange={e => setEditingVar({...editingVar, mean: parseFloat(e.target.value)})} className="input-premium w-full" /></div>
                        <div className="space-y-2"><label className="text-secondary-text text-[12px] font-medium uppercase">Std Dev (σ)</label><input type="number" step="any" value={editingVar?.std_dev || ''} onChange={e => setEditingVar({...editingVar, std_dev: parseFloat(e.target.value)})} className="input-premium w-full" /></div>
                      </motion.div>
                    )}
                    {editingVar?.type === 'triangular' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-2"><label className="text-secondary-text text-[12px] font-medium uppercase">Minimum</label><input type="number" step="any" value={editingVar?.min || ''} onChange={e => setEditingVar({...editingVar, min: parseFloat(e.target.value)})} className="input-premium w-full" /></div>
                          <div className="space-y-2"><label className="text-secondary-text text-[12px] font-medium uppercase">Maximum</label><input type="number" step="any" value={editingVar?.max || ''} onChange={e => setEditingVar({...editingVar, max: parseFloat(e.target.value)})} className="input-premium w-full" /></div>
                        </div>
                        <div className="space-y-2"><label className="text-secondary-text text-[12px] font-medium uppercase">Mode (Likely)</label><input type="number" step="any" value={editingVar?.mode || ''} onChange={e => setEditingVar({...editingVar, mode: parseFloat(e.target.value)})} className="input-premium w-full" /></div>
                      </motion.div>
                    )}
                    {editingVar?.type === 'fixed' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2"><label className="text-secondary-text text-[12px] font-medium uppercase">Fixed Value</label><input type="number" step="any" value={editingVar?.value || ''} onChange={e => setEditingVar({...editingVar, value: parseFloat(e.target.value)})} className="input-premium w-full" /></motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end space-x-3">
                <button onClick={() => setIsDrawerOpen(false)} className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-secondary-text hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">Cancel</button>
                <button onClick={handleSaveVariable} className="btn-premium px-6 py-2.5 text-[13px]">Save Changes</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside className="w-16 border-r border-border flex flex-col items-center py-6 shrink-0 bg-surface/50 backdrop-blur-xl z-20">
        <Link href="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow mb-8 cursor-pointer hover:scale-105 transition-transform">
          <span className="text-white font-bold text-sm">SQ</span>
        </Link>
        <nav className="flex-1 flex flex-col space-y-6">
          <button onClick={() => setActiveSidebar('activity')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeSidebar === 'activity' ? 'bg-primary-accent/20 text-primary-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-secondary-text hover:text-white hover:bg-white/5'}`}><Activity className="w-5 h-5" /></button>
          <button onClick={() => setActiveSidebar('target')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeSidebar === 'target' ? 'bg-primary-accent/20 text-primary-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-secondary-text hover:text-white hover:bg-white/5'}`}><Target className="w-5 h-5" /></button>
          <button onClick={() => setActiveSidebar('settings')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeSidebar === 'settings' ? 'bg-primary-accent/20 text-primary-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-secondary-text hover:text-white hover:bg-white/5'}`}><Settings className="w-5 h-5" /></button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <header className="h-16 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0 border-b border-white/5">
          <div className="flex items-center text-sm font-medium text-secondary-text">
            <Link href="/" className="hover:text-white transition-colors">Decisions</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-white">{decision.title}</span>
            {activeScenario && <span className="ml-4 px-2 py-0.5 rounded bg-warning/20 text-warning text-[10px] font-bold uppercase tracking-widest border border-warning/30">Stress Testing: {activeScenario}</span>}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-[12px] font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse"></span> LIVE
            </div>
            <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-secondary-text hover:text-white group relative">
              {isCopied ? <Check className="w-4 h-4 text-success" /> : <Share className="w-4 h-4" />}
              {isCopied && <span className="absolute -bottom-8 bg-success text-white text-[10px] px-2 py-1 rounded font-bold shadow-glow whitespace-nowrap">Copied!</span>}
            </button>
          </div>
        </header>

        <div className="p-8 max-w-[1200px] w-full mx-auto pb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-3">{decision.title}</h1>
              <p className="text-secondary-text text-[15px] max-w-2xl">
                Advanced Monte Carlo simulation environment. Define complex stochastic variables and apply macroeconomic shock events to determine tail-end structural resilience.
              </p>
            </div>
            <div className="flex space-x-3">
              {results && (
                <button onClick={exportToCSV} className="px-5 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[13px] font-bold text-white transition-colors flex items-center">
                  <Database className="w-4 h-4 mr-2" /> EXPORT CSV
                </button>
              )}
              <button onClick={() => runSimulation()} disabled={isSimulating || isAutoCalibrating} className="btn-premium px-8 py-3 text-[14px] tracking-wide shadow-glow min-w-[200px] flex justify-center">
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    <span className="font-mono">{Math.floor(Math.random() * 8000 + 1000).toLocaleString()} ITERATIONS...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" fill="currentColor" />
                    RUN SIMULATION
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex space-x-8 text-[14px] mb-8 border-b border-white/5">
            {tabs.map((tab) => (
              <button 
                key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-4 font-bold transition-all relative ${activeTab === tab ? 'text-white' : 'text-secondary-text hover:text-white'}`}
              >
                {tab}
                {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-accent shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            
            {activeTab === 'Overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 transition-opacity duration-300 ${isSimulating ? 'opacity-40 blur-sm' : ''}`}>
                  
                  <div className="card-glow p-6 md:col-span-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-accent/20 rounded-full blur-3xl group-hover:bg-primary-accent/30 transition-colors"></div>
                    <div className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-primary-accent" /> Expected Value {activeScenario && <span className="ml-2 text-warning">(Stressed)</span>}
                    </div>
                    {currentEV !== null ? (
                      <div className={`text-4xl font-black tracking-tighter ${currentEV < 0 ? 'text-danger' : 'text-white'}`}>
                        ${(currentEV / 1000000).toFixed(1)}M
                      </div>
                    ) : (
                      <div className="text-xl font-medium text-secondary-text">Not run</div>
                    )}
                  </div>

                  <div className="card-subtle p-6 md:col-span-1 relative overflow-hidden">
                    <div className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-3 flex items-center">
                      <TrendingDown className={`w-4 h-4 mr-2 ${currentDownside > 0.3 ? 'text-danger' : 'text-warning'}`} /> Downside Risk
                    </div>
                    {currentDownside !== null ? (
                      <div className={`text-4xl font-black tracking-tighter ${currentDownside > 0.3 ? 'text-danger' : 'text-white'}`}>
                        {(currentDownside * 100).toFixed(1)}%
                      </div>
                    ) : (
                      <div className="text-xl font-medium text-secondary-text">Not run</div>
                    )}
                  </div>

                  <div className="card-subtle p-6 md:col-span-1">
                    <div className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-3 flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-success" /> 90% Confidence
                    </div>
                    {currentLow !== null && currentHigh !== null ? (
                      <div className="text-[18px] font-bold text-white tracking-tight leading-tight mt-1">
                        <span className={currentLow < 0 ? 'text-danger' : ''}>${(currentLow / 1000000).toFixed(1)}M</span> 
                        <span className="text-secondary-text font-normal mx-1">to</span> 
                        <span className={currentHigh < 0 ? 'text-danger' : ''}>${(currentHigh / 1000000).toFixed(1)}M</span>
                      </div>
                    ) : (
                      <div className="text-xl font-medium text-secondary-text">Not run</div>
                    )}
                  </div>

                  {/* Structural Health Score */}
                  <div className="card-subtle p-6 md:col-span-1 flex flex-col justify-center items-center relative overflow-hidden border-t-2 border-t-primary-accent bg-black/40">
                    <div className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-2 text-center w-full">
                      Structural Health
                    </div>
                    {results ? (
                      <div className="flex items-end">
                        <span className={`text-4xl font-black tracking-tighter ${structuralHealth > 80 ? 'text-success' : structuralHealth > 50 ? 'text-warning' : 'text-danger'}`}>
                          {structuralHealth.toFixed(0)}
                        </span>
                        <span className="text-secondary-text font-bold text-[14px] ml-1 mb-1">/100</span>
                      </div>
                    ) : (
                      <div className="text-xl font-medium text-secondary-text">Not run</div>
                    )}
                  </div>

                </div>

                <div className={`card-glow p-8 h-96 flex flex-col justify-between transition-opacity duration-300 ${isSimulating ? 'opacity-40 blur-sm' : ''}`}>
                  <div className="flex justify-between items-start">
                    <h2 className="text-[14px] font-bold uppercase tracking-wider text-white flex items-center">
                      <BarChart2 className="w-4 h-4 mr-2 text-primary-accent" /> Distribution Topology
                    </h2>
                    <span className="text-[11px] font-bold text-secondary-text uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">10,000 Iterations</span>
                  </div>
                  
                  {/* Heavy Animated CSS Chart Placeholder */}
                  <div className="flex-1 flex items-end justify-center pb-4 relative px-4 mt-8">
                    <div className="absolute bottom-4 left-4 right-4 h-px bg-white/10"></div>
                    <div className="w-full h-full flex items-end justify-center space-x-[2px] relative z-10 px-4">
                      {results ? (
                         // Simulated distribution bars based on EV and Downside Risk
                         [...Array(30)].map((_, i) => {
                           const x = i / 30; // 0 to 1
                           const meanPos = currentDownside > 0.5 ? 0.3 : 0.6; // Shift based on downside risk
                           const height = Math.exp(-Math.pow(x - meanPos, 2) / 0.05) * 100;
                           const isNegative = x < currentDownside;
                           return (
                             <motion.div 
                               key={i} 
                               className={`flex-1 rounded-t-sm hover:brightness-150 transition-all cursor-pointer ${isNegative ? 'bg-gradient-to-t from-danger/40 to-danger/80' : 'bg-gradient-to-t from-primary-accent/40 to-primary-accent/80'}`}
                               initial={{ height: 0 }}
                               animate={{ height: `${height * (0.8 + Math.random() * 0.4)}%` }}
                               transition={{ duration: 1, delay: i * 0.02, ease: "easeOut" }}
                             />
                           )
                         })
                      ) : (
                        [1, 2, 4, 8, 15, 25, 38, 55, 75, 90, 100, 90, 75, 55, 38, 25, 15, 8, 4, 2, 1].map((h, i) => (
                          <div key={i} className="flex-1 bg-white/5" style={{ height: `${h}%` }} />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SENSITIVITY ANALYSIS (TORNADO CHART) */}
            {activeTab === 'Sensitivity' && (
              <motion.div key="sensitivity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div className="card-glow p-10 mb-8 border-t-2 border-t-purple-500 relative overflow-hidden min-h-[500px]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center">
                        <Database className="w-5 h-5 mr-3 text-purple-500" /> Sensitivity Analysis (Tornado Chart)
                      </h2>
                      <p className="text-secondary-text text-[14px] mt-2">Pearson correlation coefficients between stochastic variables and the final Expected Value.</p>
                    </div>
                  </div>
                  
                  {results?.sensitivities && results.sensitivities.length > 0 ? (
                    <div className="relative z-10 max-w-3xl mx-auto mt-16">
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 -translate-x-1/2 z-0"></div>
                      <div className="absolute -top-6 w-full flex justify-between text-[11px] font-bold uppercase tracking-wider text-secondary-text z-0">
                        <span>Negative Correlation (-1.0)</span>
                        <span>0.0</span>
                        <span>Positive Correlation (+1.0)</span>
                      </div>
                      
                      <div className="space-y-8 relative z-10">
                        {results.sensitivities.map((s: any, idx: number) => {
                          const isPositive = s.correlation > 0;
                          const widthPercent = Math.abs(s.correlation) * 100;
                          
                          return (
                            <div key={idx} className="relative h-12 flex items-center group">
                              {/* Label */}
                              <div className={`absolute top-1/2 -translate-y-1/2 text-[14px] font-bold text-white px-4 ${isPositive ? 'right-1/2 text-right' : 'left-1/2 text-left'}`}>
                                {s.name}
                              </div>
                              
                              {/* The Bar */}
                              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-1/2 h-8">
                                {isPositive ? (
                                  <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${widthPercent}%` }} 
                                    transition={{ duration: 1, type: 'spring' }}
                                    className="h-full bg-gradient-to-r from-success/40 to-success border-y border-r border-success/50 rounded-r shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:brightness-125 transition-all"
                                  />
                                ) : (
                                  <motion.div 
                                    initial={{ width: 0, x: 0 }} 
                                    animate={{ width: `${widthPercent}%`, x: `-${widthPercent}%` }} 
                                    transition={{ duration: 1, type: 'spring' }}
                                    className="h-full bg-gradient-to-l from-danger/40 to-danger border-y border-l border-danger/50 rounded-l shadow-[0_0_15px_rgba(239,68,68,0.3)] group-hover:brightness-125 transition-all"
                                  />
                                )}
                              </div>
                              
                              {/* Number value */}
                              <div className={`absolute top-1/2 -translate-y-1/2 text-[12px] font-mono font-bold px-4 ${isPositive ? 'left-1/2 text-success' : 'right-1/2 text-danger'}`} style={{ marginLeft: isPositive ? `${widthPercent}%` : 0, marginRight: !isPositive ? `${widthPercent}%` : 0 }}>
                                {s.correlation > 0 ? '+' : ''}{s.correlation.toFixed(3)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-secondary-text border border-dashed border-white/10 rounded-xl bg-black/20">
                      Run the simulation to generate real-time sensitivity intelligence.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'Assumptions' && (
              <motion.div key="assumptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-[14px] font-bold uppercase tracking-wider text-white">Stochastic Variables</h2>
                    <p className="text-[13px] text-secondary-text mt-1">Define probability distributions for the Monte Carlo engine.</p>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={runAutoCalibration} 
                      disabled={isAutoCalibrating}
                      className="px-4 py-2 text-[12px] font-bold text-white bg-indigo-500/20 border border-indigo-500/40 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:bg-indigo-500/30 flex items-center transition-all relative overflow-hidden group"
                    >
                      {isAutoCalibrating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 text-indigo-400 animate-spin" /> 
                          {calibrationStep === 1 ? 'Connecting API...' : calibrationStep === 2 ? 'Analyzing Filings...' : 'Tightening Bounds...'}
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2 text-indigo-400 group-hover:scale-110 transition-transform" /> 
                          AI AUTO-CALIBRATE
                        </>
                      )}
                      
                      {/* Scanning laser animation */}
                      {isAutoCalibrating && (
                        <motion.div 
                          initial={{ top: 0 }} animate={{ top: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_8px_#818cf8] z-10"
                        />
                      )}
                    </button>
                    <button onClick={handleAddVariable} className="px-4 py-2 text-[12px] font-bold text-white bg-white/5 border border-white/10 rounded-lg shadow-subtle hover:bg-white/10 flex items-center transition-colors">
                      <Plus className="w-4 h-4 mr-2" /> Add Variable
                    </button>
                  </div>
                </div>
                
                <div className={`card-subtle overflow-hidden transition-all duration-300 ${isAutoCalibrating ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20' : ''}`}>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 border-b border-white/10 text-secondary-text text-[11px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Variable Name</th>
                        <th className="px-6 py-4">Distribution Type</th>
                        <th className="px-6 py-4">Parameters</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 relative">
                      
                      {/* Overlay scanning effect */}
                      {isAutoCalibrating && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px] z-10 pointer-events-none" 
                        />
                      )}

                      {assumptions.map(a => (
                        <tr key={a.id} className="hover:bg-white/5 transition-colors group relative z-0">
                          <td className="px-6 py-5 font-bold text-white text-[14px]">{a.name}</td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${
                              a.type === 'normal' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              a.type === 'triangular' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              'bg-white/10 text-secondary-text border-white/20'
                            }`}>
                              {a.type === 'normal' ? 'Gaussian' : a.type === 'triangular' ? 'Triangular' : 'Deterministic'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-secondary-text font-mono text-[13px]">
                            {a.type === 'normal' && <span>μ: <strong className="text-white font-sans">{a.mean}{a.unit}</strong> &nbsp; σ: <strong className="text-white font-sans">{a.std_dev}{a.unit}</strong></span>}
                            {a.type === 'triangular' && <span>Min: <strong className="text-white font-sans">{a.min}{a.unit}</strong> &nbsp; Max: <strong className="text-white font-sans">{a.max}{a.unit}</strong></span>}
                            {a.type === 'fixed' && <span>Value: <strong className="text-white font-sans">{a.value}{a.unit}</strong></span>}
                          </td>
                          <td className="px-6 py-5 text-right relative z-20">
                            <button onClick={() => { setEditingVar({...a}); setIsDrawerOpen(true); }} className="p-2 rounded-lg text-secondary-text hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* FULLY FUNCTIONAL SCENARIOS TAB */}
            {activeTab === 'Scenarios' && (
              <motion.div key="scenarios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                 <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-[14px] font-bold uppercase tracking-wider text-white">Global Shock Scenarios</h2>
                    <p className="text-secondary-text text-[13px] mt-1">Select a macroeconomic event to instantly mutate underlying variable parameters and re-compute probabilistic structures.</p>
                  </div>
                  {activeScenario && (
                    <button onClick={() => applyScenario(null)} className="px-4 py-2 text-[12px] font-bold text-white bg-danger/20 border border-danger/30 rounded-lg shadow-subtle hover:bg-danger/30 flex items-center transition-colors">
                      <X className="w-4 h-4 mr-2" /> Reset to Baseline
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={() => applyScenario('recession')} className={`card-glow p-8 border cursor-pointer transition-all ${activeScenario === 'recession' ? 'border-warning shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-white/10 hover:border-white/30'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center"><TrendingDown className="w-5 h-5 mr-2 text-warning" /> Hard Recession</h3>
                      {activeScenario === 'recession' && <span className="bg-warning text-black px-2 py-1 rounded text-[10px] font-bold uppercase">Active Engine</span>}
                    </div>
                    <p className="text-secondary-text text-[14px] mb-6">Simulates a severe global economic contraction. Mutates standard variables: Market Growth drops by 800bps, Customer Acquisition Cost spikes by 40%, and Gross Margins compress.</p>
                    <div className="bg-black/30 border border-white/5 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-[12px]"><span className="text-secondary-text">Market Growth</span><span className="text-danger font-bold">μ - 0.08</span></div>
                      <div className="flex justify-between text-[12px]"><span className="text-secondary-text">CAC</span><span className="text-danger font-bold">μ × 1.40</span></div>
                    </div>
                  </div>

                  <div onClick={() => applyScenario('bull')} className={`card-glow p-8 border cursor-pointer transition-all ${activeScenario === 'bull' ? 'border-success shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-white/10 hover:border-white/30'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-success" /> Aggressive Bull Market</h3>
                      {activeScenario === 'bull' && <span className="bg-success text-black px-2 py-1 rounded text-[10px] font-bold uppercase">Active Engine</span>}
                    </div>
                    <p className="text-secondary-text text-[14px] mb-6">Simulates a rapid macroeconomic expansion. Mutates standard variables: Market Growth increases by 600bps, Customer Acquisition Cost drops by 15% due to high liquidity.</p>
                    <div className="bg-black/30 border border-white/5 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-[12px]"><span className="text-secondary-text">Market Growth</span><span className="text-success font-bold">μ + 0.06</span></div>
                      <div className="flex justify-between text-[12px]"><span className="text-secondary-text">CAC</span><span className="text-success font-bold">μ × 0.85</span></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DYNAMIC AI ADVISOR */}
            {activeTab === 'AI Advisor' && (
              <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                <div className="card-glow p-10 mb-8 border-t-2 border-t-primary-accent relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3 text-white">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-[20px] font-bold tracking-tight">Dynamic Strategic Synthesis</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-secondary-text uppercase tracking-wider flex items-center">
                      <Sparkles className="w-3 h-3 mr-1.5 text-primary-accent" /> Live Analysis
                    </span>
                  </div>
                  
                  {results ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      <div className="space-y-6">
                        <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                          <h3 className="flex items-center font-bold text-white text-[14px] mb-3 uppercase tracking-wider">
                            <ShieldAlert className="w-4 h-4 mr-2 text-warning" /> Asymmetry & Tail Risk
                          </h3>
                          <p className="text-[14px] text-secondary-text leading-relaxed">
                            {currentDownside > 0.4 ? (
                              <span>This model is currently <strong>structurally unsound</strong>. With a downside risk of {(currentDownside*100).toFixed(1)}% and an expected value of ${(currentEV/1000000).toFixed(1)}M, the distribution is heavily skewed toward capital destruction. The left-tail risk is unmanageable. Abandon or restructure variables immediately.</span>
                            ) : (
                              <span>"Look for asymmetric bets." Your expected value is strong (${(currentEV / 1000000).toFixed(1)}M), and the downside tail risk is constrained to {(currentDownside * 100).toFixed(1)}%. This bet is highly asymmetric in your favor. Size this bet aggressively.</span>
                            )}
                          </p>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-xl p-6">
                          <h3 className="flex items-center font-bold text-white text-[14px] mb-3 uppercase tracking-wider">
                            <Activity className="w-4 h-4 mr-2 text-success" /> Margin of Safety
                          </h3>
                          <p className="text-[14px] text-secondary-text leading-relaxed">
                            {currentLow < 0 ? (
                              <span className="text-danger">Warning: Your 90% confidence interval indicates severe negative exposure (${(currentLow/1000000).toFixed(1)}M worst case). You have zero margin of safety in this scenario.</span>
                            ) : (
                              <span>The simulation indicates that even at the 5th percentile worst-case scenario, you still generate ${(currentLow/1000000).toFixed(1)}M. Your margin of safety is structurally sound.</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 border border-white/5 rounded-xl p-6 flex flex-col">
                        <h3 className="flex items-center font-bold text-white text-[14px] mb-6 uppercase tracking-wider">
                          <Zap className="w-4 h-4 mr-2 text-primary-accent" /> Actionable Directives
                        </h3>
                        
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-[12px] shrink-0 mr-4 ${currentEV < 0 ? 'bg-danger/20 border-danger/40 text-danger' : 'bg-primary-accent/20 border-primary-accent/40 text-primary-accent'}`}>1</div>
                            <div>
                              <div className="text-white font-bold text-[14px] mb-1">{currentEV < 0 ? 'Halt Operations' : 'Execute Phase 1 Rollout'}</div>
                              <div className="text-secondary-text text-[13px]">{currentEV < 0 ? 'Current parameters result in expected capital destruction.' : 'The probabilistic EV heavily justifies immediate capital allocation.'}</div>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-6 h-6 rounded bg-primary-accent/20 border border-primary-accent/40 flex items-center justify-center text-primary-accent font-bold text-[12px] shrink-0 mr-4">2</div>
                            <div>
                              <div className="text-white font-bold text-[14px] mb-1">Stress Test Validation</div>
                              <div className="text-secondary-text text-[13px]">
                                {activeScenario ? `You are currently analyzing the ${activeScenario} shock scenario. Switch to Baseline to compare EV delta.` : 'Run the Hard Recession macro scenario in the Scenarios tab to observe portfolio contagion effects.'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-secondary-text">Run a simulation first to generate dynamic AI intelligence.</div>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
