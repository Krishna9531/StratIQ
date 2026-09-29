'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, AlertCircle, GitMerge, Search, Plus, Activity, ChevronRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardClient({ dashboardData }: { dashboardData: any }) {
  const router = useRouter();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => !isCreating && setIsNewModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card-glow w-full max-w-md relative z-50"
            >
              <form onSubmit={handleCreateDecision}>
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-white/5">
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
                  <p className="text-[12px] text-secondary-text mt-3">A Monte Carlo workspace will be generated with standard assumptions.</p>
                </div>
                <div className="px-6 py-5 border-t border-border bg-black/30 flex justify-end space-x-3 rounded-b-xl">
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
                <Link href="/" className="flex items-center px-3 py-2.5 rounded-md bg-white/10 border border-white/10 shadow-subtle text-white font-bold text-[13px]">
                  <Activity className="w-4 h-4 mr-3 text-primary-accent" strokeWidth={2.5} />
                  Portfolio Overview
                </Link>
              </nav>
            </div>
            
            <div>
              <nav className="space-y-1">
                <Link href="#" className="flex items-center px-3 py-2.5 rounded-md text-secondary-text hover:bg-white/5 hover:text-white transition-colors text-[13px] font-medium group">
                  <Briefcase className="w-4 h-4 mr-3 text-secondary-text group-hover:text-white transition-colors" strokeWidth={2} />
                  Decisions
                </Link>
                <Link href="#" className="flex items-center px-3 py-2.5 rounded-md text-secondary-text hover:bg-white/5 hover:text-white transition-colors text-[13px] font-medium group">
                  <GitMerge className="w-4 h-4 mr-3 text-secondary-text group-hover:text-white transition-colors" strokeWidth={2} />
                  Scenarios
                </Link>
                <Link href="#" className="flex items-center px-3 py-2.5 rounded-md text-secondary-text hover:bg-white/5 hover:text-white transition-colors text-[13px] font-medium group">
                  <AlertCircle className="w-4 h-4 mr-3 text-secondary-text group-hover:text-white transition-colors" strokeWidth={2} />
                  Risk Intelligence
                </Link>
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-[12px] font-bold shadow-glow border border-white/20">AR</div>
          </div>
        </header>

        <div className="p-10 max-w-[1100px] w-full mx-auto pb-24">
          <div className="flex items-end justify-between mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-white">Enterprise Hub</h1>
            <button onClick={() => setIsNewModalOpen(true)} className="btn-premium px-5 py-2.5 text-[13px] shadow-glow flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Decision
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-1">
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-secondary-text mb-6">Primary Focus</h2>
              
              {dashboardData.attention_decisions.length > 0 && (
                <Link href={`/decisions/${dashboardData.attention_decisions[0].id}`} className="block group">
                  <div className="card-glow p-8 hover:border-primary-accent/80 transition-all cursor-pointer">
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
            </div>

            <div className="lg:col-span-2">
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

          </div>
        </div>
      </main>
    </div>
  );
}
