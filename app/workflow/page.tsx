'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Brain, AlignLeft, Search, BarChart2, MessageSquare, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WorkflowPage() {
  const agents = [
    { name: 'Strategic Planner', icon: AlignLeft, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Deconstructs the user query into a series of smaller, actionable logical steps.' },
    { name: 'Deep Researcher', icon: Search, color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Uses FAISS vector embeddings to precisely pull only the necessary context chunks from uploaded documents.' },
    { name: 'Data Analyst', icon: BarChart2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Synthesizes the raw data chunks into structured meaning, identifying missing data links.' },
    { name: 'Report Writer', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Translates the synthesized logic into a beautiful, easy-to-read executive summary.' },
    { name: 'Rigorous Critic', icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Evaluates the final output for hallucinations or omissions, demanding a rewrite if it fails standards.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="fixed top-0 w-full z-50 bg-background/80 halo-blur border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Brain className="w-5 h-5 stroke-[2.5]" />
            </span>
            <span className="text-xl font-bold tracking-tight">Agent Workflow</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">The Multi-Agent Swarm</h1>
          <p className="text-xl text-muted-foreground">Discover how AutoResearch completely automates complex logic loops.</p>
        </div>

        <div className="space-y-6">
          {agents.map((agent, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {i !== agents.length - 1 && <div className="absolute left-[39px] top-16 bottom-[-24px] w-0.5 bg-border z-0" />}
              <Card className="relative z-10 border-border bg-card subtle-shadow rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform">
                <CardContent className="p-8 flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-xl shrink-0 ${agent.bg} flex items-center justify-center`}>
                    <agent.icon className={`w-8 h-8 ${agent.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{agent.name}</h3>
                    <p className="text-muted-foreground leading-relaxed text-[15px]">{agent.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
