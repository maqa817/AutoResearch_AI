'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, Sparkles, Upload, FileText, 
  Trash2, BrainCircuit, X, 
  Search, ShieldCheck, Cpu, ArrowLeft, ArrowRight,
  AlignLeft, BarChart2, MessageSquare,
  AlertCircle, CheckCircle2, SlidersHorizontal
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

const LOADING_MESSAGES = [
  "Initializing Swarm Intelligence...",
  "Planner partitioning logical boundaries...",
  "Running Deep Researcher against FAISS...",
  "Analyst establishing metadata mapping...",
  "Writer structuring document output...",
  "Critic verifying hallucination metrics...",
  "Finalizing executive synthesis..."
];

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [response, setResponse] = useState('');
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [criticism, setCriticism] = useState<CriticReview | null>(null);
  const [error, setError] = useState('');
  
  // Settings
  const [useFullOrchestration, setUseFullOrchestration] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 4000); // cycle message every 4 seconds
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

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

  const removeDocument = (index: number) => setDocuments(documents.filter((_, i) => i !== index));

  const purgeSystem = async () => {
    if (confirm('Clear working memory? This will purge the index.')) {
      await fetch('http://localhost:8000/api/clear-index', { method: 'POST' });
      setDocuments([]); setResponse(''); setAgentSteps([]); setError(''); setCriticism(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) { setError('Research parameters missing.'); return; }
    setLoading(true); setError(''); setResponse(''); setAgentSteps([]); setCriticism(null);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, useFullOrchestration, documents: documents.map(d => d.name) }),
      });
      if (!res.ok) throw new Error('Inference failure. Check backend.');
      const data = await res.json();
      if (useFullOrchestration && data.steps) {
        setAgentSteps(data.steps); setResponse(data.finalAnswer); setCriticism(data.criticism || null);
      } else {
        setResponse(data.answer);
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const getAgentIcon = (name: string) => {
    if (name.includes('Planner')) return <AlignLeft className="w-4 h-4" />;
    if (name.includes('Researcher')) return <Search className="w-4 h-4" />;
    if (name.includes('Analyst')) return <BarChart2 className="w-4 h-4" />;
    if (name.includes('Writer')) return <MessageSquare className="w-4 h-4" />;
    if (name.includes('Critic')) return <ShieldCheck className="w-4 h-4" />;
    return <Cpu className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                <ArrowLeft className="w-4 h-4" />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <span className="font-bold tracking-tight text-[15px]">Studio Dashboard</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-bold tracking-wider uppercase">Local Enclave</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-4 w-px bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="w-10 h-10 rounded-full">
              <SlidersHorizontal className="w-[18px] h-[18px]" />
            </Button>
            <Button variant="ghost" size="icon" onClick={purgeSystem} className="w-10 h-10 rounded-full text-destructive hover:bg-destructive/10">
              <Trash2 className="w-[18px] h-[18px]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8 lg:p-12 mb-20">
        
        {/* Workspace Title Area */}
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Research Configuration</h1>
            <p className="text-muted-foreground text-lg">Define parameters and establish context vectors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Primary Objective</label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g., Analyze the performance difference between FAISS and ChromaDB in local environments..."
                className="w-full min-h-[160px] p-5 rounded-xl border-border bg-card text-[15px] resize-none focus:ring-primary focus:border-primary subtle-shadow transition-all"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Context Sources</label>
                <span className="text-xs bg-secondary px-2 rounded-full font-medium">{documents.length} Files</span>
              </div>
              <div className="p-1 rounded-xl bg-card border border-border subtle-shadow">
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
                <Button 
                  variant="ghost" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-14 rounded-lg border border-dashed border-border hover:bg-secondary/50 text-muted-foreground transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Upload className="w-5 h-5" />}
                  {isUploading ? 'Vectorizing...' : 'Upload Reference Documents'}
                </Button>

                <AnimatePresence>
                  {documents.length > 0 && (
                    <div className="p-2 space-y-2 mt-2 border-t border-border/50">
                      {documents.map((doc, i) => (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 text-sm overflow-hidden group"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{doc.name}</span>
                          </div>
                          <button onClick={() => removeDocument(i)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Orchestration Toggle */}
            <div 
              onClick={() => setUseFullOrchestration(!useFullOrchestration)}
              className={`p-5 rounded-xl border cursor-pointer transition-all subtle-shadow flex items-start gap-4 ${
                useFullOrchestration ? 'bg-primary/5 border-primary/30' : 'bg-card border-border hover:bg-secondary/50'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                useFullOrchestration ? 'bg-primary border-primary text-primary-foreground' : 'bg-transparent border-border'
              }`}>
                {useFullOrchestration && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <div>
                <p className="font-bold text-base mb-1">Agentic Pipeline</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Engages Planner, Researcher, Analyst, and Critic models iteratively.</p>
              </div>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full h-16 rounded-xl text-[16px] font-bold bg-foreground text-background hover:bg-foreground/90 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-8"
            >
              {loading ? (
                <span className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> {LOADING_MESSAGES[loadingMsgIdx]}</span>
              ) : (
                <span className="flex items-center gap-3">Commence Analysis <ArrowRight className="w-5 h-5" /></span>
              )}
            </Button>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Column: Dynamic Trace & Results */}
          <div className="lg:col-span-8 space-y-8 flex flex-col">

            {/* UP TOP: Final Render Output per User Request */}
            <Card className="bg-card border-border rounded-2xl subtle-shadow flex flex-col overflow-hidden min-h-[500px]">
              <CardHeader className="bg-secondary/30 px-8 py-5 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                  Synthesis Report
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-[#F59E0B] animate-pulse' : response ? 'bg-[#34D399]' : 'bg-muted-foreground'}`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {loading ? 'Processing' : response ? 'Complete' : 'Standby'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-8 flex-1 flex flex-col relative min-h-[400px]">
                {!response && !loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-30 absolute inset-0">
                    <Sparkles className="w-16 h-16 mb-6 stroke-1" />
                    <p className="font-bold tracking-[0.2em] uppercase text-sm">System Ready</p>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert prose-p:leading-relaxed prose-headings:font-bold prose-headings:tracking-tight max-w-none text-[15px] z-10 w-full">
                    {loading && !response ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 opacity-60">
                         {/* We can show the loading state directly inside here too for double immersion */}
                        <div className="w-1/3 h-8 bg-secondary rounded animate-pulse mb-8" />
                        <div className="w-full h-4 bg-secondary rounded animate-pulse" />
                        <div className="w-[95%] h-4 bg-secondary rounded animate-pulse" />
                        <div className="w-[85%] h-4 bg-secondary rounded animate-pulse" />
                        <div className="w-2/3 h-4 bg-secondary rounded animate-pulse" />
                        
                        <div className="mt-16 text-center text-sm font-bold text-primary animate-pulse">
                          {LOADING_MESSAGES[loadingMsgIdx]}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="animate-in fade-in duration-700" dangerouslySetInnerHTML={{ __html: response.replace(/\n\n/g, '</p><p>').replace(/\n(.*)/g, '<br/>$1').replace(/^/, '<p>').concat('</p>') }} />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* BOTTOM: Quality Critic Box */}
            <AnimatePresence>
              {criticism && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`rounded-xl border ${
                    criticism.quality === 'good' ? 'border-[#34D399]/30 bg-[#34D399]/5' :
                    criticism.quality === 'fair' ? 'border-[#F59E0B]/30 bg-[#F59E0B]/5' : 'border-destructive/30 bg-destructive/5'
                  }`}>
                    <CardContent className="p-5 flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Verification Layer</span>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className={`w-5 h-5 ${criticism.quality === 'good' ? 'text-[#34D399]' : 'text-[#F59E0B]'}`} />
                          <span className="text-xl font-black capitalize">{criticism.quality} Result</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        {criticism.hallucinations?.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold uppercase text-destructive tracking-wider mb-2 block">Detected Anomalies</span>
                            {criticism.hallucinations.map((h, i) => (
                              <div key={i} className="text-sm bg-background/50 border border-border/50 p-2 rounded mb-1">{h}</div>
                            ))}
                          </div>
                        )}
                        {criticism.suggestions?.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold uppercase text-primary tracking-wider mb-2 block">Synthesis Suggestions</span>
                            {criticism.suggestions.map((s, i) => (
                              <div key={i} className="text-sm bg-background/50 border border-border/50 p-2 rounded mb-1">{s}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BOTTOM: Trace Timeline details */}
            <AnimatePresence>
              {agentSteps.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                  <div className="border-b border-border mb-6 pb-2 flex justify-between items-end">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Inference Details Backtrace</h3>
                    <span className="text-[12px] font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">{agentSteps.length} Operations</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {agentSteps.map((step, i) => (
                      <Card key={i} className="bg-card border-border subtle-shadow rounded-xl overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-secondary/30 border-b border-border/50 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getAgentIcon(step.agent)}
                            <span className="font-bold text-sm tracking-wide">{step.agent}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">{new Date(step.timestamp).toLocaleTimeString()}</span>
                        </CardHeader>
                        <CardContent className="p-4 text-xs leading-relaxed text-muted-foreground max-h-[160px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                          {step.output}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>

    </div>
  );
}
