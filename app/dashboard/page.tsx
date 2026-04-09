'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Send, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments([...documents, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
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

    try {
      // Call actual backend
      const formData = new FormData();
      formData.append('query', query);
      documents.forEach((doc) => {
        formData.append('documents', doc);
      });

      const response = await fetch('http://localhost:8000/research', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to connect to backend');
      }

      const data = await response.json();
      setResponse(data.answer);
    } catch (err) {
      setError('Failed to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">AutoResearch AI</h1>
          </div>
          <p className="text-slate-300">Multi-Agent Research & Analysis System</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Research Query</CardTitle>
                <CardDescription className="text-slate-400">
                  Upload documents and ask questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.pdf,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>

                {/* Uploaded Files */}
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-300 font-medium">
                      {documents.length} file(s) uploaded
                    </p>
                    {documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-slate-700 p-2 rounded text-sm text-slate-200"
                      >
                        <span className="truncate">{doc.name}</span>
                        <button
                          onClick={() => removeDocument(idx)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Query Input */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Question
                    </label>
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What would you like to know about your documents?"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                      rows={4}
                    />
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
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="text-white">Analysis Results</CardTitle>
                <CardDescription className="text-slate-400">
                  Research findings and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!response ? (
                  <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                    <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                    <p>Submit a query to see analysis results</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <pre className="text-slate-100 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {response}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-700 flex-1"
                      >
                        Export Report
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-700 flex-1"
                      >
                        Copy Results
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-white">Multi-Document Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Upload multiple documents and get insights across all of them simultaneously.
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-white">AI-Powered Research</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Leverages advanced language models to understand context and provide accurate answers.
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base text-white">Instant Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Generate comprehensive research reports and export findings in multiple formats.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
