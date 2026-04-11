"""
AutoResearch AI Tools
Integrates external tools like web search into the research pipeline
"""

from ddgs import DDGS
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

def web_search(query: str, max_results: int = 5) -> List[Dict]:
    """
    Perform a web search using DuckDuckGo
    
    Returns a list of dicts: {"title": str, "content": str, "href": str}
    """
    try:
        logger.info(f"Executing web search for: {query}")
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            
        formatted_results = []
        for r in results:
            formatted_results.append({
                "title": r.get("title", "No Title"),
                "content": r.get("body", ""),
                "url": r.get("href", "")
            })
            
        return formatted_results
    except Exception as e:
        logger.error(f"Web search failed: {str(e)}")
        return []

def format_web_results_as_context(results: List[Dict]) -> str:
    """Format search results into a string for the LLM prompt"""
    if not results:
        return "[No web results found]"
        
    context = "WEB SEARCH RESULTS:\n\n"
    for i, res in enumerate(results, 1):
        context += f"[Web Source {i}: {res['title']}]\n"
        context += f"URL: {res['url']}\n"
        context += f"CONTENT: {res['content']}\n\n"
        
    return context
