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
