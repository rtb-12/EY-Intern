# DataScraping

This contains scripts for scraping reviews from Amazon using different approaches.

## Initial Approach: ScrapeGraphAI

First, we tried using ScrapeGraphAI with [Scrape.py](DataScraping/Scrape.py):

```python
from scrapegraphai.graphs import SmartScraperGraph
```

However, this approach didn't yield good results as:
- Limited control over data extraction
- Inconsistent results
- Rate limiting issues

## Current Approach: Two-Step Scraping

### Step 1: Extract Product URLs
Using amazonScrapper.js to get product URLs:

1. Create 

`.env`

 file with credentials:
```env
AMAZON_EMAIL=your_amazon_email
AMAZON_PASSWORD=your_amazon_password
```

2. Install dependencies:
```bash
npm install
```

3. Run URL scraper:
```bash
node amazonScrapper.js
```

This will create `product_urls.txt` with Amazon MacBook URLs.

### Step 2: Extract Reviews
Using amazonScrapper2.js to get reviews:

1. Run review scraper:
```bash
node amazonScrapper2.js
```

This reads URLs from `product_urls.txt` and creates:
- `amazon_product_with_reviews.csv`: Contains product details and reviews
## Environment Setup

Create a 

.env

 file in the [DataScraping](DataScraping ) folder:
```env
AMAZON_EMAIL=your_amazon_email
AMAZON_PASSWORD=your_amazon_password
```

## Features

- Login handling with provided credentials
- Automatic translation of non-English reviews
- Rate limiting and retry logic
- Structured data output in CSV format
- Error handling and logging

## Note

Make sure to:
- Use valid Amazon credentials
- Respect Amazon's terms of service
- Handle the data according to privacy guidelines
