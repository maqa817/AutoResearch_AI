'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Brain, FileText, Zap, Lightbulb, BarChart3, Sparkles, Database, Layers } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] selection:bg-indigo-500/30 overflow-hidden relative font-sans">
      {/* Background glowing blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-gray-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
              AutoResearch AI
            </span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/dashboard">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 duration-300 rounded-full px-6">
                Launch App
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto text-center z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Version 5: Enterprise Architecture Now Live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 max-w-4xl"
        >
          Research Accelerated by <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            Autonomous Agents
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Upload your documents and let our swarm of specialized AI agents structure, analyze, and synthesize comprehensive reports in seconds. No prompt engineering required.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-full px-8 h-12 shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:scale-105 active:scale-95 duration-300">
              Enter Workspace <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/10 text-white bg-white/5 hover:bg-white/10 hover:text-white rounded-full px-8 h-12 transition-all hover:scale-105 active:scale-95 duration-300 backdrop-blur-md">
            View Architecture Docs
          </Button>
        </motion.div>
      </section>

      {/* Agent Workflow Visual */}
      <section className="py-20 relative z-10 hidden md:block">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-2xl border border-white/5 bg-gray-900/50 backdrop-blur-xl p-8 overflow-hidden">
             {/* decorative grid */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
             
             <div className="relative z-10 flex items-center justify-between gap-4">
                {[
                  { icon: Brain, label: 'Planner', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                  { icon: Database, label: 'Retrieval', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                  { icon: FileText, label: 'Researcher', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                  { icon: Layers, label: 'Analyst', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
                  { icon: Zap, label: 'Writer', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 relative">
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      viewport={{ once: true }}
                      className={`w-16 h-16 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center shadow-lg backdrop-blur-xl`}
                    >
                      <step.icon className={`w-8 h-8 ${step.color}`} />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-400">{step.label}</span>
                  </div>
                ))}
             </div>
             
             {/* Lines connecting them */}
             <div className="absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-6 -z-10" />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">A complete intelligence team</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Each query is routed through a specialized pipeline ensuring high accuracy, deep context retrieval, and structured formatting.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { icon: Brain, title: "Strategic Planner", desc: "Deconstructs complex research questions into methodical, actionable multi-step investigations.", color: "group-hover:text-indigo-400" },
            { icon: FileText, title: "Deep Researcher", desc: "Employs FAISS vector DB to surgically retrieve relevant chunks from thousands of documents.", color: "group-hover:text-blue-400" },
            { icon: BarChart3, title: "Data Analyst", desc: "Synthesizes raw retrieved text to identify overarching themes, patterns, and missing links.", color: "group-hover:text-cyan-400" },
            { icon: Zap, title: "Report Writer", desc: "Composes beautifully formatted, executive-ready reports with citations and actionable summaries.", color: "group-hover:text-violet-400" },
            { icon: Lightbulb, title: "Rigorous Critic", desc: "Scores output for hallucinations, flow, and accuracy. Forces regenerations if standards aren't met.", color: "group-hover:text-fuchsia-400" },
            { icon: Sparkles, title: "100% Local Inference", desc: "Runs completely offline using Ollama and local embedding models. Absolute data privacy.", color: "group-hover:text-emerald-400" },
          ].map((feature, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-colors duration-300 backdrop-blur-lg group overflow-hidden relative border border-transparent hover:border-white/10 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gray-900 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className={`w-6 h-6 text-gray-400 transition-colors duration-300 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl text-gray-100">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-400 leading-relaxed text-sm">
                  {feature.desc}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-950/80 backdrop-blur-xl py-12 text-center text-gray-500 relative z-10 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center items-center gap-2 mb-4 opacity-50">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-gray-300">AutoResearch AI</span>
          </div>
          <p>Version 5.0 Enterprise — Local RAG Multi-Agent Architecture.</p>
        </div>
      </footer>
    </div>
  );
}
