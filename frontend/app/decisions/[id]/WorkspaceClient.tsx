'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, MoreHorizontal, Settings, FileText, Play, Edit2, X, Plus, ChevronRight, Activity, TrendingDown, Target, Info, Sparkles, Brain, ShieldAlert, Zap } from 'lucide-react';

export default function WorkspaceClient({ decision }: { decision: any }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<any>(null);

  // Assumptions State
  const [assumptions, setAssumptions] = useState([
    { id: 1, name: 'Market Growth', value: 8.2, mean: 0.082, std_dev: 0.018, type: 'normal', unit: '%' },
    { id: 2, name: 'CAC', value: 142, mean: 142, std_dev: 15, type: 'normal', unit: '$' },
    { id: 3, name: 'Gross Margin', value: 41, min: 0.34, max: 0.45, mode: 0.41, type: 'triangular', unit: '%' },
    { id: 4, name: 'Market Size', value: 2400000000, type: 'fixed', unit: '$' },
    { id: 5, name: 'Customers', value: 10000, type: 'fixed', unit: '' }
  ]);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const payload = {
        iterations: 10000,
        variables: assumptions.map(a => ({
          name: a.name,
          distribution: a.type,
          value: a.type === 'fixed' ? a.value : null,
          mean: a.mean,
          std_dev: a.std_dev,
          min: a.min,
          max: a.max,
          mode: a.mode
        }))
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/simulations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Premium UX delay
      
      setResults(data.results);
      setActiveTab('Overview'); 
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveVariable = () => {
    if (!editingVar) return;
    setAssumptions(prev => prev.map(a => a.id === editingVar.id ? editingVar : a));
    setIsDrawerOpen(false);
  };

  const currentEV = results ? results.expected_value : decision.expected_value;
  const currentDownside = results ? results.downside_probability : decision.downside_probability;
  const currentLow = results ? results.confidence_range.low : decision.confidence_range.low;
  const currentHigh = results ? results.confidence_range.high : decision.confidence_range.high;

  const tabs = ['Overview', 'Assumptions', 'Scenarios', 'AI Advisor'];

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans relative selection:bg-primary-accent selection:text-white text-primary-text">
      
      {/* Heavy UI Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40" 
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%', boxShadow: 'none' }} animate={{ x: 0, boxShadow: 'var(--shadow-float)' }} exit={{ x: '100%', boxShadow: 'none' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[420px] bg-background border-l border-border z-50 flex flex-col"
            >
              <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface">
                <div>
                  <h2 className="font-semibold text-primary-text text-[15px] flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-primary-accent" /> Edit Assumption
                  </h2>
                  <p className="text-[12px] text-secondary-text mt-0.5">Configure probability distribution</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-md text-secondary-text hover:text-primary-text hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="space-y-6">
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-secondary-text text-[12px] font-medium tracking-wide uppercase">Variable Name</label>
                    <input 
                      type="text" 
                      value={editingVar?.name || ''} 
                      onChange={e => setEditingVar({...editingVar, name: e.target.value})}
                      className="input-premium w-full" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-secondary-text text-[12px] font-medium tracking-wide uppercase">
                      Distribution Type
                    </label>
                    <div className="relative">
                      <select 
                        value={editingVar?.type || 'fixed'}
                        onChange={e => setEditingVar({...editingVar, type: e.target.value})}
                        className="input-premium w-full appearance-none pr-8 cursor-pointer"
                      >
                        <option value="fixed">Fixed Deterministic</option>
                        <option value="normal">Normal (Gaussian)</option>
                        <option value="triangular">Triangular</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-px bg-border w-full my-8"></div>

                  <AnimatePresence mode="popLayout">
                    {editingVar?.type === 'normal' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="flex text-secondary-text text-[12px] font-medium tracking-wide uppercase">Mean (μ)</label>
                          <input type="number" step="any" value={editingVar?.mean || ''} onChange={e => setEditingVar({...editingVar, mean: parseFloat(e.target.value)})} className="input-premium w-full" />
                        </div>
                        <div className="space-y-2">
                          <label className="flex text-secondary-text text-[12px] font-medium tracking-wide uppercase">Std Dev (σ)</label>
                          <input type="number" step="any" value={editingVar?.std_dev || ''} onChange={e => setEditingVar({...editingVar, std_dev: parseFloat(e.target.value)})} className="input-premium w-full" />
                        </div>
                      </motion.div>
                    )}

                    {editingVar?.type === 'triangular' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="flex text-secondary-text text-[12px] font-medium tracking-wide uppercase">Minimum</label>
                            <input type="number" step="any" value={editingVar?.min || ''} onChange={e => setEditingVar({...editingVar, min: parseFloat(e.target.value)})} className="input-premium w-full" />
                          </div>
                          <div className="space-y-2">
                            <label className="flex text-secondary-text text-[12px] font-medium tracking-wide uppercase">Maximum</label>
                            <input type="number" step="any" value={editingVar?.max || ''} onChange={e => setEditingVar({...editingVar, max: parseFloat(e.target.value)})} className="input-premium w-full" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="flex text-secondary-text text-[12px] font-medium tracking-wide uppercase">Most Likely (Mode)</label>
                          <input type="number" step="any" value={editingVar?.mode || ''} onChange={e => setEditingVar({...editingVar, mode: parseFloat(e.target.value)})} className="input-premium w-full" />
                        </div>
                      </motion.div>
                    )}

                    {editingVar?.type === 'fixed' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                        <label className="flex text-secondary-text text-[12px] font-medium tracking-wide uppercase">Fixed Value</label>
                        <input type="number" step="any" value={editingVar?.value || ''} onChange={e => setEditingVar({...editingVar, value: parseFloat(e.target.value)})} className="input-premium w-full" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="p-6 border-t border-border flex justify-end space-x-3 bg-surface">
                <button onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border border-border rounded-md text-[13px] font-medium text-secondary-text hover:text-primary-text hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleSaveVariable} className="btn-premium px-4 py-2 text-[13px]">Save Changes</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Glassmorphic Sidebar */}
      <aside className="w-16 border-r border-border flex flex-col items-center py-6 shrink-0 bg-surface backdrop-blur-xl z-20">
        <Link href="/">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-8 cursor-pointer shadow-glow hover:opacity-90 transition-opacity">
            <span className="text-white font-bold text-[12px] tracking-tighter">SQ</span>
          </div>
        </Link>
        <div className="space-y-4 text-secondary-text">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg text-primary-accent bg-primary-accent/10 border border-primary-accent/20 shadow-glow cursor-pointer">
            <Activity className="w-[20px] h-[20px]" strokeWidth={2.5} />
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:text-primary-text hover:bg-white/10 transition-colors cursor-pointer">
            <Target className="w-[20px] h-[20px]" strokeWidth={2.5} />
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:text-primary-text hover:bg-white/10 transition-colors cursor-pointer">
            <Settings className="w-[20px] h-[20px]" strokeWidth={2.5} />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <header className="px-10 pt-10 pb-0 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
          
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="mb-4 flex items-center space-x-2 text-[12.5px] font-medium text-secondary-text uppercase tracking-widest">
                <Link href="/" className="hover:text-primary-accent transition-colors flex items-center">
                  <span>Portfolio</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <span className="text-primary-text">{decision.title}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center">
                {decision.title}
                <span className="ml-4 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 shadow-subtle">
                  {decision.status}
                </span>
              </h1>
              <p className="text-secondary-text text-[15px] max-w-2xl">{decision.description}</p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4">
              <button className="px-4 py-2 bg-surface border border-border rounded-md text-[13px] font-medium text-secondary-text hover:text-white hover:border-border-hover transition-colors shadow-subtle flex items-center">
                <Share className="w-4 h-4 mr-2" /> Share
              </button>
              <button 
                onClick={runSimulation} 
                disabled={isSimulating} 
                className="btn-premium px-5 py-2 min-w-[160px]"
              >
                {isSimulating ? (
                  <span className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Play className="w-4 h-4 mr-2" fill="currentColor" />
                )}
                {isSimulating ? 'Simulating...' : 'Run Analysis'}
              </button>
            </div>
          </div>

          <div className="flex space-x-8 text-[14px] relative">
            {tabs.map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-semibold tracking-wide transition-colors relative z-10 flex items-center ${activeTab === tab ? 'text-white' : 'text-secondary-text hover:text-white'}`}
              >
                {tab === 'AI Advisor' && <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary-accent" />}
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-accent rounded-t-full shadow-glow" 
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        <div className="p-10 max-w-[1100px] w-full mx-auto pb-32">
          
          <AnimatePresence mode="wait">
            
            {activeTab === 'Overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className={`card-glow p-8 transition-opacity duration-300 ${isSimulating ? 'opacity-40' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[13px] font-semibold tracking-wider uppercase text-secondary-text flex items-center">
                        <TrendingDown className="w-4 h-4 mr-2 text-primary-accent" /> Expected Value
                      </div>
                    </div>
                    <div className="text-[42px] tracking-tighter text-white font-bold mb-8">
                      ${(currentEV / 1000000).toFixed(1)}M
                    </div>
                    
                    <div className="pt-5 border-t border-border grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[12px] text-secondary-text mb-1.5 font-medium uppercase tracking-wider">Downside Risk</div>
                        <div className="text-[16px] font-bold text-white">{(currentDownside * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-[12px] text-secondary-text mb-1.5 font-medium uppercase tracking-wider">Break-even</div>
                        <div className="text-[16px] font-bold text-white">Month {decision.break_even_month}</div>
                      </div>
                    </div>
                  </div>

                  <div className={`card-subtle p-8 transition-opacity duration-300 flex flex-col justify-between ${isSimulating ? 'opacity-40' : ''}`}>
                    <div>
                      <div className="text-[13px] font-semibold tracking-wider uppercase text-secondary-text mb-6">90% Confidence Interval</div>
                      <div className="flex items-center h-4 mb-6">
                        <span className="text-secondary-text font-medium text-[13px] w-14 text-right">${(currentLow / 1000000).toFixed(1)}M</span>
                        <div className="flex-1 mx-5 h-[6px] bg-white/5 rounded-full relative overflow-hidden border border-white/10">
                          <div className="absolute top-0 bottom-0 left-0 bg-primary-accent/20" style={{ width: '60%' }}></div>
                          <motion.div 
                            layout
                            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary-accent shadow-glow border-2 border-background z-10" 
                            style={{ left: `${Math.max(10, Math.min(90, ((currentEV - currentLow) / (currentHigh - currentLow)) * 100))}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                          />
                        </div>
                        <span className="text-secondary-text font-medium text-[13px] w-14">${(currentHigh / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                    
                    <div className="pt-5 border-t border-border">
                      <div className="text-[12px] text-secondary-text mb-1.5 font-medium uppercase tracking-wider">Key Uncertainty</div>
                      <div className="text-[16px] font-bold text-white">{decision.key_uncertainty}</div>
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 transition-opacity duration-300 ${isSimulating ? 'opacity-40' : ''}`}>
                  <div>
                    <h2 className="text-[13px] font-semibold tracking-wider uppercase text-secondary-text mb-8">Outcome Distribution</h2>
                    <div className="h-56 border-b border-border flex items-end justify-center pb-0 relative px-2">
                      <div className="absolute bottom-0 w-full flex items-end justify-center space-x-[4px] px-2">
                        {[1, 2, 4, 8, 15, 25, 38, 55, 75, 90, 100, 90, 75, 55, 38, 25, 15, 8, 4, 2, 1].map((h, i) => {
                          const height = results ? (h * (0.8 + Math.random() * 0.4)) : h;
                          return (
                            <motion.div 
                              key={i} 
                              className="flex-1 bg-gradient-to-t from-primary-accent/20 to-primary-accent/80 rounded-t-sm shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 1, delay: i * 0.03, ease: "easeOut" }}
                            />
                          );
                        })}
                        <motion.div 
                          className="absolute bottom-0 w-[2px] h-[110%] bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" 
                          initial={{ left: '50%' }}
                          animate={{ left: `${results ? 50 + (Math.random() * 10 - 5) : 50}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        >
                          <div className="absolute -top-8 -left-4 text-[11px] font-bold text-white bg-primary-accent px-2 py-1 rounded shadow-glow">EV</div>
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-4 text-[12px] font-medium text-secondary-text">
                      <span>${(currentLow / 1000000 * 0.5).toFixed(0)}M</span>
                      <span>${(currentEV / 1000000).toFixed(0)}M</span>
                      <span>${(currentHigh / 1000000 * 1.5).toFixed(0)}M</span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-[13px] font-semibold tracking-wider uppercase text-secondary-text mb-8">Risk Drivers (Sensitivity)</h2>
                    <div className="space-y-5">
                      {decision.drivers.map((driver: any, index: number) => (
                        <div key={index} className="flex items-center text-[13px]">
                          <div className="w-32 text-white font-medium truncate">{driver.name}</div>
                          <div className="flex-1 h-[8px] bg-white/5 rounded-full mx-5 overflow-hidden border border-white/10 relative">
                            <motion.div 
                              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-glow" 
                              initial={{ width: 0 }}
                              animate={{ width: `${driver.percentage}%` }}
                              transition={{ duration: 1.2, delay: 0.2 + (index * 0.1) }}
                            />
                          </div>
                          <div className="w-12 text-right font-bold text-secondary-text">{driver.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Assumptions' && (
              <motion.div key="assumptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[13px] font-semibold tracking-wider uppercase text-secondary-text">Simulation Parameters</h2>
                  <button className="px-4 py-2 text-[12px] text-white bg-white/5 border border-white/10 rounded-md shadow-subtle hover:bg-white/10 flex items-center transition-colors">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Variable
                  </button>
                </div>
                
                <div className="card-subtle overflow-hidden border-border/50">
                  <table className="w-full text-left text-[13.5px]">
                    <thead className="bg-white/5 border-b border-white/10 text-secondary-text text-[11.5px] uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-8 py-5">Variable</th>
                        <th className="px-8 py-5">Distribution</th>
                        <th className="px-8 py-5">Parameters</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {assumptions.map(a => (
                        <tr key={a.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5 font-bold text-white">{a.name}</td>
                          <td className="px-8 py-5 text-secondary-text capitalize">
                            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-[11.5px] font-medium shadow-subtle text-white">
                              {a.type === 'normal' && 'Gaussian'}
                              {a.type === 'triangular' && 'Triangular'}
                              {a.type === 'fixed' && 'Deterministic'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-secondary-text font-mono text-[13px]">
                            {a.type === 'normal' && <span className="opacity-80">μ: <strong className="text-primary-accent font-sans font-bold">{a.mean}{a.unit}</strong> &nbsp;&nbsp; σ: <strong className="text-primary-accent font-sans font-bold">{a.std_dev}{a.unit}</strong></span>}
                            {a.type === 'triangular' && <span className="opacity-80">Min: <strong className="text-primary-accent font-sans font-bold">{a.min}{a.unit}</strong> &nbsp;&nbsp; Max: <strong className="text-primary-accent font-sans font-bold">{a.max}{a.unit}</strong></span>}
                            {a.type === 'fixed' && <span className="opacity-80">Value: <strong className="text-primary-accent font-sans font-bold">{a.value}{a.unit}</strong></span>}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => { setEditingVar({...a}); setIsDrawerOpen(true); }}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-secondary-text hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all shadow-none hover:shadow-subtle"
                            >
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

            {activeTab === 'AI Advisor' && (
              <motion.div key="ai" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }}>
                
                <div className="card-glow p-10 mb-8 border-primary-accent/50 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-accent/20 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <Brain className="w-8 h-8 text-primary-accent" />
                    <h2 className="text-2xl font-bold text-white">Strategic Synthesis</h2>
                  </div>
                  
                  <p className="text-[16px] text-secondary-text leading-relaxed max-w-3xl mb-8">
                    Based on your Monte Carlo results (EV: ${(currentEV/1000000).toFixed(1)}M, Risk: {(currentDownside*100).toFixed(1)}%), we have run this decision through the mental models of leading strategists, economists, and financiers. Here is the synthesized consensus.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-subtle">
                      <div className="flex items-center space-x-2 mb-4">
                        <ShieldAlert className="w-5 h-5 text-warning" />
                        <h3 className="font-bold text-white">Ray Dalio (Risk/Reward)</h3>
                      </div>
                      <p className="text-[14px] text-secondary-text leading-relaxed">
                        "Your Expected Value is extremely positive, but the ${(currentLow/1000000).toFixed(1)}M downside tail risk is unacceptable without hedging. You are risking ruin on a 5% probability tail event. Size your bet down or buy optionality to cap the downside before proceeding."
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-subtle">
                      <div className="flex items-center space-x-2 mb-4">
                        <Target className="w-5 h-5 text-success" />
                        <h3 className="font-bold text-white">Warren Buffett (Margin of Safety)</h3>
                      </div>
                      <p className="text-[14px] text-secondary-text leading-relaxed">
                        "Look at your key driver: 42% of this outcome depends on {decision.key_uncertainty}. If that assumption is wrong, your margin of safety evaporates. Stress-test the model by cutting market growth assumptions in half. If it still works, it's a wonderful business."
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-subtle">
                      <div className="flex items-center space-x-2 mb-4">
                        <Zap className="w-5 h-5 text-primary-accent" />
                        <h3 className="font-bold text-white">Michael Porter (Competitive Adv.)</h3>
                      </div>
                      <p className="text-[14px] text-secondary-text leading-relaxed">
                        "This expansion relies heavily on lowering CAC. Are these structural cost advantages, or just temporary arbitrage? Ensure you are building a moat around your distribution channels, otherwise competitors will erode the ${(currentEV/1000000).toFixed(1)}M EV entirely."
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-primary-accent/20 to-indigo-600/20 border border-primary-accent/30 rounded-xl p-6 shadow-glow">
                      <div className="flex items-center space-x-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary-accent" />
                        <h3 className="font-bold text-white">AI Master Strategy</h3>
                      </div>
                      <ul className="text-[14px] text-white/90 leading-relaxed space-y-3 list-disc list-inside">
                        <li><strong>Action:</strong> Proceed with a Phase 1 rollout to cap downside risk at month {decision.break_even_month}.</li>
                        <li><strong>Hedge:</strong> Secure fixed-rate contracts to eliminate the FX variance shown in your model.</li>
                        <li><strong>Trigger:</strong> If CAC exceeds ${assumptions.find(a=>a.name==='CAC')?.mean || 140}, halt expansion.</li>
                      </ul>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Scenarios' && (
              <motion.div key="scenarios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[13px] font-semibold tracking-wider uppercase text-secondary-text">Scenario Analysis</h2>
                  <button className="px-4 py-2 text-[12px] text-white bg-white/5 border border-white/10 rounded-md shadow-subtle hover:bg-white/10 flex items-center transition-colors">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> New Scenario
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  <div className="card-glow p-8 relative overflow-hidden border-primary-accent/50">
                    <div className="absolute top-0 right-0 w-[4px] h-full bg-primary-accent shadow-glow"></div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white text-[18px]">Base Case</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent bg-primary-accent/10 px-2.5 py-1 rounded border border-primary-accent/20">Active</span>
                    </div>
                    <p className="text-[14px] text-secondary-text mb-8">Current trajectory based on expected variables</p>
                    <div className="space-y-4 text-[14px]">
                      <div className="flex justify-between items-center"><span className="text-secondary-text">Expected Value</span><span className="font-bold text-white">${(currentEV / 1000000).toFixed(1)}M</span></div>
                      <div className="flex justify-between items-center"><span className="text-secondary-text">Downside Risk</span><span className="font-bold text-white">{(currentDownside * 100).toFixed(1)}%</span></div>
                    </div>
                  </div>

                  <div className="card-subtle p-8 hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white text-[18px] group-hover:text-primary-accent transition-colors">Conservative</h3>
                    </div>
                    <p className="text-[14px] text-secondary-text mb-8">Lower market growth, higher CAC</p>
                    <div className="space-y-4 text-[14px]">
                      <div className="flex justify-between items-center"><span className="text-secondary-text">Expected Value</span><span className="font-bold text-white">$8.7M</span></div>
                      <div className="flex justify-between items-center"><span className="text-secondary-text">Downside Risk</span><span className="font-bold text-warning">31.4%</span></div>
                    </div>
                  </div>

                  <div className="card-subtle p-8 hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white text-[18px] group-hover:text-primary-accent transition-colors">Aggressive</h3>
                    </div>
                    <p className="text-[14px] text-secondary-text mb-8">Faster adoption curve, lower churn</p>
                    <div className="space-y-4 text-[14px]">
                      <div className="flex justify-between items-center"><span className="text-secondary-text">Expected Value</span><span className="font-bold text-white">$29.2M</span></div>
                      <div className="flex justify-between items-center"><span className="text-secondary-text">Downside Risk</span><span className="font-bold text-success">8.1%</span></div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
