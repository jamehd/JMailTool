// Library
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})
const { readFile, writeFile, existsSync } = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

// Process Config
const isPkg = typeof process.pkg !== 'undefined';
console.log(process.platform, isPkg)

if (process.platform == 'win32') {
    chromiumExecutablePath = (isPkg ?
        puppeteer.executablePath().replace(
            /^.*?\\node_modules\\puppeteer\\\.local-chromium/,
            path.join(path.dirname(process.execPath), 'chromium')
        ) : puppeteer.executablePath()
    );
}
puppeteer.use(StealthPlugin())

// Global Variable
const baseDir = './data/'

const timeStep = 3000
const timeReadEmail = 5000

const gmailUrl = 'https://mail.google.com'
const unreadEmailUrl = 'https://mail.google.com/mail/u/0/feed/atom'
const inboxMailUrl = 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox'

const sendToEmail = "opalkathlenevjw73@gmail.com"
const emailTitle = "Long Time No See"
const emailContent = "Hello\nHow Are you\nI miss you."

// Function
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
};

const fetchCredentials = () => {
    return new Promise((resolve, reject) => {
        readFile(`${baseDir}user-credentials.txt`, 'utf8', (err, content) => {
            if (err)
                reject('Error reading user credentials from file.')

            resolve(content.split('\n'))
        })
    })
}

const fetchCookies = () => {
    return new Promise((resolve, reject) => {
        readFile(`${baseDir}cookie.txt`, 'utf8', (err, content) => {
            if (err)
                reject('Error reading Cookies from file.')

            resolve(content)
        })
    })
}

const signInWithUsernamePassword = async page => {
    console.log("SignIn with UserName and Password")
    const [user, pass] = await fetchCredentials()

    await page.goto(gmailUrl)
    await delay(timeStep)

    await page.type('input#identifierId', user)
    await page.click('div#identifierNext')
    await delay(timeStep)

    await page.type('input[type="password"]', pass)
    await page.click('div#passwordNext')
    await page.waitForNavigation()

    // await delay(timeStep)
    // await page.evaluate(() => {
    //     [...document.getElementsByTagName('li')].filter(i => i.textContent.indexOf('52') != -1)[0].firstChild.click()
    // })

    // await delay(timeStep)
    // readline.question('OTP: ', async otp => {
    //     await page.type('input#idvPin', otp)
    //     await page.click('div#idvPreregisteredPhoneNext')
    // })

    // await page.waitForNavigation()
    // await delay(timeStep)

    const cookie = await page.cookies()

    return new Promise((resolve, reject) => {
        writeFile(
            `${baseDir}cookie.txt`,
            JSON.stringify(cookie),
            'utf8',
            (err, status) => {
                if (err)
                    reject(err)
                else
                    resolve(status)
            }
        )
    })
}

const signInWithCookies = async (page, cookie) => {
    console.log("SignIn with Cookies")
    const cookies = await fetchCookies()
    let cookieObjs = JSON.parse(cookies)

    for (let c of cookieObjs) {
        await page.setCookie(c)
    }

    try {
        await page.goto(unreadEmailUrl)
    } catch (err) {
        console.log(err)
        // cookie probably expired and Gmail returned a 401
        await signInWithUsernamePassword(page)
    }
}

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
        await delay(timeStep)
        await delay(timeReadEmail)
    }
}

const sendEmail = async (page) => {
    console.log("Send Email")
    await page.goto(inboxMailUrl)

    await page.click('div.T-I.T-I-KE.L3') // Compose
    await page.type('textarea.vO', sendToEmail)
    await page.type('input.aoT', emailTitle)
    await page.type('div.Am.Al.editable.LW-avf.tS-tW', emailContent)
    await delay(timeStep)
    await page.click('div.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3')
    await delay(timeStep)
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=800,600', '--window-position=320,150']
    })
    const page = await browser.newPage()

    console.log("Start Login")
    if (!existsSync(`${baseDir}cookie.txt`)) {
        await signInWithUsernamePassword(page)
    } else {
        await signInWithCookies(page)
    }
    console.log("Logged")

    // await readEmail(page, browser)
    // console.log("Readed")

    await sendEmail(page)
    console.log('Sent Mail')

    // await browser.close()
    // process.exit()
})()