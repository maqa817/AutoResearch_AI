'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Brain, ShieldCheck, Database, Cpu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
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
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </span>
            <span className="text-xl font-bold tracking-tight">Enterprise Security</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-primary">Absolute Data Sovereignty</h1>
          <p className="text-xl text-muted-foreground">Built from the ground up to never leak intelligence to the cloud.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-border bg-card subtle-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <Cpu className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-3">100% Local Inference</h3>
              <p className="text-muted-foreground leading-relaxed text-[15px]">By isolating the computational engine through Ollama, AutoResearch negates the need for external API calls (e.g. OpenAI/Anthropic). Your proprietary files are read, parsed, and analyzed entirely on your own silicon.</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card subtle-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <Database className="w-10 h-10 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Self-Hosted Vector Bounds</h3>
              <p className="text-muted-foreground leading-relaxed text-[15px]">Retrieval-Augmented Generation (RAG) processes use on-device FAISS indexing alongside HuggingFace's `all-MiniLM-L6-v2` transformer. Context remains strictly bounded to your device's memory.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
