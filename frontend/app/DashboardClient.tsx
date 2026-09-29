'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, AlertCircle, GitMerge, Search, Plus, Activity, ChevronRight, X, Loader2, TrendingUp, TrendingDown, ShieldAlert, Zap, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardClient({ dashboardData }: { dashboardData: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Advanced Dashboard State
  const [activeGlobalScenario, setActiveGlobalScenario] = useState<string | null>(null);
  const [detailedRisk, setDetailedRisk] = useState<string | null>(null);

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/decisions/?title=' + encodeURIComponent(newTitle), {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to create');
      
      const data = await res.json();
      router.push(`/decisions/${data.id}`);
    } catch (error) {
      console.error(error);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans selection:bg-primary-accent selection:text-white">
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => !isCreating && setIsNewModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card-glow w-full max-w-md relative z-50"
            >
              <form onSubmit={handleCreateDecision}>
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h2 className="font-bold text-white text-[15px]">New Decision Model</h2>
                  <button type="button" onClick={() => setIsNewModalOpen(false)} disabled={isCreating} className="text-secondary-text hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <label className="block text-[12px] font-bold tracking-wider uppercase text-secondary-text mb-2">Decision Title</label>
                  <input 
                    type="text" 
                    autoFocus
                    required
                    placeholder="e.g., European Market Expansion"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="input-premium w-full text-[14px]"
                    disabled={isCreating}
                  />
                  <p className="text-[12px] text-secondary-text mt-3">A Monte Carlo workspace will be generated instantly.</p>
                </div>
                <div className="px-6 py-5 border-t border-white/10 bg-black/40 flex justify-end space-x-3 rounded-b-xl">
                  <button type="button" onClick={() => setIsNewModalOpen(false)} disabled={isCreating} className="px-4 py-2 border border-white/10 rounded-md text-[13px] font-medium text-secondary-text hover:text-white hover:bg-white/5 transition-colors shadow-subtle">Cancel</button>
                  <button type="submit" disabled={isCreating || !newTitle.trim()} className="btn-premium px-5 py-2 text-[13px] min-w-[140px]">
                    {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isCreating ? 'Initializing...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className="w-64 border-r border-border flex flex-col justify-between shrink-0 bg-surface/50 backdrop-blur-xl z-20">
        <div className="px-5 py-8">
          <div className="flex items-center space-x-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-[12px] tracking-tighter">SQ</span>
            </div>
            <span className="font-bold tracking-tight text-[18px] text-white">StratIQ</span>
          </div>

          <div className="space-y-8">
            <div>
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-all text-[13px] font-bold ${activeTab === 'portfolio' ? 'bg-white/10 border border-white/10 shadow-subtle text-white' : 'text-secondary-text hover:bg-white/5 hover:text-white'}`}>
                  <Activity className={`w-4 h-4 mr-3 ${activeTab === 'portfolio' ? 'text-primary-accent' : ''}`} strokeWidth={2.5} />
                  Portfolio Overview
                </button>
              </nav>
            </div>
            
            <div>
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('decisions')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-all text-[13px] font-medium ${activeTab === 'decisions' ? 'bg-white/10 border border-white/10 shadow-subtle text-white' : 'text-secondary-text hover:bg-white/5 hover:text-white'}`}>
                  <Briefcase className="w-4 h-4 mr-3" strokeWidth={2} />
                  Decisions Hub
                </button>
                <button 
                  onClick={() => setActiveTab('scenarios')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-all text-[13px] font-medium ${activeTab === 'scenarios' ? 'bg-white/10 border border-white/10 shadow-subtle text-white' : 'text-secondary-text hover:bg-white/5 hover:text-white'}`}>
                  <GitMerge className="w-4 h-4 mr-3" strokeWidth={2} />
                  Macro Scenarios
                </button>
                <button 
                  onClick={() => setActiveTab('risk')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-all text-[13px] font-medium ${activeTab === 'risk' ? 'bg-white/10 border border-white/10 shadow-subtle text-white' : 'text-secondary-text hover:bg-white/5 hover:text-white'}`}>
                  <AlertCircle className="w-4 h-4 mr-3" strokeWidth={2} />
                  Risk Intelligence
                </button>
              </nav>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <header className="h-20 flex items-center justify-between px-10 bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0 border-b border-border">
          <div className="flex-1"></div>
          <div className="flex items-center space-x-6">
            <div className="relative group cursor-pointer text-secondary-text hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1200px] w-full mx-auto pb-24">
          
          <AnimatePresence mode="wait">
            
            {activeTab === 'portfolio' && (
              <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Global Portfolio</h1>
                    <p className="text-secondary-text text-[15px]">Aggregate expected value across all active strategic decisions.</p>
                  </div>
                  <button onClick={() => setIsNewModalOpen(true)} className="btn-premium px-5 py-2.5 text-[13px] shadow-glow flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    New Decision
                  </button>
                </div>

                {/* HEAVY VISUALIZATION: Global EV Tracker */}
                <div className="card-glow p-8 mb-10 border-primary-accent/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary-accent/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                  
                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                      <h2 className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-2">Total Expected Value (Risk-Adjusted)</h2>
                      <div className="text-[48px] tracking-tighter text-white font-bold flex items-center">
                        $142.8M <span className="text-success text-[16px] ml-4 flex items-center tracking-normal font-medium bg-success/10 px-3 py-1 rounded-full"><TrendingUp className="w-4 h-4 mr-1" /> +12.4%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-2">Portfolio Downside Exposure</h2>
                      <div className="text-[28px] tracking-tighter text-warning font-bold">
                        18.2%
                      </div>
                    </div>
                  </div>

                  {/* Animated Bar Chart for Portfolio Components */}
                  <div className="space-y-6 relative z-10">
                    {[
                      { name: 'Market Expansion', ev: 68, risk: 15, color: 'from-blue-500 to-indigo-500' },
                      { name: 'M&A Target Alpha', ev: 45, risk: 28, color: 'from-purple-500 to-pink-500' },
                      { name: 'Supply Chain Pivot', ev: 29.8, risk: 8, color: 'from-emerald-400 to-teal-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-48 text-[14px] font-medium text-white truncate">{item.name}</div>
                        <div className="flex-1 h-[12px] bg-white/5 rounded-full mx-6 overflow-hidden border border-white/10 relative">
                          <motion.div 
                            className={`absolute top-0 left-0 bottom-0 bg-gradient-to-r ${item.color} shadow-glow`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.ev / 80) * 100}%` }}
                            transition={{ duration: 1.5, delay: 0.2 + (i * 0.2), type: 'spring', bounce: 0.2 }}
                          />
                        </div>
                        <div className="w-24 text-right font-bold text-white">${item.ev}M</div>
                        <div className="w-24 text-right text-[12px] font-medium text-secondary-text flex justify-end items-center">
                          <ShieldAlert className="w-3.5 h-3.5 mr-1.5 opacity-50" /> {item.risk}% Risk
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <h2 className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-6 border-b border-border pb-4">Recent Models</h2>
                    <div className="flex flex-col space-y-2">
                      {[
                        { id: 2, title: "Pricing Strategy", time: "Updated yesterday", status: "Active", color: "bg-success/20 text-success border-success/30" },
                        { id: 3, title: "Supply Expansion", time: "Updated 2d ago", status: "Review", color: "bg-warning/20 text-warning border-warning/30" },
                        { id: 4, title: "Data Center Rollout", time: "Updated 1w ago", status: "Draft", color: "bg-white/10 text-secondary-text border-white/20" },
                      ].map(item => (
                        <Link key={item.id} href={`/decisions/${item.id}`} className="flex items-center justify-between py-5 border-b border-white/5 hover:bg-white/5 group transition-colors rounded-xl px-5 -mx-5">
                          <div className="font-bold text-white text-[16px]">{item.title}</div>
                          <div className="flex items-center space-x-8">
                            <span className="text-[13px] text-secondary-text hidden sm:block">{item.time}</span>
                            <span className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider border ${item.color}`}>{item.status}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-6 border-b border-border pb-4">AI Intelligence Feed</h2>
                    <div className="space-y-4">
                      <div className="card-subtle p-5 border-l-2 border-l-primary-accent flex space-x-4">
                        <Zap className="w-5 h-5 text-primary-accent shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-white font-bold text-[14px] mb-1">Macro Shift Detected</h4>
                          <p className="text-secondary-text text-[13px] leading-relaxed">Inflationary pressures in EU markets have shifted the downside risk of your 'Pricing Strategy' model from 12% to 18%. Re-run simulations recommended.</p>
                        </div>
                      </div>
                      <div className="card-subtle p-5 border-l-2 border-l-warning flex space-x-4">
                        <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-white font-bold text-[14px] mb-1">Concentration Risk</h4>
                          <p className="text-secondary-text text-[13px] leading-relaxed">45% of your portfolio EV is tied to a single variable: CAC. Consider hedging strategies.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'decisions' && (
              <motion.div key="decisions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-end justify-between mb-10">
                  <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Decisions Hub</h1>
                  <button onClick={() => setIsNewModalOpen(true)} className="btn-premium px-5 py-2.5 text-[13px] shadow-glow flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> New Decision
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {dashboardData.attention_decisions.length > 0 && (
                    <Link href={`/decisions/${dashboardData.attention_decisions[0].id}`} className="block group">
                      <div className="card-glow p-8 hover:border-primary-accent/80 transition-all cursor-pointer h-full">
                        <h3 className="font-bold text-white text-[22px] mb-5 flex items-center justify-between">
                          {dashboardData.attention_decisions[0].title}
                          <ChevronRight className="w-5 h-5 text-primary-accent group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <div className="space-y-4 text-[14px]">
                          <div className="text-secondary-text flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-success mr-3 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                            <strong className="text-white mr-1.5">$18.4M</strong> expected value
                          </div>
                          <div className="text-secondary-text flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-warning mr-3 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                            Moderate Risk Profile
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                  <Link href="/decisions/2" className="block group">
                      <div className="card-subtle p-8 hover:border-white/20 transition-all cursor-pointer h-full">
                        <h3 className="font-bold text-white text-[22px] mb-5 flex items-center justify-between">
                          Pricing Strategy Matrix
                          <ChevronRight className="w-5 h-5 text-secondary-text group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </h3>
                        <div className="space-y-4 text-[14px]">
                          <div className="text-secondary-text flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-success mr-3"></span>
                            <strong className="text-white mr-1.5">$8.2M</strong> expected value
                          </div>
                          <div className="text-secondary-text flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-success mr-3"></span>
                            Low Risk Profile
                          </div>
                        </div>
                      </div>
                  </Link>
                </div>
              </motion.div>
            )}

            {activeTab === 'scenarios' && (
              <motion.div key="scenarios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Macro Scenarios</h1>
                    <p className="text-secondary-text text-[15px]">Stress-test your entire active portfolio against global macroeconomic events.</p>
                  </div>
                  {activeGlobalScenario && (
                    <button onClick={() => setActiveGlobalScenario(null)} className="px-4 py-2 bg-danger/20 text-danger border border-danger/30 rounded shadow-subtle hover:bg-danger/30 font-bold text-[12px] transition-colors">
                      RESET PORTFOLIO TO BASELINE
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div 
                    onClick={() => setActiveGlobalScenario('recession')}
                    className={`p-8 border cursor-pointer transition-all ${activeGlobalScenario === 'recession' ? 'card-glow border-warning shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'card-subtle border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[18px] font-bold text-white flex items-center">
                        <TrendingDown className={`w-5 h-5 mr-2 ${activeGlobalScenario === 'recession' ? 'text-warning' : 'text-secondary-text'}`} />
                        Recessionary Event
                      </h3>
                      {activeGlobalScenario === 'recession' && <span className="bg-warning text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Running</span>}
                    </div>
                    <p className="text-[14px] text-secondary-text mb-8 min-h-[40px]">Tests portfolio against a 20% drop in consumer spending and 2x CAC.</p>
                    <div className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-2">Portfolio Impact</div>
                    {activeGlobalScenario === 'recession' ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-[28px] font-black text-danger tracking-tighter">-$14.2M (-34%)</motion.div>
                    ) : (
                      <div className="text-[20px] font-bold text-white/40">Run to calculate</div>
                    )}
                  </div>
                  
                  <div 
                    onClick={() => setActiveGlobalScenario('bull')}
                    className={`p-8 border cursor-pointer transition-all ${activeGlobalScenario === 'bull' ? 'card-glow border-success shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'card-subtle border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[18px] font-bold text-white flex items-center">
                        <TrendingUp className={`w-5 h-5 mr-2 ${activeGlobalScenario === 'bull' ? 'text-success' : 'text-secondary-text'}`} />
                        Bull Market
                      </h3>
                      {activeGlobalScenario === 'bull' && <span className="bg-success text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Running</span>}
                    </div>
                    <p className="text-[14px] text-secondary-text mb-8 min-h-[40px]">Tests portfolio against sustained low interest rates and hyper-growth liquidity.</p>
                    <div className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-2">Portfolio Impact</div>
                    {activeGlobalScenario === 'bull' ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-[28px] font-black text-success tracking-tighter">+$18.5M (+42%)</motion.div>
                    ) : (
                      <div className="text-[20px] font-bold text-white/40">Run to calculate</div>
                    )}
                  </div>
                  
                  <div 
                    onClick={() => setActiveGlobalScenario('supply_chain')}
                    className={`p-8 border cursor-pointer transition-all ${activeGlobalScenario === 'supply_chain' ? 'card-glow border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'card-subtle border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[18px] font-bold text-white flex items-center">
                        <Package className={`w-5 h-5 mr-2 ${activeGlobalScenario === 'supply_chain' ? 'text-purple-500' : 'text-secondary-text'}`} />
                        Supply Chain Shock
                      </h3>
                      {activeGlobalScenario === 'supply_chain' && <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Running</span>}
                    </div>
                    <p className="text-[14px] text-secondary-text mb-8 min-h-[40px]">Tests portfolio against severe logistics bottlenecks and a 45% spike in freight costs.</p>
                    <div className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-2">Portfolio Impact</div>
                    {activeGlobalScenario === 'supply_chain' ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-[28px] font-black text-purple-400 tracking-tighter">-$8.4M (-18%)</motion.div>
                    ) : (
                      <div className="text-[20px] font-bold text-white/40">Run to calculate</div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {activeGlobalScenario && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-8">
                      <div className="card-glow p-8 bg-black/40 border-t border-t-primary-accent">
                        <h3 className="text-[14px] font-bold uppercase tracking-wider text-white mb-6 flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-primary-accent" /> Live Contagion Map
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center border border-white/10">
                            <div>
                              <div className="text-white font-bold text-[14px]">Market Expansion Beta</div>
                              <div className="text-secondary-text text-[12px]">Decision Model</div>
                            </div>
                            <div className={`font-bold text-[16px] ${activeGlobalScenario === 'recession' ? 'text-danger' : activeGlobalScenario === 'bull' ? 'text-success' : 'text-danger'}`}>
                              {activeGlobalScenario === 'recession' ? 'Negative EV (-$1.2M)' : activeGlobalScenario === 'bull' ? 'Hyper-Scale (+$8.4M)' : 'Margin Crush (-$5.1M)'}
                            </div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center border border-white/10">
                            <div>
                              <div className="text-white font-bold text-[14px]">Pricing Strategy Matrix</div>
                              <div className="text-secondary-text text-[12px]">Decision Model</div>
                            </div>
                            <div className={`font-bold text-[16px] ${activeGlobalScenario === 'recession' ? 'text-warning' : activeGlobalScenario === 'bull' ? 'text-success' : 'text-warning'}`}>
                              {activeGlobalScenario === 'recession' ? 'Resilient (+$4.2M)' : activeGlobalScenario === 'bull' ? 'Scale (+$6.1M)' : 'Price Hike Needed (-$3.3M)'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

            {activeTab === 'risk' && (
              <motion.div key="risk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Risk Intelligence</h1>
                <p className="text-secondary-text text-[15px] mb-10">Deep-dive into probabilistic threats and tail-end vulnerabilities.</p>
                
                {/* Heavy Visualization: Interactive Risk Heatmap Concept */}
                <div className="card-glow p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-8">Vulnerability Matrix (Click to Drill Down)</h2>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4 text-[12px] font-bold text-secondary-text uppercase tracking-wider text-center">
                    <div>Probability</div>
                    <div>Low Impact</div>
                    <div>Medium Impact</div>
                    <div>Catastrophic</div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="text-[13px] font-bold text-white text-right pr-4">High ( &gt; 20% )</div>
                      <div 
                        onClick={() => setDetailedRisk('FX Volatility')}
                        className="h-24 bg-warning/20 hover:bg-warning/30 border border-warning/30 hover:border-warning/50 rounded-lg flex items-center justify-center text-warning font-bold text-[12px] cursor-pointer transition-colors"
                      >
                        FX Volatility
                      </div>
                      <div 
                        onClick={() => setDetailedRisk('Competitor Pricing')}
                        className="h-24 bg-warning/40 hover:bg-warning/50 border border-warning/50 hover:border-warning/70 rounded-lg flex items-center justify-center text-white font-bold text-[12px] cursor-pointer transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      >
                        Competitor Pricing
                      </div>
                      <div 
                        onClick={() => setDetailedRisk('CAC Spike')}
                        className="h-24 bg-red-500/80 hover:bg-red-500 border border-red-500 rounded-lg flex flex-col items-center justify-center text-white font-bold text-[12px] cursor-pointer transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] group"
                      >
                        <ShieldAlert className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" /> CAC Spike
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="text-[13px] font-bold text-white text-right pr-4">Medium ( 5-20% )</div>
                      <div className="h-24 bg-white/5 border border-white/10 rounded-lg"></div>
                      <div 
                        onClick={() => setDetailedRisk('Churn Increase')}
                        className="h-24 bg-warning/20 hover:bg-warning/30 border border-warning/30 hover:border-warning/50 rounded-lg flex items-center justify-center text-warning font-bold text-[12px] cursor-pointer transition-colors"
                      >
                        Churn Increase
                      </div>
                      <div 
                        onClick={() => setDetailedRisk('Supply Chain Block')}
                        className="h-24 bg-warning/40 hover:bg-warning/50 border border-warning/50 hover:border-warning/70 rounded-lg flex items-center justify-center text-white font-bold text-[12px] cursor-pointer transition-colors"
                      >
                        Supply Chain Block
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="text-[13px] font-bold text-white text-right pr-4">Tail Event ( &lt; 5% )</div>
                      <div className="h-24 bg-white/5 border border-white/10 rounded-lg"></div>
                      <div className="h-24 bg-white/5 border border-white/10 rounded-lg"></div>
                      <div 
                        onClick={() => setDetailedRisk('Regulatory Ban')}
                        className="h-24 bg-red-500/40 hover:bg-red-500/60 border border-red-500/50 hover:border-red-500/80 rounded-lg flex flex-col items-center justify-center text-white font-bold text-[12px] cursor-pointer transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      >
                        Regulatory Ban
                      </div>
                    </div>
                  </div>

                </div>

                <AnimatePresence>
                  {detailedRisk && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mt-8 card-glow p-8 bg-black/50 border border-white/10 relative">
                      <button onClick={() => setDetailedRisk(null)} className="absolute top-6 right-6 text-secondary-text hover:text-white bg-white/5 p-1.5 rounded-md hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                      <h3 className="text-[20px] font-bold text-white mb-2 flex items-center">
                        <Activity className={`w-5 h-5 mr-3 ${detailedRisk === 'CAC Spike' || detailedRisk === 'Regulatory Ban' ? 'text-danger' : 'text-warning'}`} />
                        Threat Drilldown: {detailedRisk}
                      </h3>
                      <p className="text-secondary-text text-[14px] mb-6 max-w-2xl">
                        AI analysis of this vulnerability across your decision portfolio. Isolated instances of this threat can compound globally if unchecked.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary-text mb-1">Exposure Origin</div>
                          <div className="text-[15px] font-bold text-white">Market Expansion Beta Model</div>
                          <div className="mt-3 text-[13px] text-secondary-text leading-relaxed">
                            The standard deviation for your Customer Acquisition Cost assumption is currently untethered (σ = $15). A two-sigma event here destroys expected value.
                          </div>
                        </div>
                        <div className="bg-white/5 p-5 rounded-lg border border-white/10">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-secondary-text mb-1">Mitigation Strategy</div>
                          <div className="text-[15px] font-bold text-white">Hedge Contract Required</div>
                          <div className="mt-3 text-[13px] text-secondary-text leading-relaxed">
                            Secure fixed-rate agency contracts for Q3-Q4. This effectively caps the upper bound of the distribution tail, neutralizing this threat.
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
