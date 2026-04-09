"""
LLM interaction module using Ollama for local inference.
"""
import requests
from typing import Optional


OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "mistral"  # Can be "mistral" or "llama2"


def get_answer(question: str, context: str) -> str:
    """
    Query the local LLM with context injection.
    
    Args:
        question: User's question
        context: Context from dataset files
    
    Returns:
        Answer from the LLM
    """
    
    # Build the prompt with context injection
    prompt = build_prompt(question, context)
    
    try:
        # Call Ollama API
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": DEFAULT_MODEL,
                "prompt": prompt,
                "stream": False,
                "temperature": 0.3,  # Lower temperature for more consistent answers
            },
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get("response", "").strip()
            return answer if answer else "Unable to generate an answer."
        else:
            return f"Error from Ollama: {response.status_code}"
            
    except requests.exceptions.ConnectionError:
        return (
            "Error: Cannot connect to Ollama. "
            "Make sure Ollama is running on http://localhost:11434"
        )
    except requests.exceptions.Timeout:
        return "Error: Request to Ollama timed out. Please try again."
    except Exception as e:
        return f"Error: {str(e)}"


def build_prompt(question: str, context: str) -> str:
    """
    Build a prompt that injects context and forces the model
    to answer only from the provided context.
    """
    prompt = f"""You are a helpful AI assistant. Answer the following question ONLY using the provided context. 
If the answer is not in the context, say "I cannot find this information in the provided documents."

CONTEXT:
{context}

QUESTION: {question}

ANSWER:"""
    
    return prompt


def test_ollama_connection() -> bool:
    """Test if Ollama is running and accessible."""
    try:
        response = requests.get(
            "http://localhost:11434/api/tags",
            timeout=5
        )
        return response.status_code == 200
    except:
        return False
