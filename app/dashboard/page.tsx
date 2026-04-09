'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, Send, Sparkles, Zap, Upload, FileText, 
  Settings, Trash2, BrainCircuit, X, History, 
  Search, ShieldCheck, Cpu, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

interface AgentStep {
  agent: string;
  input: string;
  output: string;
  timestamp: string;
}

interface CriticReview {
  quality: 'good' | 'fair' | 'poor';
  hallucinations: string[];
  suggestions: string[];
  shouldRegenerate: boolean;
}

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [criticism, setCriticism] = useState<CriticReview | null>(null);
  const [error, setError] = useState('');
  const [useFullOrchestration, setUseFullOrchestration] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const [temperature, setTemperature] = useState(0.7);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setDocuments(prev => [...prev, ...files]);
    setIsUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await fetch('http://localhost:8000/api/upload', { method: 'POST', body: formData });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const purgeSystem = async () => {
    if (confirm('Are you sure you want to clear system memory?')) {
      await fetch('http://localhost:8000/api/clear-index', { method: 'POST' });
      setDocuments([]);
      setResponse('');
      setAgentSteps([]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) { setError('Please enter a research objective'); return; }
    setLoading(true); setError(''); setResponse(''); setAgentSteps([]); setCriticism(null);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, useFullOrchestration, documents: documents.map(d => d.name) }),
      });
      if (!res.ok) throw new Error('System processing error');
      const data = await res.json();
      if (useFullOrchestration && data.steps) {
        setAgentSteps(data.steps); setResponse(data.finalAnswer); setCriticism(data.criticism || null);
      } else {
        setResponse(data.answer);
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Precision Header */}
      <header className="h-16 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase opacity-40">Return</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-md text-primary-foreground">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-bold tracking-tighter uppercase whitespace-nowrap">Studio Workspace</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 mr-4 text-[10px] uppercase tracking-widest font-bold opacity-30">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Encrypted</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Local</span>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="rounded-full">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={purgeSystem} className="rounded-full text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Input Column */}
        <aside className="lg:col-span-4 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Objective</h2>
            <Card className="border-border/40 bg-secondary/20 luxury-shadow rounded-3xl overflow-hidden">
              <CardContent className="p-1">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Define your research parameters..."
                  className="border-none bg-transparent focus-visible:ring-0 text-base placeholder:opacity-30 p-6 resize-none min-h-[160px]"
                />
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Sources</h2>
            <div className="space-y-3">
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-12 rounded-2xl border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground"
              >
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {isUploading ? 'Vectorizing...' : 'Attach Reference Documents'}
              </Button>

              <AnimatePresence>
                {documents.map((doc, i) => (
                  <motion.div 
                    key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-secondary/40 border border-border/20 rounded-xl"
                  >
                    <span className="text-xs font-medium truncate flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 opacity-50" /> {doc.name}
                    </span>
                    <button onClick={() => removeDocument(i)} className="p-1 hover:text-destructive opacity-40 hover:opacity-100 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <div className="pt-4 space-y-4">
            <div className="flex items-center transition-all bg-secondary/20 p-4 rounded-3xl border border-border/10 cursor-pointer hover:bg-secondary/40"
                 onClick={() => setUseFullOrchestration(!useFullOrchestration)}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${useFullOrchestration ? 'bg-primary border-primary' : 'border-border'}`}>
                {useFullOrchestration && <ShieldCheck className="w-3 h-3 text-primary-foreground" />}
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold tracking-tight">Agentic Orchestration</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5 opacity-60">Planner • Researcher • Critic</p>
              </div>
            </div>

            <Button disabled={loading} onClick={handleSubmit} className="w-full h-14 rounded-3xl font-bold text-base transition-all active:scale-95 luxury-shadow">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Execute Analysis <Zap className="w-4 h-4" /></span>}
            </Button>
          </div>
        </aside>

        {/* Output Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <Card className="flex-1 min-h-[500px] border-border/40 bg-background luxury-shadow rounded-[2.5rem] flex flex-col overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold tracking-tighter">Research Synthesis</CardTitle>
                <div className="px-3 py-1 bg-secondary rounded-full text-[10px] font-bold uppercase tracking-widest opacity-60">Status: {loading ? 'Computing' : 'Idle'}</div>
              </div>
              <CardDescription className="text-sm mt-2 opacity-50">Local agentic inference on provided source material.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col">
              {!response && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/30 py-20">
                  <Cpu className="w-20 h-20 mb-6 stroke-[0.5]" />
                  <p className="text-xs uppercase tracking-[0.3em] font-bold">Awaiting Operational Signal</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-base leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {loading && !response ? (
                    <div className="space-y-6">
                      <div className="h-4 bg-secondary animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-secondary animate-pulse rounded w-full" />
                      <div className="h-4 bg-secondary animate-pulse rounded w-1/2" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{response}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trace Logs (Minimalistic Footer) */}
          <AnimatePresence>
            {agentSteps.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 px-8">Orchestration Log</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pb-8">
                  {agentSteps.map((step, i) => (
                    <div key={i} className="p-4 bg-secondary/20 border border-border/40 rounded-2xl flex flex-col gap-3 group hover:bg-secondary/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">{step.agent}</span>
                        <Search className="w-3 h-3 opacity-20" />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3 font-medium italic opacity-70 group-hover:opacity-100 italic transition-all">
                        {step.output}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Global Error Popups */}
      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <Card className="bg-destructive text-destructive-foreground border-none px-6 py-3 rounded-2xl luxury-shadow flex items-center gap-3">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-bold tracking-tight">{error}</span>
            <button onClick={() => setError('')} className="ml-2 opacity-50 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
          </Card>
        </div>
      )}
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle">
      <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  );
}
