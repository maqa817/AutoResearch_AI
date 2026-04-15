from duckduckgo_search import DDGS
import logging

logging.basicConfig(level=logging.INFO)

def test_search():
    print("Starting search test...")
    try:
        with DDGS() as ddgs:
            print("DDGS initialized, executing text search...")
            results = list(ddgs.text("test query", max_results=5))
            print(f"Found {len(results)} results")
            for r in results:
                print(f"- {r.get('title')}")
    except Exception as e:
        print(f"Search failed with error: {e}")

if __name__ == "__main__":
    test_search()
