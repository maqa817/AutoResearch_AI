'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Sparkles, Zap, Upload, FileText, Settings, History, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [topK, setTopK] = useState(40);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments([...documents, ...files]);
    
    // Automatically upload to FastAPI backend
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.error('Failed to upload file to index:', file.name, err);
      }
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleUpdateConfig = async () => {
    try {
      await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateConfig',
          config: {
            temperature,
            max_tokens: maxTokens,
            top_k: topK,
          },
        }),
      });
      setShowSettings(false);
    } catch (err) {
      console.error('Failed to update config:', err);
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
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          useFullOrchestration,
          documents: documents.map(d => d.name),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process query');
      }

      const data = await response.json();
      
      if (useFullOrchestration && data.steps) {
        // Multi-agent mode
        setAgentSteps(data.steps);
        setResponse(data.finalAnswer);
        setCriticism(data.criticism || null);
      } else {
        // Simple mode
        setResponse(data.answer);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">AutoResearch AI</h1>
              <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">v4</span>
            </div>
            <p className="text-slate-300">Planner → Researcher → Writer → Critic (with Memory & Config)</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="border-slate-600 text-white hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Research Query</CardTitle>
                  <CardDescription className="text-slate-400">
                    Ask your research question
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Document Upload */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Upload Documents (Optional)
                      </label>
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
                        className="w-full border-slate-600 text-white hover:bg-slate-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>

                    {/* File List */}
                    {documents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400">{documents.length} file(s) selected</p>
                        {documents.map((doc, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-700 p-2 rounded text-sm text-slate-200">
                            <span className="truncate flex items-center gap-2">
                              <FileText className="w-3 h-3 flex-shrink-0" />
                              {doc.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeDocument(idx)}
                              className="text-red-400 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Query Input */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Your Question
                      </label>
                      <Textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="What do you want to research?"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                        rows={5}
                      />
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center space-x-2 bg-slate-700 p-3 rounded-lg">
                      <input
                        type="checkbox"
                        id="fullOrch"
                        checked={useFullOrchestration}
                        onChange={(e) => setUseFullOrchestration(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="fullOrch" className="text-sm text-slate-300 cursor-pointer flex-1">
                        Multi-Agent Analysis (with Critic)
                      </label>
                    </div>

                    {error && (
                      <div className="bg-red-900/30 border border-red-700 text-red-200 text-sm p-3 rounded flex gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {useFullOrchestration ? 'Analyzing...' : 'Researching...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Settings Panel */}
              {showSettings && (
                <Card className="bg-slate-800 border-slate-700 border-amber-500/50">
                  <CardHeader>
                    <CardTitle className="text-white">Model Configuration</CardTitle>
                    <CardDescription className="text-slate-400">
                      Adjust Ollama model parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Temperature: {temperature.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Max Tokens: {maxTokens}
                      </label>
                      <input
                        type="range"
                        min="256"
                        max="4096"
                        step="256"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Top-K: {topK}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={topK}
                        onChange={(e) => setTopK(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateConfig}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Save Configuration
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Agent Steps */}
              {agentSteps.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Agent Workflow
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Complete multi-agent orchestration trace
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {agentSteps.map((step, idx) => (
                      <div key={idx} className="border-l-2 border-blue-500 pl-4 py-2 hover:bg-slate-700/50 rounded transition">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <h3 className="font-semibold text-blue-300">{step.agent}</h3>
                          <span className="text-xs text-slate-500 ml-auto">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-slate-700 rounded p-3 text-sm text-slate-200 max-h-28 overflow-y-auto">
                          <div className="text-slate-100 whitespace-pre-wrap text-xs leading-relaxed">
                            {step.output.substring(0, 300)}
                            {step.output.length > 300 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Critic Review */}
              {criticism && (
                <Card className={`border-slate-700 ${
                  criticism.quality === 'good' 
                    ? 'bg-green-900/20 border-green-700/50' 
                    : criticism.quality === 'fair'
                    ? 'bg-yellow-900/20 border-yellow-700/50'
                    : 'bg-red-900/20 border-red-700/50'
                }`}>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      {criticism.quality === 'good' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                      Quality Review
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Critic Agent Assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-300 mb-1">
                        <strong>Quality:</strong> <span className="capitalize text-base">{criticism.quality}</span>
                      </p>
                    </div>
                    {criticism.hallucinations.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-300 mb-1"><strong>Hallucinations Detected:</strong></p>
                        <ul className="text-xs text-slate-200 space-y-1 ml-4">
                          {criticism.hallucinations.map((h, i) => (
                            <li key={i}>• {h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {criticism.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-300 mb-1"><strong>Suggestions:</strong></p>
                        <ul className="text-xs text-slate-200 space-y-1 ml-4">
                          {criticism.suggestions.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Final Response */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Final Answer</CardTitle>
                  <CardDescription className="text-slate-400">
                    {useFullOrchestration ? 'Multi-agent synthesis with critic review' : 'Direct answer from Ollama'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!response ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                      <p>Submit a query to see results</p>
                    </div>
                  ) : (
                    <div className="bg-slate-700 rounded-lg p-4 min-h-40">
                      <div className="text-slate-100 whitespace-pre-wrap leading-relaxed text-sm">
                        {response}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
