'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Sparkles, Zap, Upload, FileText, Settings, AlertCircle, CheckCircle, Trash2, BrainCircuit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [topK, setTopK] = useState(40);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setDocuments(prev => [...prev, ...files]);
    setIsUploading(true);
    
    try {
      // Simulate real-time progress for aesthetics
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData,
        });
      }
    } catch (err) {
      console.error('Failed to upload file to index:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const purgeSystem = async () => {
    if (confirm('Are you sure you want to delete all indexed documents?')) {
      await fetch('http://localhost:8000/api/clear-index', { method: 'POST' });
      setDocuments([]);
      setResponse('');
      setAgentSteps([]);
      setCriticism(null);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    setAgentSteps([]);
    setCriticism(null);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          useFullOrchestration,
          documents: documents.map(d => d.name),
        }),
      });

      if (!res.ok) throw new Error('API processing failed');
      const data = await res.json();
      
      if (useFullOrchestration && data.steps) {
        setAgentSteps(data.steps);
        setResponse(data.finalAnswer);
        setCriticism(data.criticism || null);
      } else {
        setResponse(data.answer);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] selection:bg-indigo-500/30 font-sans text-gray-200 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />

      {/* Navbar Minimal */}
      <nav className="relative z-50 border-b border-white/5 bg-gray-950/20 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 leading-none">AutoResearch AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-indigo-400 mt-1 font-semibold">Workspace V5</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="border-white/10 text-gray-300 hover:bg-white/5 bg-transparent backdrop-blur-md rounded-full px-5"
            >
              <Settings className="w-4 h-4 mr-2" />
              Tuning
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={purgeSystem}
              className="border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 bg-transparent backdrop-blur-md rounded-full px-5"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Purge Memory
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="max-w-[1600px] mx-auto p-6 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-4 flex flex-col gap-6"
          >
            {/* Input Card */}
            <Card className="bg-white/[0.02] border-white/5 backdrop-blur-2xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                  Define Objective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Query */}
                  <div>
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What would you like the agents to research today?"
                      className="bg-black/20 border-white/5 focus:border-indigo-500/50 text-gray-200 placeholder:text-gray-600 resize-none rounded-xl focus:ring-1 focus:ring-indigo-500/50 transition-all p-4 text-sm"
                      rows={5}
                    />
                  </div>

                  {/* Document Uploader */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".txt,.pdf,.md,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white/[0.03] hover:bg-white/[0.08] border-dashed border-white/10 text-gray-400 rounded-xl py-6"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 mr-3 animate-spin text-indigo-400" />
                      ) : (
                        <Upload className="w-5 h-5 mr-3 text-indigo-400" />
                      )}
                      {isUploading ? 'Vectorizing documents...' : 'Attach Reference Files'}
                    </Button>
                    
                    <AnimatePresence>
                      {documents.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 flex flex-col gap-2 relative"
                        >
                          {documents.map((doc, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between text-xs bg-black/40 border border-white/5 rounded-lg px-3 py-2 group"
                            >
                              <span className="flex items-center gap-2 truncate text-gray-300">
                                <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                {doc.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeDocument(idx)}
                                className="text-gray-600 hover:text-rose-400 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Toggles & Submit */}
                  <div className="flex items-center gap-3 bg-black/20 border border-white/5 p-3 rounded-xl cursor-pointer hover:bg-black/30 transition-colors"
                       onClick={() => setUseFullOrchestration(!useFullOrchestration)}>
                    <div className={`w-5 h-5 rounded overflow-hidden flex items-center justify-center transition-colors ${useFullOrchestration ? 'bg-indigo-500' : 'bg-white/10 border border-white/10'}`}>
                      {useFullOrchestration && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 font-medium">Full Agentic Pipeline</p>
                      <p className="text-[10px] text-gray-500">Enable Planner, Analyst & Critic</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] font-bold tracking-wide"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Agents Computing...
                      </>
                    ) : (
                      <>
                        Execute Research <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Settings Drawer (Animated) */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-white/[0.02] border-white/5 backdrop-blur-2xl">
                    <CardHeader className="pb-2 text-gray-200">
                      <CardTitle className="text-sm">Inference Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400"><label>Temperature</label><span>{temperature.toFixed(2)}</span></div>
                        <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400"><label>Max Tokens</label><span>{maxTokens}</span></div>
                        <input type="range" min="256" max="4096" step="256" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Panel: Output & Traces */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-8 flex flex-col gap-6"
          >
            {/* Answer Display */}
            <Card className="bg-white/[0.01] border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-lg font-medium text-gray-200 flex items-center justify-between">
                  Final Synthesis
                  {loading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col">
                {!response && !loading ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-gray-500 opacity-50 py-10">
                    <Sparkles className="w-16 h-16 mb-4 stroke-1" />
                    <p className="font-light tracking-wider">AWAITING DIRECTIVES</p>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="prose prose-invert prose-indigo max-w-none w-full text-sm leading-relaxed"
                  >
                    {/* Render response or loading skeleton */}
                    {loading && !response ? (
                      <div className="space-y-3 animate-pulse opacity-50">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                        <div className="h-4 bg-white/10 rounded w-5/6"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: response.replace(/\n(.*)/g, '<p>$1</p>') }} /> // Simplistic formatting
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Orchestration Trace */}
            <AnimatePresence>
              {(agentSteps.length > 0 || criticism) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Trace Stack */}
                  {agentSteps.length > 0 && (
                    <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl">
                      <CardHeader className="py-4 border-b border-white/5">
                        <CardTitle className="text-sm font-medium text-gray-300 flex justify-between items-center">
                          <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Operational Trace</span>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">{agentSteps.length} Steps</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex flex-col gap-3">
                        <AnimatePresence>
                          {agentSteps.map((step, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="relative pl-6 pb-2"
                            >
                              {/* Connector line */}
                              {idx !== agentSteps.length - 1 && <div className="absolute left-1.5 top-5 bottom-[-15px] w-px bg-white/10" />}
                              
                              <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-indigo-300" />
                              </div>
                              <div className="flex justify-between items-end mb-1">
                                <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">{step.agent}</h4>
                              </div>
                              <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-xs text-gray-400 max-h-32 overflow-y-auto custom-scrollbar">
                                {step.output}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  )}

                  {/* Critic Review Box */}
                  {criticism && (
                    <Card className={`backdrop-blur-xl border-white/5 ${
                      criticism.quality === 'good' ? 'bg-emerald-500/5' : 
                      criticism.quality === 'fair' ? 'bg-amber-500/5' : 'bg-rose-500/5'
                    }`}>
                      <CardHeader className="py-4 border-b border-white/5">
                        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          {criticism.quality === 'good' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                          Quality Gate
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 uppercase">Assessment</span>
                          <span className={`text-xs font-bold uppercase ${
                            criticism.quality === 'good' ? 'text-emerald-400' : 
                            criticism.quality === 'fair' ? 'text-amber-400' : 'text-rose-400'
                          }`}>{criticism.quality}</span>
                        </div>
                        
                        {criticism.hallucinations?.length > 0 && (
                          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                            <p className="text-[10px] uppercase tracking-wider text-rose-400 mb-2 font-semibold">Flags Detected</p>
                            <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
                              {criticism.hallucinations.map((h, i) => <li key={i}>{h}</li>)}
                            </ul>
                          </div>
                        )}

                        {criticism.suggestions?.length > 0 && (
                          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                            <p className="text-[10px] uppercase tracking-wider text-indigo-400 mb-2 font-semibold">Refinement Vector</p>
                            <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
                              {criticism.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>

        </div>
      </div>
    </div>
  );
}
