from duckduckgo_search import DDGS

with DDGS() as ddgs:
    results = list(ddgs.text("test", max_results=1))
    if results:
        print(results[0].keys())
        print(results[0])
