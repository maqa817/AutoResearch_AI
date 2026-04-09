'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Sparkles, Zap } from 'lucide-react';

interface AgentStep {
  agent: string;
  input: string;
  output: string;
  timestamp: string;
}

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [error, setError] = useState('');
  const [useFullOrchestration, setUseFullOrchestration] = useState(false);

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

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          useFullOrchestration,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">AutoResearch AI v3</h1>
          </div>
          <p className="text-slate-300">Multi-Agent Research System - Planner → Researcher → Writer</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-6 h-fit">
              <CardHeader>
                <CardTitle className="text-white">Ask a Question</CardTitle>
                <CardDescription className="text-slate-400">
                  Get intelligent multi-agent responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Query Input */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Query
                    </label>
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask anything you want researched..."
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                      rows={4}
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
                      Use Multi-Agent Mode
                    </label>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-700 text-red-200 text-sm p-3 rounded">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {useFullOrchestration ? 'Orchestrating...' : 'Answering...'}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Agent Steps */}
              {agentSteps.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Agent Workflow</CardTitle>
                    <CardDescription className="text-slate-400">
                      Multi-agent orchestration steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {agentSteps.map((step, idx) => (
                      <div key={idx} className="border-l-2 border-blue-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <h3 className="font-semibold text-blue-400">{step.agent} Agent</h3>
                          <span className="text-xs text-slate-400 ml-auto">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-slate-700 rounded p-3 text-sm text-slate-200">
                          <div className="mb-2 text-slate-400">
                            <strong>Output:</strong>
                          </div>
                          <div className="text-slate-100 whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
                            {step.output.substring(0, 500)}
                            {step.output.length > 500 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Final Response */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Final Answer</CardTitle>
                  <CardDescription className="text-slate-400">
                    {useFullOrchestration ? 'Multi-agent synthesis' : 'Direct answer'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!response ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                      <p>Submit a query to see results</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-slate-700 rounded-lg p-4 min-h-32">
                        <div className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                          {response}
                        </div>
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
