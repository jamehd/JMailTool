// Library
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());

const login = require('./login');
// Global Variable

const googleUrl = 'https://google.com.vn';

// Main
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--window-size=1600,900',
            '--window-position=0,0',
            "--disable-notifications"
        ]
    });
    const page = await browser.newPage()

    await login.loginGoogle(page);

})();
