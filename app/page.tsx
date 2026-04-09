'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Brain, Search, Layout, Play, ShieldCheck, Cpu, Globe, Lock, Code, Database, Zap } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col font-sans">
      
      {/* Background Graphic (Blob/Gradient) */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[150px] pointer-events-none mix-blend-screen dark:mix-blend-lighten" />
      <div className="fixed top-[40%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none mix-blend-screen dark:mix-blend-lighten" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 halo-blur border-b border-border transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 h-20 flex justify-between items-center text-[14px]">
          <div className="flex items-center gap-3 font-bold tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Brain className="w-5 h-5 stroke-[2.5]" />
            </span>
            <span className="text-xl">AutoResearch</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#workflow" className="text-muted-foreground hover:text-foreground transition-colors">Workflow</Link>
            <Link href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button className="rounded-lg h-12 px-8 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-0.5 subtle-shadow">
                Go to App
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20">
        <section className="relative px-6 md:px-12 xl:px-20 max-w-[1400px] mx-auto pt-20 pb-32 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 halo-blur text-sm font-medium mb-12 subtle-shadow"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Introducing version 5.0 orchestrator
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-[40px] leading-[1.1] md:text-[64px] lg:text-[80px] font-black tracking-tighter max-w-[1000px] mx-auto text-foreground"
          >
            Intelligence at scale. <br />
            Driven by <span className="holo-text px-1">Autonomous Agents</span>.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-[720px] mx-auto font-normal"
          >
            Seamlessly upload documents and let our hyper-specialized AI swarm analyze, synthesize, and construct comprehensive research reports in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-lg h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-1 subtle-shadow">
                Launch Workspace <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto rounded-lg h-14 px-8 text-base font-medium border-border hover:bg-secondary transition-all">
              <Play className="w-5 h-5 mr-3 fill-foreground" />
              Watch Demo
            </Button>
          </motion.div>
        </section>

        {/* Features / Services Grid */}
        <section id="features" className="px-6 md:px-12 xl:px-20 max-w-[1400px] mx-auto py-24 border-t border-border/50">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Precision workflow.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl font-normal">A beautiful integration of specialized models communicating asynchronously to solve complex research queries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Database, title: "Vector Storage", color: "text-[#4A90E2]", bg: "bg-[#4A90E2]/10", desc: "Local FAISS indices ensuring completely private, hyper-fast semantic chunk retrieval that never leaves your machine." },
              { icon: Search, title: "Deep Research", color: "text-[#6B5FFF]", bg: "bg-[#6B5FFF]/10", desc: "Specialized researcher agents comb through your documents precisely targeting the strategic plan." },
              { icon: Layout, title: "Data Synthesis", color: "text-[#34D399]", bg: "bg-[#34D399]/10", desc: "Raw data is programmatically formatted into structured, highly readable multi-section reports." },
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="h-full border-border bg-card hover:-translate-y-2 transition-transform duration-300 subtle-shadow rounded-2xl overflow-hidden group">
                  <CardContent className="p-10">
                    <div className={`w-14 h-14 rounded-xl ${feat.bg} flex items-center justify-center mb-8`}>
                      <feat.icon className={`w-6 h-6 ${feat.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Asymmetric / Large Display Section */}
        <section className="px-6 md:px-12 xl:px-20 max-w-[1400px] mx-auto py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <Card className="h-full min-h-[400px] border-border bg-secondary/50 rounded-3xl overflow-hidden subtle-shadow group relative flex flex-col justify-end p-12">
                <div className="absolute top-0 right-0 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center subtle-shadow">
                    <ShieldCheck className="w-8 h-8 text-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 max-w-lg">Absolute data sovereignty.</h3>
                  <p className="text-lg text-muted-foreground max-w-md">Run Ollama and local embedding models directly on your hardware. Your intellectual property is never transmitted to the cloud.</p>
                </div>
              </Card>
            </div>
            
            <div className="lg:col-span-4">
              <Card className="h-full border-border bg-card rounded-3xl overflow-hidden subtle-shadow p-12 flex flex-col justify-between">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-3">Instant Compute</h3>
                  <p className="text-muted-foreground">Streaming interfaces and heavily optimized context windows guarantee speed without sacrificing depth.</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

      </main>

      {/* Structured Dark Footer as requested */}
      <footer className="dark-footer border-t py-20 px-6 md:px-12 xl:px-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-6 h-6" />
              <span className="text-xl font-bold tracking-tight">AutoResearch</span>
            </div>
            <p className="text-[14px] leading-relaxed max-w-sm opacity-80 font-light">
              We build professional intelligence tooling for researchers, analysts, and enterprises prioritizing privacy and precision.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 text-[14px]">
            <span className="font-bold text-white mb-2">Platform</span>
            <Link href="#" className="opacity-80 hover:opacity-100 transition-opacity">Documentation</Link>
            <Link href="#" className="opacity-80 hover:opacity-100 transition-opacity">Agents API</Link>
            <Link href="#" className="opacity-80 hover:opacity-100 transition-opacity">Inference Limits</Link>
          </div>
          
          <div className="flex flex-col gap-4 text-[14px]">
            <span className="font-bold text-white mb-2">Legal</span>
            <Link href="#" className="opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link href="#" className="opacity-80 hover:opacity-100 transition-opacity">Terms of Service</Link>
            <Link href="#" className="opacity-80 hover:opacity-100 transition-opacity">Security Specs</Link>
          </div>
        </div>
        
        <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-[#333333] text-[13px] opacity-60 flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 AutoResearch AI Studio. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
