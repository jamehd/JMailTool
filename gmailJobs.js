// Library
const puppeteer = require('puppeteer-extra')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
const delayTime = require('./delayTime');

// Process Config
const isPkg = typeof process.pkg !== 'undefined';
console.log(process.platform, isPkg);
console.log(puppeteer.executablePath());

// if (process.platform == 'win32') {
//     chromiumExecutablePath = (isPkg ?
//         puppeteer.executablePath().replace(
//             /^.*?\\node_modules\\puppeteer\\\.local-chromium/,
//             path.join(path.dirname(process.execPath), 'chromium')
//         ) : puppeteer.executablePath()
//     );
// }
puppeteer.use(stealthPlugin())

// Global Variable

const inboxMailUrl = 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox'
const sendToEmail = "opalkathlenevjw73@gmail.com"
const emailTitle = "Long Time No See"
const emailContent = "Hello\nHow Are you\nI miss you."
const unreadEmailUrl = 'https://mail.google.com/mail/u/0/feed/atom'

// Job

const login = require('./login')

const readEmail = async (page) => {
    console.log("Read Email")
    await page.goto(unreadEmailUrl)
    let mailsUnreaded = await page.evaluate(() => {
        let mailsUnreaded = [];
        let doc = new DOMParser().parseFromString(document.body.innerHTML.match(/<feed.*feed>/gi)[0], 'text/xml');

        [...doc.querySelectorAll('entry')].map(e => {
            mailsUnreaded.push(e.querySelector('link').getAttribute('href'))
        })

        return mailsUnreaded
    })

    console.log("Total email unreaded: ", mailsUnreaded.length)

    for (const element of mailsUnreaded) {
        console.log(element)
        await page.goto(element)
        await delayTime.delayStep()
        await delayTime.delayReadMail()
    }
}

const sendEmail = async (page) => {
    console.log("Send Email")
    await page.goto(inboxMailUrl)

    await page.click('div.T-I.T-I-KE.L3') // Compose
    await page.type('textarea.vO', sendToEmail)
    await page.type('input.aoT', emailTitle)
    await page.type('div.Am.Al.editable.LW-avf.tS-tW', emailContent)
    await delayTime.delayStep()
    await page.click('div.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3')
    await delayTime.delayStep()
}

// Main

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--window-size=1600,900',
            '--window-position=0,0',
            "--disable-notifications"
        ]
    })
    const page = await browser.newPage()

    await login.loginGmail(page);

    // await readEmail(page, browser)
    // console.log("Readed")

    // await sendEmail(page)
    // console.log('Sent Mail')

    // await browser.close()
    // process.exit()

})()