'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Brain, FileText, Zap, Lightbulb, BarChart3, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold text-white">AutoResearch AI</span>
          </div>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Launch Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Intelligent Multi-Agent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Research System
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Harness the power of AI agents working together to analyze documents, 
            conduct research, and generate comprehensive reports automatically.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              Learn More
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition">
            <CardHeader>
              <Brain className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Planner Agent</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Breaks down complex research questions into actionable steps
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition">
            <CardHeader>
              <FileText className="w-8 h-8 text-cyan-400 mb-2" />
              <CardTitle className="text-white">Researcher Agent</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Searches and analyzes documents to find relevant information
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Analyst Agent</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Synthesizes findings and identifies key insights and patterns
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition">
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Writer Agent</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Composes comprehensive, well-structured research reports
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition">
            <CardHeader>
              <Lightbulb className="w-8 h-8 text-orange-400 mb-2" />
              <CardTitle className="text-white">Critic Agent</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Reviews and refines outputs for accuracy and quality assurance
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Multi-Agent Orchestra</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              All agents work together seamlessly for superior results
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-800/30 border-t border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Upload Documents', desc: 'Share your research materials' },
              { step: '2', title: 'Ask Questions', desc: 'Define your research objectives' },
              { step: '3', title: 'AI Analysis', desc: 'Multi-agent system processes data' },
              { step: '4', title: 'Get Reports', desc: 'Receive comprehensive findings' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Research?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Start using AutoResearch AI today and experience intelligent automated research analysis
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
              Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 text-center text-slate-400">
        <p>AutoResearch AI v3.0 - Version 3: Multi-Agent Orchestration (Planner → Researcher → Writer)</p>
        <p className="text-sm mt-2">Vercel-Ready | Next.js 16 | AI SDK v6</p>
      </footer>
    </div>
  );
}
