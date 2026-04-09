'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Brain, Search, Layout, PenTool, ClipboardCheck, Lock, Globe, MoveRight } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 h-16 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 tracking-tight font-semibold">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Brain className="w-5 h-5" />
            </span>
            <span>AUTORESEARCH • STUDIO</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Studio</Link>
            <Link href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
            <div className="h-4 w-px bg-border mx-2" />
            <ThemeToggle />
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full px-5 font-medium tracking-tight">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-48 pb-32 px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12"
        >
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground leading-[0.95] md:leading-[0.95]">
              Research, evolved. <br />
              <span className="text-muted-foreground/40">Powered by Agents.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              An intelligent multi-agent orchestration layer designed for professionals who demand precision, privacy, and performance.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-10 h-14 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
                Open Workspace <MoveRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-32 border-t border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="h-full border-border/40 bg-secondary/30 luxury-shadow rounded-[2rem] overflow-hidden group">
              <CardContent className="p-10 flex flex-col justify-between h-full">
                <div className="w-12 h-12 rounded-xl bg-background border border-border/40 flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight mb-4">Multi-Agent Swarm</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md font-light">
                    Specialized agents (Planner, Researcher, Critic) work in parallel to deconstruct your query into atomic research steps.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card className="h-full border-border/40 bg-secondary/30 luxury-shadow rounded-[2rem] overflow-hidden">
              <CardContent className="p-10 flex flex-col items-center text-center justify-center h-full">
                <div className="w-12 h-12 rounded-xl bg-background border border-border/40 flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-4 text-center">Truly Local</h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  No data leaves your device. Powered by Ollama and FAISS.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Atomic Features */}
          {[
            { icon: Search, title: "Precision Search", desc: "Surgical retrieval using semantic embeddings." },
            { icon: Layout, title: "Structured Synthesis", desc: "Automated report generation with deep hierarchy." },
            { icon: ClipboardCheck, title: "Critic Review", desc: "Automated fact-checking and quality assurance." },
          ].map((feat, i) => (
            <Card key={i} className="border-border/40 bg-background luxury-shadow rounded-[2rem]">
              <CardContent className="p-10">
                <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center mb-6">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold mb-2">{feat.title}</h4>
                <p className="text-sm text-muted-foreground font-light">{feat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-16 px-8 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest opacity-40">
            <Brain className="w-4 h-4" />
            <span>AUTORESEARCH • STUDIO v5.0</span>
          </div>
          <div className="flex gap-8 text-xs text-muted-foreground font-medium uppercase tracking-widest">
            <Link href="#" className="hover:text-foreground">Architecture</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Enterprise</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
