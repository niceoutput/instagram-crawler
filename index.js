const puppeteer = require("puppeteer");
const secrets = require("./secrets");
const Sheet = require('./sheet');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://instagram.com");

  await page.waitForSelector("input");

  const inputs = await page.$$("input");

  // Fill the form input values
  await inputs[0].type(secrets.USERNAME);
  await inputs[1].type(secrets.PASSWORD);

  // wait for the popup to appear and click in accept
  await page.waitForSelector("div[role=presentation]");
  await page.click("div[role=presentation] button:first-of-type");
  await page.click("#loginForm > div div:nth-of-type(3) button");

  await page.waitForNavigation();

  // Go to my profile
  const USERNAMES = ["niceoutput", "gfigueiredo78"];
  const profiles = [];

  for (let USERNAME of USERNAMES) {
    await page.goto(`https://instagram.com/${USERNAME}`);
    await page.waitForSelector("img");
    const imgSrc = await page.$eval("img", (el) => el.getAttribute("src"));
    const headerData = await page.$$eval("header li", (els) =>
      els.map((el) => el.textContent)
    );
    const name = await page.$eval("header h1", (el) => el.textContent).catch(err => true);
    const desc = await page.$eval(".-vDIg span", (el) => el.textContent).catch(err => true);
    const link = await page.$eval(".-vDIg a", (el) => el.textContent).catch(err => true);
    const profile = { imgSrc, name, desc, link, username: USERNAME };

    for (let header of headerData) {
      // x posts, x followers, x following
      const [count, name] = header.split(' ');
      profile[name] = count;
    }
    profiles.push(profile);
  }

  const sheet = new Sheet();
  await sheet.load();

  const oldProfiles = await sheet.getRows(0);
  for (let oldProfile of oldProfiles) {
    if (USERNAMES.includes(oldProfile.username)) {
      await oldProfile.delete();
    }
  }

  await sheet.addRows(profiles, 0);

  await browser.close();
})();
