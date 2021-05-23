const puppeteer = require('puppeteer');
const jsonfile = require('jsonfile');

const accountCookies = './cookies.json';
const mailUrl = 'https://mail.google.com/mail/u/0/?tab=wm#inbox';

function readMail(page) {

};

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: ["--disable-extensions", "--enable-automation", '--start-maximized']
    });
    const pages = await browser.pages();
    const page = pages[0];

    const cookiesString = await jsonfile.readFile(accountCookies);
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

    await page.goto(mailUrl, { waitUntil: 'networkidle2' })

    await readMail(page);

    // await browser.close()
};

main();