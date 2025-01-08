from scrapegraphai.graphs import SmartScraperGraph
from scrapegraphai.utils import prettify_exec_info

graph_config = {
   "llm": {
      "model": "ollama/llama3.2",
      "temperature": 1,
      "format": "json", 
      "model_tokens": 2000, 
      "base_url": "http://localhost:11434",  
   }
}

# ************************************************
# Create the SmartScraperGraph instance and run it
# ************************************************

smart_scraper_graph = SmartScraperGraph(
   prompt="""
Extract the following information from the given product page:

- Product name 
- Price
- Rating
- Total number of ratings
- Total number of reviews

Please provide the output in JSON format containing only these fields.
""",
   source="https://www.flipkart.com/fossil-izzy-analog-watch-women/p/itm522147d011818?pid=WATFWYU3ZGMR58SY&lid=LSTWATFWYU3ZGMR58SYKWQE2Z&marketplace=FLIPKART&store=r18%2Ff13&spotlightTagId=TrendingId_r18%2Ff13&srno=b_1_3&otracker=browse&fm=organic&iid=334c5cb1-af70-4579-b9a5-f26ce3bf5061.WATFWYU3ZGMR58SY.SEARCH&ppt=browse&ppn=browse&ssid=nyjumfnqxs0000001734692849300",
   config=graph_config
)
result = smart_scraper_graph.run()
print(result)

# https://www.flipkart.com/watches/wrist-watches/pr?sid=r18%2Cf13&marketplace=FLIPKART&p%5B%5D=facets.discount_range_v1%255B%255D%3D50%2525%2Bor%2Bmore&p%5B%5D=facets.brand%255B%255D%3DTitan&p%5B%5D=facets.brand%255B%255D%3DFastrack&p%5B%5D=facets.brand%255B%255D%3DFOSSIL&p%5B%5D=facets.brand%255B%255D%3DTIMEX&p%5B%5D=facets.brand%255B%255D%3DCASIO&p%5B%5D=facets.brand%255B%255D%3DA%252FX%2BARMANI%2BEXCHANGE&p%5B%5D=facets.brand%255B%255D%3DGIORDANO&p%5B%5D=facets.brand%255B%255D%3DDANIEL%2BKLEIN&p%5B%5D=facets.brand%255B%255D%3DGUESS&p%5B%5D=facets.brand%255B%255D%3DMICHAEL%2BKORS&p%5B%5D=facets.brand%255B%255D%3DTOMMY%2BHILFIGER&p%5B%5D=facets.brand%255B%255D%3DMVMT&p%5B%5D=facets.brand%255B%255D%3DJust%2BCavalli&p%5B%5D=facets.brand%255B%255D%3DEMPORIO%2BARMANI&p%5B%5D=facets.brand%255B%255D%3DDANIEL%2BWELLINGTON&p%5B%5D=facets.brand%255B%255D%3DTed%2BBaker&p%5B%5D=facets.brand%255B%255D%3DMathey-Tissot&p%5B%5D=facets.brand%255B%255D%3DBOSS&p%5B%5D=facets.brand%255B%255D%3DCITIZEN&p%5B%5D=facets.brand%255B%255D%3DCOACH&p%5B%5D=facets.brand%255B%255D%3DDKNY&p%5B%5D=facets.brand%255B%255D%3DD1%2BMILANO&hpid=jtEqf43byxcjGNf7cvb-C6p7_Hsxr70nj65vMAAFKlc%3D&ctx=eyJjYXJkQ29udGV4dCI6eyJhdHRyaWJ1dGVzIjp7InZhbHVlQ2FsbG91dCI6eyJtdWx0aVZhbHVlZEF0dHJpYnV0ZSI6eyJrZXkiOiJ2YWx1ZUNhbGxvdXQiLCJpbmZlcmVuY2VUeXBlIjoiVkFMVUVfQ0FMTE9VVCIsInZhbHVlcyI6WyJNaW4uIDUwJSBPZmYiXSwidmFsdWVUeXBlIjoiTVVMVElfVkFMVUVEIn19LCJoZXJvUGlkIjp7InNpbmdsZVZhbHVlQXR0cmlidXRlIjp7ImtleSI6Imhlcm9QaWQiLCJpbmZlcmVuY2VUeXBlIjoiUElEIiwidmFsdWUiOiJXQVRGVVFFVzRaUFVKWFlCIiwidmFsdWVUeXBlIjoiU0lOR0xFX1ZBTFVFRCJ9fSwidGl0bGUiOnsibXVsdGlWYWx1ZWRBdHRyaWJ1dGUiOnsia2V5IjoidGl0bGUiLCJpbmZlcmVuY2VUeXBlIjoiVElUTEUiLCJ2YWx1ZXMiOlsiVGl0YW4sIEZvc3NpbCwgUG9saWNlICYgTW9yZSJdLCJ2YWx1ZVR5cGUiOiJNVUxUSV9WQUxVRUQifX19fX0%3D
