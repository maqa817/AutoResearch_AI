from ddgs import DDGS

try:
    with DDGS() as ddgs:
        results = list(ddgs.text("What is the capital of France?", max_results=3))
        print("RESULTS:", results)
        if results:
            print(results[0].keys())
except Exception as e:
    print(f"Error: {e}")
