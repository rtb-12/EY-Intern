const puppeteer = require('puppeteer');
const fs = require('fs');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeAmazonProduct(url, email, password) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(60000);
        await page.setDefaultTimeout(60000);

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Login Process
        console.log('Navigating to login page...');
        await page.goto('https://www.amazon.in/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.in%2F&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=inflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0');

        console.log('Logging in...');
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', email, { delay: 100 });
        await page.click('input[id="continue"]');
        
        await page.waitForSelector('input[name="password"]');
        await page.type('input[name="password"]', password, { delay: 100 });
        await page.click('input[id="signInSubmit"]');

        await page.waitForNavigation();

        // Navigate to product page and get reviews URL
        console.log('Navigating to product page...');
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const reviewsUrl = await page.evaluate(() => {
            const reviewsLink = document.querySelector('[data-hook="see-all-reviews-link-foot"]');
            return reviewsLink ? reviewsLink.href : null;
        });

        if (!reviewsUrl) {
            throw new Error('Could not find reviews URL');
        }

        // Navigate to reviews page
        console.log('Navigating to reviews page...');
        await page.goto(reviewsUrl, { waitUntil: 'networkidle2' });
        
        const allReviews = [];
        let pageNumber = 1;
        
        while (true) {
          console.log(`Scraping page ${pageNumber}...`);

          // Wait for reviews to load
          await page.waitForSelector('[data-hook="review-body"]');

          // Extract reviews
          const newReviews = await page.evaluate(() => {
            const reviews = [];
            const reviewElements = document.querySelectorAll(
              '[data-hook="review-body"]'
            );

            reviewElements.forEach((element) => {
              const reviewContainer = element.closest(".review");
              if (reviewContainer) {
                reviews.push({
                  text: element.textContent.trim(),
                  date:
                    reviewContainer
                      .querySelector('[data-hook="review-date"]')
                      ?.textContent.trim() || "Date not found",
                  rating:
                    reviewContainer
                      .querySelector('[data-hook="review-star-rating"]')
                      ?.textContent.trim() || "Rating not found",
                  title:
                    reviewContainer
                      .querySelector('[data-hook="review-title"]')
                      ?.textContent.trim() || "Title not found",
                });
              }
            });

            return reviews;
          });

          allReviews.push(...newReviews);
          console.log(
            `Found ${newReviews.length} reviews on page ${pageNumber}`
          );

          // Check for next page
          const isLastPage = await page.evaluate(() => {
            const nextButton = document.querySelector(
              ".a-pagination li.a-last"
            );
            return nextButton && nextButton.classList.contains("a-disabled");
          });

          if (isLastPage) {
            console.log("Reached last page");
            break;
          }

          // Navigate to next page
          try {
            const nextPageButton = await page.$(".a-pagination li.a-last a");
            if (!nextPageButton) {
              console.log("No next page button found");
              break;
            }

            await nextPageButton.click();
            await page.waitForNavigation({ waitUntil: "networkidle2" });

            // Add delay between pages using custom delay function
            await delay(2000);
            pageNumber++;
          } catch (error) {
            console.error("Error navigating to next page:", error.message);
            break;
          }
        }

        // Save reviews to CSV
        const csvContent = 'Page Number,Title,Rating,Date,Review\n' + 
            allReviews.map((review, index) => {
                const pageNum = Math.floor(index / 10) + 1;
                return `${pageNum},"${review.title.replace(/"/g, '""')}","${review.rating}","${review.date}","${review.text.replace(/"/g, '""')}"`;
            }).join('\n');

        fs.writeFileSync('amazon_reviews.csv', csvContent, 'utf8');
        console.log(`Successfully scraped ${allReviews.length} reviews across ${pageNumber} pages`);
        console.log('Reviews saved to amazon_reviews.csv');

        return allReviews;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Usage
const url = 'https://www.amazon.in/MSI-G274QPF-E2-Gaming-Monitor/dp/B0CR9ZS4ZK';
require('dotenv').config();

// ...existing code...

const email = process.env.AMAZON_EMAIL;
const password = process.env.AMAZON_PASSWORD;

if (!email || !password) {
  throw new Error('Missing AMAZON_EMAIL or AMAZON_PASSWORD in environment variables');
}

scrapeAmazonProduct(url, email, password)
    .then(reviews => {
        console.log(`Total reviews scraped: ${reviews.length}`);
    })
    .catch(error => {
        console.error('Scraping failed:', error);
    });