const puppeteer = require('puppeteer');
const jsonfile = require('jsonfile');

const userName = 'hoangdv@gtv.vn';
const password = 'Khicanlaco@2';
const mailUrl = 'https://mail.google.com/mail/u/0/?tab=wm#inbox';

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
};

(async () => {

    const browser = await puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"]
    });

    const page = await browser.newPage();

    // Fix
    // await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.366");

    await page.goto(mailUrl, { waitUntil: 'networkidle2' });
    console.log("Fill Email");
    await page.waitForSelector('input[type="email"]', { visisble: true });
    await page.click('input[type="email"]');
    await page.type('input[type="email"]', userName);
    await page.waitForSelector('#identifierNext');
    await page.click('#identifierNext');

    await delay(5000);

    console.log("Fill PW");
    await page.waitForSelector('input[type="password"]', { visisble: true });
    await page.click('input[type="password"]');
    await page.type('input[type="password"]', password);
    await page.waitForSelector('#passwordNext');
    await page.click('#passwordNext', { waitUntil: 'networkidle2' });
    await page.waitForNavigation({ waitUntil: 'load' });

    await delay(5000);

    console.log("Write Cookies");
    const cookies = await page.cookies();
    await jsonfile.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));

    // await browser.close()
})();