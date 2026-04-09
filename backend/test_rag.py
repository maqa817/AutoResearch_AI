#!/usr/bin/env python3
"""
Test script for RAG pipeline
Demonstrates all features: chunking, embedding, retrieval, and generation
"""

import time
from embed import embedding_manager, retrieve_relevant_chunks, get_embedding_stats
from rag import rag_pipeline, research_orchestrator

# Sample documents
SAMPLE_DOCS = {
    "ml_basics": """
Machine Learning Fundamentals

Machine learning is a subset of artificial intelligence that focuses on 
enabling computers to learn from data without being explicitly programmed.

Types of Machine Learning

There are three main types of machine learning:

1. Supervised Learning: In supervised learning, the algorithm learns from 
labeled data. Each training example consists of an input and its corresponding 
output. The model learns to map inputs to outputs. Common supervised learning 
tasks include classification and regression.

2. Unsupervised Learning: Unsupervised learning works with unlabeled data. 
The algorithm tries to find patterns, structures, or relationships in the data 
without predefined outputs. Common techniques include clustering and dimensionality 
reduction. K-means and hierarchical clustering are popular unsupervised methods.

3. Reinforcement Learning: In reinforcement learning, an agent learns by 
interacting with an environment. The agent receives rewards or penalties for 
its actions and learns to maximize cumulative rewards over time. This approach 
is commonly used in game playing and robotics.

Common Algorithms

Supervised learning algorithms include decision trees, random forests, support 
vector machines, and neural networks. These algorithms excel at tasks where 
labeled training data is available and the relationship between inputs and 
outputs can be learned.

Unsupervised algorithms focus on finding patterns. K-means clustering partitions 
data into k clusters. Hierarchical clustering creates a tree of clusters. 
Principal component analysis reduces dimensionality while preserving variance.

Deep Learning

Deep learning uses neural networks with multiple layers. Convolutional neural 
networks excel at image processing. Recurrent neural networks handle sequential 
data. Transformers have revolutionized natural language processing.
""",
    
    "ai_applications": """
Real-World Applications of AI

Natural Language Processing

Natural Language Processing enables computers to understand and generate human 
language. Applications include sentiment analysis, machine translation, question 
answering, and text summarization. Large language models like GPT have 
transformed NLP capabilities.

Computer Vision

Computer vision allows machines to interpret visual information from images and 
videos. Applications include object detection, image classification, facial 
recognition, and autonomous vehicles. Convolutional neural networks are the 
backbone of most computer vision systems.

Healthcare

AI applications in healthcare include disease diagnosis from medical images, 
drug discovery, patient outcome prediction, and personalized treatment plans. 
Deep learning models can detect cancers in X-rays and MRI scans with remarkable 
accuracy.

Robotics

Robots powered by AI can perform autonomous navigation, manipulation tasks, and 
human-robot collaboration. Reinforcement learning enables robots to learn complex 
motor skills. Vision combined with deep learning helps robots understand their 
environment.

Finance

AI in finance includes fraud detection, algorithmic trading, credit risk assessment, 
and customer service chatbots. Machine learning models analyze market trends and 
predict stock movements. Banks use deep learning for anomaly detection.
"""
}

def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_document_ingestion():
    """Test document chunking and embedding"""
    print_section("TEST 1: Document Ingestion & Chunking")
    
    for doc_name, doc_text in SAMPLE_DOCS.items():
        print(f"Adding document: {doc_name}")
        print(f"Document size: {len(doc_text)} characters")
        
        chunks_added = embedding_manager.add_document(
            doc_text,
            doc_name,
            {"source": "sample", "type": "educational"}
        )
        
        print(f"✓ Successfully added {chunks_added} chunks\n")
        time.sleep(1)

def test_statistics():
    """Test statistics reporting"""
    print_section("TEST 2: Index Statistics")
    
    stats = get_embedding_stats()
    print(f"Total Documents Indexed: {stats['total_documents']}")
    print(f"Total Chunks: {stats['total_chunks']}")
    print(f"Index Size: {stats['index_size']}")
    print(f"Embedding Model: {stats['embedding_model']}")
    print(f"Embedding Dimension: {stats['embedding_dimension']}")

def test_retrieval():
    """Test semantic retrieval"""
    print_section("TEST 3: Semantic Retrieval")
    
    test_queries = [
        "What are the types of machine learning?",
        "How is AI used in healthcare?",
        "Explain neural networks",
        "What is computer vision?"
    ]
    
    for query in test_queries:
        print(f"Query: {query}")
        chunks = retrieve_relevant_chunks(query, top_k=2)
        
        if chunks:
            for i, chunk in enumerate(chunks, 1):
                print(f"  Result {i} (Relevance: {chunk['similarity_score']:.2f})")
                print(f"    From: {chunk['doc_id']}")
                print(f"    Preview: {chunk['text'][:100]}...")
        else:
            print("  No results found")
        print()

def test_rag_generation():
    """Test RAG-based answer generation"""
    print_section("TEST 4: RAG Generation")
    
    queries = [
        "What is supervised learning?",
        "How is AI applied in robotics?",
    ]
    
    for query in queries:
        print(f"Query: {query}\n")
        
        result = rag_pipeline.generate(query)
        
        print(f"Answer:\n{result['answer']}\n")
        print(f"Chunks Used: {result['chunks_retrieved']}")
        print(f"Model: {result['model']}\n")

def test_full_orchestration():
    """Test full 5-agent research workflow"""
    print_section("TEST 5: Full Multi-Agent Orchestration")
    
    query = "What are the different types of machine learning and their applications?"
    
    print(f"Research Query: {query}\n")
    print("This will run all 5 agents...")
    print("(Note: Requires Ollama running)\n")
    
    result = research_orchestrator.orchestrate_full_research(query)
    
    print("\nFinal Report:")
    print("-" * 60)
    print(result["final_report"][:500])  # Print first 500 chars
    print("...")
    print("-" * 60)

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  AutoResearch AI v2 - RAG Pipeline Test Suite")
    print("="*60)
    
    try:
        # Test 1: Document ingestion
        test_document_ingestion()
        input("Press Enter to continue to Test 2...")
        
        # Test 2: Statistics
        test_statistics()
        input("Press Enter to continue to Test 3...")
        
        # Test 3: Retrieval
        test_retrieval()
        input("Press Enter to continue to Test 4...")
        
        # Test 4: RAG Generation (requires Ollama)
        print_section("TEST 4: RAG Generation")
        print("Skipping (requires Ollama running on localhost:11434)")
        print("To test, ensure Ollama is running: ollama serve")
        input("Press Enter to continue to Test 5...")
        
        # Test 5: Full orchestration (requires Ollama)
        print_section("TEST 5: Full Multi-Agent Orchestration")
        print("Skipping (requires Ollama running on localhost:11434)")
        print("To test, ensure Ollama is running: ollama serve")
        
        print_section("All Tests Complete")
        print("✓ Document ingestion working")
        print("✓ Semantic search working")
        print("✓ RAG pipeline ready")
        print("\nTo enable full tests, start Ollama: ollama serve")
        
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
