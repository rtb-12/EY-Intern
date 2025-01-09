const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeAmazonProduct(
  email,
  password,
  productType,
  brandName
) {
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

    // Navigate to the homepage
    console.log("Navigating to the homepage...");
    await page.goto("https://www.amazon.in/");

    // Click on the search bar and enter the product type
    console.log("Searching for product type...", productType);
    await page.waitForSelector('input[id="twotabsearchtextbox"]');
    await page.click('input[id="twotabsearchtextbox"]');
    await page.type('input[id="twotabsearchtextbox"]', productType, {
      delay: 100,
    });
    await page.keyboard.press("Enter");

    // Wait for the search results to load
    await page.waitForNavigation();

    // Wait for brand refinements to load
    console.log("Waiting for brand filters...");
    try {
      await page.waitForSelector("#brandsRefinements", {
        timeout: 5000,
        visible: true,
      });
      console.log("Brand filters loaded successfully");
    } catch (error) {
      console.error("Brand filters not found:", error);
    }

    // Apply Filter for the Brand
    console.log("Expanding brand filters...");
    try {
      await page.waitForSelector("#brandsRefinements .a-expander-prompt", {
        timeout: 5000,
        visible: true,
      });

      await page.$eval("#brandsRefinements .a-expander-prompt", (element) =>
        element.click()
      );
      console.log("Brand filters expanded successfully");

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to expand brand filters:", error);
    }


    console.log("Applying brand filter...", brandName);
    try {
      await page.waitForSelector('.a-link-normal.s-navigation-item', { 
        visible: true,
        timeout: 5000 
      });
      
      const brandFound = await page.evaluate((brandName) => {
        const brandElements = document.querySelectorAll('.s-navigation-item');
        for (const element of brandElements) {
          if (element.textContent.trim().toLowerCase() === brandName.toLowerCase()) {
            const checkbox = element.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.click();
              return true;
            }
          }
        }
        return false;
      }, brandName);
    
      if (brandFound) {
        console.log(`Successfully selected brand: ${brandName}`);
        // Wait for page to update after brand selection
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      } else {
        console.log(`Brand "${brandName}" not found in filters`);
      }
    } catch (error) {
      console.error(`Failed to select brand ${brandName}:`, error);
    }

    console.log("Extracting product links...");
try {
  await page.waitForSelector('.s-title-instructions-style', { 
    timeout: 5000,
    visible: true 
  });

  const products = await page.evaluate(() => {
    const productElements = document.querySelectorAll('.s-title-instructions-style');
    return Array.from(productElements).map(element => {
      const linkElement = element.querySelector('a');
      return {
        title: linkElement?.querySelector('span')?.textContent.trim() || 'No title',
        url: linkElement ? 'https://www.amazon.in' + linkElement.getAttribute('href') : null
      };
    });
  });

  console.log(`Found ${products.length} products:`);
  products.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.title}\nURL: ${product.url}`);
  });

  const urls = products
  .map(product => product.url)
  .filter(url => url) // Remove null/undefined URLs
  .join(',\n');

fs.writeFileSync('product_urls.txt', urls, 'utf-8');
console.log(`Saved ${products.length} URLs to product_urls.txt`);

} catch (error) {
  console.error("Failed to extract product links:", error);
}
  } catch (error) {
    console.log(error);
  }
}


const email = process.env.AMAZON_EMAIL;
const password = process.env.AMAZON_PASSWORD;
const productType = "laptop";
const brandName = "Apple";
if (!email || !password) {
  throw new Error(
    "Missing AMAZON_EMAIL or AMAZON_PASSWORD in environment variables"
  );
}
scrapeAmazonProduct(email, password, productType, brandName);