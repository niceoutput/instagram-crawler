const puppeteer = require("puppeteer");
const secrets = require("./secrets");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://instagram.com");

  await page.waitForSelector("input");

  const inputs = await page.$$("input");
  await inputs[0].type(secrets.USERNAME);
  await inputs[1].type(secrets.PASSWORD);

  await page.waitForSelector("div[role=presentation]");
  await page.click("div[role=presentation] button:first-of-type");
  await page.click("#loginForm > div div:nth-of-type(3) button");

  await page.waitForNavigation();

  const USERNAME = "niceoutput";
  await page.goto(`https://instagram.com/${USERNAME}`);

  await page.waitForSelector("article a");

  await (await page.$("article a")).click();
  await page.waitFor(1000);
  await (await page.$("article[role=presentation] section button")).click();
})();
