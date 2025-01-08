const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeAmazonProduct(url, email, password) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);

    // Set user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Login Process
    console.log("Navigating to login page...");
    await page.goto(
      "https://www.amazon.in/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.in%2F&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=inflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0"
    );

    // Login
    console.log("Logging in...");
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', email, { delay: 100 });
    await page.click('input[id="continue"]');

    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]', password, { delay: 100 });
    await page.click('input[id="signInSubmit"]');

    // Wait for login to complete
    await page.waitForNavigation();

    console.log("Navigating to product page...");
    await page.goto(url, { waitUntil: "networkidle2" });

    // Product details extraction
    console.log("Extracting product details...");
    const productDetails = await page.evaluate(() => {
      const title = document.querySelector("#productTitle")?.textContent.trim();

      const priceSelectors = [
        ".a-price-whole",
        ".a-price .a-offscreen",
        "#priceblock_ourprice",
        "#priceblock_dealprice",
      ];

      let price = null;
      for (const selector of priceSelectors) {
        const priceElement = document.querySelector(selector);
        if (priceElement) {
          price = priceElement.textContent.trim();
          break;
        }
      }

      if (price) {
        price = price.replace(/[^\d,.]/g, "");
        price = "₹" + price;
      }

      const ratingElement = document.querySelector(
        '[data-hook="rating-out-of-text"]'
      );
      let rating = null;
      if (ratingElement) {
        rating = ratingElement.textContent.trim();
      }

      const totalRatingsElement = document.querySelector(
        '[data-hook="total-review-count"]'
      );
      let totalRatings = null;
      if (totalRatingsElement) {
        totalRatings = totalRatingsElement.textContent.trim();
      }

      const ratingDistribution = {};
      const histogramRows = document.querySelectorAll(
        "#histogramTable .a-list-item a"
      );

      histogramRows.forEach((row) => {
        const ariaLabel = row.getAttribute("aria-label");
        if (ariaLabel) {
          const match = ariaLabel.match(
            /(\d+) percent of reviews have (\d+) stars?/
          );
          if (match) {
            const percentage = match[1];
            const stars = match[2];
            ratingDistribution[`${stars}_star`] = `${percentage}%`;
          }
        }
      });

      const seeMoreReviewsLink = document.querySelector(
        '[data-hook="see-all-reviews-link-foot"]'
      );
      const reviewsUrl = seeMoreReviewsLink ? seeMoreReviewsLink.href : null;

      return {
        title,
        price,
        rating,
        totalRatings,
        ratingDistribution,
        reviewsUrl,
      };
    });

    // Navigate to reviews page and scrape reviews
    if (productDetails.reviewsUrl) {
      console.log("Navigating to reviews page...");
      await page.goto(productDetails.reviewsUrl, { waitUntil: "networkidle2" });

      const allReviews = [];
      let pageNumber = 1;

      let translationAttempted = false;
      while (true) {
        console.log(`Scraping page ${pageNumber}...`);

        if (!translationAttempted) {
          try {
            await page.waitForSelector(
              '[data-hook="cr-translate-these-reviews-link"]',
              { timeout: 5000 }
            );
            await page.click('[data-hook="cr-translate-these-reviews-link"]');
            await delay(1000 + Math.random() * 2000);
            console.log("Reviews translated to English");
          } catch (error) {
            console.log(
              "No translate button found, continuing with original reviews"
            );
            console.error("Error translating reviews:", error.message);
          }
          translationAttempted = true;
        }

        // Wait for reviews to load
        await page
          .waitForSelector('[data-hook="review"]', { timeout: 10000 })
          .catch(() => console.log("No reviews found on this page"));

        // Extract reviews from current page
        const newReviews = await page.evaluate(() => {
          const reviews = [];
          const reviewElements = document.querySelectorAll(
            '[data-hook="review"]'
          );

          reviewElements.forEach((element) => {
            reviews.push({
              text:
                element
                  .querySelector('[data-hook="review-body"]')
                  ?.textContent.trim() || "",
              date:
                element
                  .querySelector('[data-hook="review-date"]')
                  ?.textContent.trim() || "",
              rating:
                element
                  .querySelector('[data-hook="review-star-rating"]')
                  ?.textContent.trim() || "",
              title:
                element
                  .querySelector('[data-hook="review-title"]')
                  ?.textContent.trim() || "",
            });
          });

          return reviews;
        });

        if (newReviews.length === 0) {
          console.log("No reviews found on this page, stopping pagination");
          break;
        }

        allReviews.push(...newReviews);
        console.log(`Found ${newReviews.length} reviews on page ${pageNumber}`);

        // Check for next page button
        const hasNextPage = await page.evaluate(() => {
          const nextButton = document.querySelector(".a-pagination .a-last a");
          return !!nextButton;
        });

        if (!hasNextPage) {
          console.log("No more pages to scrape");
          break;
        }

        // Click next page button and wait for navigation
        try {
          await Promise.all([
            page.click(".a-pagination .a-last a"),
            page.waitForNavigation({ waitUntil: "networkidle2" }),
          ]);

          // Add delay between pages to avoid being blocked
          await delay(3000 + Math.random() * 2000);
          pageNumber++;
        } catch (error) {
          console.error("Error navigating to next page:", error.message);
          break;
        }
      }

      productDetails.reviews = allReviews;

      const productCsvContent =
        "Product Title,Price,Rating,Total Reviews\n" +
        `"${productDetails.title.replace(/"/g, '""')}","${
          productDetails.price
        }","${productDetails.rating}","${productDetails.totalReviews}"`;

      // Write product details to CSV
      fs.writeFileSync("amazon_product_details.csv", productCsvContent, "utf8");
      console.log("Product details saved to amazon_product_details.csv");

      // Write reviews to CSV with product title
      const reviewsCsvContent =
        "Product,Page,Title,Rating,Date,Review\n" +
        allReviews
          .map(
            (review, index) =>
              `"${productDetails.title.replace(/"/g, '""')}","${
                Math.floor(index / 10) + 1
              }","${review.title.replace(/"/g, '""')}","${review.rating}","${
                review.date
              }","${review.text.replace(/"/g, '""')}"`
          )
          .join("\n");

      fs.writeFileSync("amazon_reviews.csv", reviewsCsvContent, "utf8");
      console.log(`Total reviews scraped: ${allReviews.length}`);
      console.log("Reviews saved to amazon_reviews.csv");
    }

    return productDetails;
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const url =
  "https://www.amazon.in/MSI-MP341CQ-34-Inch-Computer-Monitor/dp/B0BGM43DRW/?_encoding=UTF8&pd_rd_w=T6BEc&content-id=amzn1.sym.8d495402-cfc2-4d44-a850-d7e6b3b42c68&pf_rd_p=8d495402-cfc2-4d44-a850-d7e6b3b42c68&pf_rd_r=8CZ32CY3FDFC10HXX7SR&pd_rd_wg=1Rn3t&pd_rd_r=9d287b5e-2042-4305-b0e2-fa5c99b569cb&ref_=pd_hp_d_atf_dealz_sv";
const email = process.env.AMAZON_EMAIL;
const password = process.env.AMAZON_PASSWORD;

if (!email || !password) {
  throw new Error(
    "Missing AMAZON_EMAIL or AMAZON_PASSWORD in environment variables"
  );
}

console.log("Starting scraper...");
scrapeAmazonProduct(url, email, password)
  .then((details) => {
    console.log("\nProduct Summary:");
    console.log("Product Title:", details.title);
    console.log("Product Price:", details.price);
    console.log("Product Rating:", details.rating);
    console.log("Total Ratings:", details.totalRatings);
    console.log("\nRating Distribution:");
    if (details.ratingDistribution) {
      const stars = ["5_star", "4_star", "3_star", "2_star", "1_star"];
      stars.forEach((star) => {
        console.log(
          `${star.replace("_", " ")}: ${
            details.ratingDistribution[star] || "0%"
          }`
        );
      });
    }
    console.log(`\nTotal Reviews Scraped: ${details.reviews?.length || 0}`);
  })
  .catch((error) => {
    console.error("Failed to scrape product details:", error);
  });
