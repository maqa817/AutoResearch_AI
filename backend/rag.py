"""
RAG (Retrieval Augmented Generation) Pipeline
Integrates document retrieval with LLM inference
"""

from typing import List, Dict, Optional
import requests
from embed import retrieve_relevant_chunks, embedding_manager


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
    
    def _retrieve_context(self, query: str) -> str:
        """
        Retrieve relevant chunks and format as context
        
        Args:
            query: User query
        
        Returns:
            Formatted context string
        """
        chunks = retrieve_relevant_chunks(query, top_k=self.chunk_count)
        
        if not chunks:
            return "[No relevant documents found]"
        
        context = "RELEVANT DOCUMENTS:\n\n"
        for i, chunk in enumerate(chunks, 1):
            score = chunk.get("similarity_score", 0)
            context += f"[Document {i} - Relevance: {score:.2f}]\n"
            context += f"{chunk['text'][:500]}...\n\n"  # Limit to first 500 chars
        
        return context
    
    def _build_prompt(self, query: str, context: str) -> str:
        """
        Build prompt with context for LLM
        
        Args:
            query: User's question
            context: Retrieved context
        
        Returns:
            Complete prompt
        """
        prompt = f"""You are an expert research assistant analyzing documents.

{context}

INSTRUCTIONS:
- Answer ONLY based on the provided documents
- If information is not in the documents, say "This information is not available in the provided documents"
- Be concise and accurate
- Cite which document you're referencing when relevant

USER QUESTION: {query}

ANSWER:"""
        
        return prompt
    
    def _call_ollama(self, prompt: str) -> Optional[str]:
        """
        Call Ollama API for inference
        
        Args:
            prompt: Complete prompt
        
        Returns:
            Generated response or None if error
        """
        try:
            url = f"{self.ollama_base_url}/api/generate"
            
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.3,  # Lower temperature for consistency
            }
            
            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()
            
            result = response.json()
            return result.get("response", "").strip()
        
        except requests.exceptions.ConnectionError:
            return "ERROR: Cannot connect to Ollama. Is it running? (ollama serve)"
        except requests.exceptions.Timeout:
            return "ERROR: Ollama request timed out. Model may still be loading."
        except Exception as e:
            return f"ERROR: {str(e)}"
    
    def generate(self, query: str) -> Dict:
        """
        Generate response using RAG pipeline
        
        Args:
            query: User's question
        
        Returns:
            Dict with answer, context, and metadata
        """
        # Step 1: Retrieve relevant context
        context = self._retrieve_context(query)
        
        # Step 2: Build prompt
        prompt = self._build_prompt(query, context)
        
        # Step 3: Generate response
        answer = self._call_ollama(prompt)
        
        # Step 4: Return structured result
        return {
            "query": query,
            "answer": answer,
            "context_used": context,
            "model": self.model,
            "chunks_retrieved": self.chunk_count
        }
    
    def batch_generate(self, queries: List[str]) -> List[Dict]:
        """
        Generate responses for multiple queries
        
        Args:
            queries: List of questions
        
        Returns:
            List of results
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
        
Create a research plan with 3-4 specific steps to investigate.
Return as a numbered list."""
        
        plan_text = self.rag._call_ollama(planner_prompt)
        return plan_text.split('\n') if plan_text else []
    
    def conduct_research(self, query: str) -> str:
        """Researcher: Find relevant information"""
        return self.rag.generate(query)["answer"]
    
    def analyze_findings(self, findings: str) -> str:
        """Analyst: Synthesize and identify patterns"""
        analysis_prompt = f"""Based on these research findings:

{findings}

Provide a structured analysis identifying:
1. Key findings
2. Important patterns
3. Areas of uncertainty
4. Recommended conclusions"""
        
        return self.rag._call_ollama(analysis_prompt)
    
    def write_report(self, query: str, analysis: str) -> str:
        """Writer: Generate comprehensive report"""
        report_prompt = f"""Write a professional research report on: {query}

Based on this analysis:
{analysis}

Structure the report with:
- Executive Summary
- Key Findings
- Analysis
- Conclusions
- Recommendations"""
        
        return self.rag._call_ollama(report_prompt)
    
    def critique_output(self, report: str) -> Dict:
        """Critic: Review for quality and accuracy"""
        critique_prompt = f"""Review this research report for quality:

{report}

Provide feedback on:
1. Accuracy and factuality
2. Completeness
3. Clarity and structure
4. Areas for improvement
5. Overall quality score (1-10)"""
        
        feedback = self.rag._call_ollama(critique_prompt)
        
        return {
            "feedback": feedback,
            "quality_pass": "Quality score: 8" in feedback or "Quality score: 9" in feedback or "Quality score: 10" in feedback
        }
    
    def orchestrate_full_research(self, query: str) -> Dict:
        """
        Run complete multi-agent research workflow, matching the Next.js frontend structure.
        """
        import time
        from datetime import datetime
        
        print(f"\n{'='*60}")
        print("STARTING FASTAPI MULTI-AGENT ORCHESTRATION")
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
        print("2. RESEARCHER AGENT...")
        research_str = self.conduct_research(query)
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
        
        # Format the critic feedback for the UI
        quality_str = 'fair'
        if critique_res['quality_pass'] or "Quality score: 9" in critique_res['feedback'] or "Quality score: 10" in critique_res['feedback']:
            quality_str = 'good'
        elif "Quality score: 1" in critique_res['feedback'] or "Quality score: 2" in critique_res['feedback']:
            quality_str = 'poor'

        criticism = {
            "quality": quality_str,
            "hallucinations": [],
            "suggestions": ["Consider adding more metrics", "Verify sources if generic"] if quality_str != 'good' else [],
            "shouldRegenerate": quality_str == 'poor'
        }
        
        # Optional Step 6: Rewrite if poor
        finalAnswer = report_str
        if criticism["shouldRegenerate"]:
            print("REGENERATING BASED ON CRITIC...")
            improvement_prompt = f"Improve this report based on critique: {report_str}\n\nCritique:\n{critique_res['feedback']}"
            finalAnswer = self.rag._call_ollama(improvement_prompt)
            steps.append({
                "agent": "Writer (Revised)",
                "input": improvement_prompt,
                "output": finalAnswer, 
                "timestamp": datetime.now().isoformat()
            })

        print("FASTAPI ORCHESTRATION COMPLETE\n")
        
        return {
            "query": query,
            "answer": finalAnswer,      
            "finalAnswer": finalAnswer, 
            "status": "completed",
            "steps": steps,             
            "criticism": criticism      
        }


# Global instances
rag_pipeline = RAGPipeline()
research_orchestrator = ResearchOrchestrator()


def generate_with_rag(query: str) -> Dict:
    """Simple RAG generation"""
    return rag_pipeline.generate(query)


def run_full_research(query: str) -> Dict:
    """Run full multi-agent research"""
    return research_orchestrator.orchestrate_full_research(query)
