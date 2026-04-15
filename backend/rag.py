"""
RAG (Retrieval Augmented Generation) Pipeline
Integrates document retrieval with LLM inference
"""

from typing import List, Dict, Optional
import requests
from embed import retrieve_relevant_chunks, embedding_manager
from tools import web_search, format_web_results_as_context

class RAGPipeline:
    """
    RAG Pipeline that:
    1. Retrieves relevant document chunks
    2. Injects them into LLM prompt
    3. Generates contextual responses
    """
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434", model: str = "mistral"):
        """
        Initialize RAG pipeline
        
        Args:
            ollama_base_url: Base URL for Ollama API
            model: Model name to use
        """
        self.ollama_base_url = ollama_base_url
        self.model = model
        self.chunk_count = 3  # Number of chunks to retrieve
    
    def _retrieve_context(self, query: str, doc_ids: List[str] = None) -> str:
        """
        Retrieve relevant chunks and format as context
        """
        if doc_ids is not None and len(doc_ids) == 0:
            return "[NO DOCUMENTS SELECTED BY USER]"

        chunks = retrieve_relevant_chunks(query, top_k=self.chunk_count, doc_ids=doc_ids)
        
        if not chunks:
            return "[No relevant information found in the selected files]"
        
        context = "RELEVANT DOCUMENTS:\n\n"
        for i, chunk in enumerate(chunks, 1):
            score = chunk.get("similarity_score", 0)
            context += f"[Document {i} - Relevance: {score:.2f} - ID: {chunk['doc_id']}]\n"
            context += f"{chunk['text'][:500]}...\n\n" 
        
        return context
    
    def _build_prompt(self, query: str, context: str) -> str:
        """
        Build prompt with context for LLM
        """
        prompt = f"""You are an expert research assistant.

{context}

INSTRUCTIONS:
- If context (Documents or Web) is provided, prioritize it.
- If the answer is not in the context, say "I cannot find specific details in the current context."
- If NO documents or web results are provided, answer politely as a research assistant and ask the user to upload documents or provide a more specific research question.
- Cite your sources where possible.

USER QUESTION: {query}

ANSWER:"""
        
        return prompt
    
    def _call_ollama(self, prompt: str, stream: bool = False):
        """
        Call Ollama API for inference
        """
        import json
        try:
            url = f"{self.ollama_base_url}/api/generate"
            
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": stream,
                "options": {
                    "temperature": 0.1,  # Critical: lower temperature reduces hallucinations
                    "num_gpu": 99,       # Forces Ollama to dump 100% of LLM layers onto the GPU (RTX 4060 Ti)
                    "num_ctx": 4096      # Prevents memory bleeding to CPU RAM
                }
            }
            
            response = requests.post(url, json=payload, timeout=120, stream=stream)
            response.raise_for_status()
            
            if stream:
                def event_generator():
                    for line in response.iter_lines():
                        if line:
                            chunk = json.loads(line)
                            if "response" in chunk:
                                yield chunk["response"]
                return event_generator()
            
            result = response.json()
            return result.get("response", "").strip()
        
        except requests.exceptions.ConnectionError:
            if stream:
                def err_gen(): yield "ERROR: Cannot connect to Ollama. Is it running?"
                return err_gen()
            return "ERROR: Cannot connect to Ollama. Is it running?"
        except Exception as e:
            if stream:
                def err_gen(): yield f"ERROR: {str(e)}"
                return err_gen()
            return f"ERROR: {str(e)}"
    
    def generate(self, query: str, doc_ids: List[str] = None, use_web: bool = False) -> Dict:
        """
        Generate response using RAG pipeline with optional doc filtering and web search
        """
        # Step 1: Retrieve relevant context from local files
        local_context = self._retrieve_context(query, doc_ids=doc_ids)
        
        # Step 2: Retrieve web context if requested
        web_context = ""
        if use_web:
            results = web_search(query)
            web_context = format_web_results_as_context(results)
            
        full_context = local_context + "\n" + web_context
        
        # Step 3: Build prompt
        prompt = self._build_prompt(query, full_context)
        
        # Step 4: Generate response
        answer = self._call_ollama(prompt)
        
        # Step 5: Return structured result
        return {
            "query": query,
            "answer": answer,
            "context_used": full_context,
            "local_context": local_context,
            "web_context": web_context,
            "model": self.model,
            "chunks_retrieved": self.chunk_count,
            "web_results_used": use_web
        }

    def batch_generate(self, queries: List[str]) -> List[Dict]:
        """
        Generate responses for multiple queries
        """
        results = []
        for query in queries:
            result = self.generate(query)
            results.append(result)
        
        return results
    
    def set_chunk_count(self, count: int):
        """Set number of chunks to retrieve"""
        self.chunk_count = max(1, min(count, 10))  # Limit to 1-10


class ResearchOrchestrator:
    """
    Orchestrates multi-agent research workflow using RAG
    """
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434"):
        self.rag = RAGPipeline(ollama_base_url)
        self.research_steps = []
    
    def plan_research(self, query: str) -> List[str]:
        """Planner: Break down research question"""
        planner_prompt = f"""Given the question: "{query}"
Create a research plan with 3 specific steps to investigate based ONLY on the selected documents.
Return as a numbered list."""
        
        plan_text = self.rag._call_ollama(planner_prompt)
        return plan_text.split('\n') if plan_text else []
    
    def conduct_research(self, query: str, doc_ids: List[str] = None, use_web: bool = False) -> str:
        """Researcher: Find relevant information in specific files and optionally the web"""
        return self.rag.generate(query, doc_ids=doc_ids, use_web=use_web)["answer"]
    
    def analyze_findings(self, findings: str) -> str:
        """Analyst: Synthesize and identify patterns"""
        analysis_prompt = f"""Analyze these findings found in the selected documents:
{findings}

Identify key patterns and conclusions."""
        return self.rag._call_ollama(analysis_prompt)
    
    def write_report(self, query: str, analysis: str) -> str:
        """Writer: Generate final answer"""
        report_prompt = f"""Write a concise answer to: {query}
Using this analysis of the documents:
{analysis}"""
        return self.rag._call_ollama(report_prompt)
    
    def critique_output(self, report: str) -> Dict:
        """Critic Agent"""
        critique_prompt = f"""Review this answer for accuracy against the source:
{report}
Is it good, fair, or poor?"""
        feedback = self.rag._call_ollama(critique_prompt)
        return {
            "feedback": feedback,
            "quality_pass": "good" in feedback.lower()
        }
    
    def orchestrate_full_research(self, query: str, doc_ids: List[str] = None, use_web: bool = False) -> Dict:
        """
        Run complete multi-agent research workflow, matching the Next.js frontend structure.
        """
        from datetime import datetime
        
        print(f"\n{'='*60}")
        print(f"STARTING ORCHESTRATION ON {len(doc_ids) if doc_ids else 'ALL'} FILES")
        print(f"Query: {query}")
        print(f"{'='*60}\n")
        
        steps = []
        
        # Step 1: Planning
        print("1. PLANNER AGENT...")
        plan_list = self.plan_research(query)
        plan_text = "\n".join(plan_list)
        steps.append({
            "agent": "Planner",
            "input": query,
            "output": plan_text,
            "timestamp": datetime.now().isoformat()
        })
        
        # Step 2: Research
        print(f"2. RESEARCHER AGENT (Targeting {doc_ids}, Web: {use_web})...")
        research_str = self.conduct_research(query, doc_ids=doc_ids, use_web=use_web)
        steps.append({
            "agent": "Researcher",
            "input": plan_text,
            "output": research_str,
            "timestamp": datetime.now().isoformat()
        })
        
        # Step 3: Analysis
        print("3. ANALYST AGENT...")
        analysis_str = self.analyze_findings(research_str)
        steps.append({
            "agent": "Analyst",
            "input": research_str,
            "output": analysis_str,
            "timestamp": datetime.now().isoformat()
        })
        
        # Step 4: Writing
        print("4. WRITER AGENT...")
        report_str = self.write_report(query, analysis_str)
        steps.append({
            "agent": "Writer",
            "input": analysis_str,
            "output": report_str,
            "timestamp": datetime.now().isoformat()
        })
        
        # Step 5: Critique
        print("5. CRITIC AGENT...")
        critique_res = self.critique_output(report_str)
        steps.append({
            "agent": "Critic",
            "input": report_str,
            "output": critique_res["feedback"],
            "timestamp": datetime.now().isoformat()
        })
        
        quality_str = 'fair'
        if critique_res['quality_pass']: quality_str = 'good'

        criticism = {
            "quality": quality_str,
            "hallucinations": [],
            "suggestions": [],
            "shouldRegenerate": quality_str == 'poor'
        }
        
        finalAnswer = report_str
        print("FASTAPI ORCHESTRATION COMPLETE\n")
        
        return {
            "query": query,
            "answer": finalAnswer,      
            "finalAnswer": finalAnswer, 
            "status": "completed",
            "steps": steps,             
            "criticism": criticism      
        }

    def orchestrate_full_research_stream(self, query: str, doc_ids: List[str] = None, use_web: bool = False):
        """
        Run complete multi-agent research workflow, yielding SSE events.
        """
        import json
        from datetime import datetime
        
        def format_event(event_type: str, data: dict) -> str:
            return f"data: {json.dumps({'type': event_type, 'data': data})}\n\n"

        yield format_event("status", {"message": "Starting Orchestration"})

        # Step 1: Planning
        yield format_event("agent_start", {"agent": "Planner"})
        planner_prompt = f"""Given the question: "{query}"\nCreate a research plan with 3 specific steps to investigate based ONLY on the selected documents.\nReturn as a numbered list."""
        
        plan_text = ""
        for token in self.rag._call_ollama(planner_prompt, stream=True):
            plan_text += token
            yield format_event("agent_token", {"agent": "Planner", "token": token})
            
        yield format_event("agent_end", {"agent": "Planner", "output": plan_text, "timestamp": datetime.now().isoformat()})

        # Step 2: Research
        yield format_event("agent_start", {"agent": "Researcher"})
        # We need local and web context
        local_context = self.rag._retrieve_context(query, doc_ids=doc_ids)
        web_context = ""
        if use_web:
            results = web_search(query)
            web_context = format_web_results_as_context(results)
        full_context = local_context + "\n" + web_context
        research_prompt = self.rag._build_prompt(query, full_context)

        research_str = ""
        for token in self.rag._call_ollama(research_prompt, stream=True):
            research_str += token
            yield format_event("agent_token", {"agent": "Researcher", "token": token})
            
        yield format_event("agent_end", {"agent": "Researcher", "output": research_str, "timestamp": datetime.now().isoformat()})

        # Step 3: Analysis
        yield format_event("agent_start", {"agent": "Analyst"})
        analysis_prompt = f"""Analyze these findings found in the selected documents:\n{research_str}\n\nIdentify key patterns and conclusions."""
        
        analysis_str = ""
        for token in self.rag._call_ollama(analysis_prompt, stream=True):
            analysis_str += token
            yield format_event("agent_token", {"agent": "Analyst", "token": token})
            
        yield format_event("agent_end", {"agent": "Analyst", "output": analysis_str, "timestamp": datetime.now().isoformat()})

        # Step 4: Writer
        yield format_event("agent_start", {"agent": "Writer"})
        report_prompt = f"""Write a concise answer to: {query}\nUsing this analysis of the documents:\n{analysis_str}"""
        
        report_str = ""
        for token in self.rag._call_ollama(report_prompt, stream=True):
            report_str += token
            yield format_event("agent_token", {"agent": "Writer", "token": token})
            
        yield format_event("agent_end", {"agent": "Writer", "output": report_str, "timestamp": datetime.now().isoformat()})

        # Step 5: Critic
        yield format_event("agent_start", {"agent": "Critic"})
        critique_prompt = f"""Review this answer for accuracy against the source:\n{report_str}\nIs it good, fair, or poor?"""
        
        feedback = ""
        for token in self.rag._call_ollama(critique_prompt, stream=True):
            feedback += token
            yield format_event("agent_token", {"agent": "Critic", "token": token})
        
        quality_str = 'fair'
        if 'good' in feedback.lower(): quality_str = 'good'
        elif 'poor' in feedback.lower(): quality_str = 'poor'

        criticism = {
            "quality": quality_str,
            "hallucinations": [],
            "suggestions": [],
            "shouldRegenerate": quality_str == 'poor'
        }
        
        yield format_event("agent_end", {"agent": "Critic", "output": feedback, "timestamp": datetime.now().isoformat()})

        # Final
        yield format_event("complete", {
            "finalAnswer": report_str,
            "criticism": criticism
        })


# Global instances
rag_pipeline = RAGPipeline()
research_orchestrator = ResearchOrchestrator()


def generate_with_rag(query: str, doc_ids: List[str] = None, use_web: bool = False) -> Dict:
    """Simple RAG generation with doc filtering and web support"""
    return rag_pipeline.generate(query, doc_ids=doc_ids, use_web=use_web)


def run_full_research(query: str, doc_ids: List[str] = None, use_web: bool = False) -> Dict:
    """Run full multi-agent research with doc filtering and web support"""
    return research_orchestrator.orchestrate_full_research(query, doc_ids=doc_ids, use_web=use_web)

def run_full_research_stream(query: str, doc_ids: List[str] = None, use_web: bool = False):
    """Run streamed multi-agent workflow"""
    return research_orchestrator.orchestrate_full_research_stream(query, doc_ids=doc_ids, use_web=use_web)

