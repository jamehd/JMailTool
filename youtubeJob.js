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

// const pathFileCookiesYoutube = `${baseDir}cookieYoutube.txt`
// const youtubelUrl = 'https://www.youtube.com'
// const youtubeStudioUrl = 'https://studio.youtube.com'
// const playlistTitle = "My Playlist 2"

const inboxMailUrl = 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox'
const sendToEmail = "opalkathlenevjw73@gmail.com"
const emailTitle = "Long Time No See"
const emailContent = "Hello\nHow Are you\nI miss you."

// Gmail


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

// Youtube
const signInYoutubeWithUsernamePassword = async (page) => {
    console.log("SignIn Youtube with UserName and Password")
    const [user, pass] = await fetchCredentials()

    await page.goto(youtubelUrl)
    await delay(timeStep)

    await page.click('tp-yt-paper-button.style-scope.ytd-button-renderer.style-suggestive.size-small')
    await delay(timeStep)

    await page.type('input#identifierId', user)
    await page.click('div#identifierNext')
    await delay(timeStep)

    await page.type('input[type="password"]', pass)
    await page.click('div#passwordNext')
    await page.waitForNavigation()

    const cookie = await page.cookies()

    return new Promise((resolve, reject) => {
        writeFile(
            pathFileCookiesYoutube,
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

const signInYoutubeWithCookies = async (page) => {
    console.log("SignIn Youtube with Cookies")
    const cookies = await fetchCookies(pathFileCookiesYoutube)
    let cookieObjs = JSON.parse(cookies)

    for (let c of cookieObjs) {
        await page.setCookie(c)
    }

    try {
        await page.goto(youtubelUrl)
    } catch (err) {
        console.log(err)
        // cookie probably expired and Gmail returned a 401
        await signInYoutubeWithUsernamePassword(page)
    }
}

const createPlaylist = async (page) => {
    console.log("CreatePlaylist Youtube")
    await page.goto(youtubeStudioUrl)
    await delay(timeStep)

    await page.click('#menu-paper-icon-item-2')
    await delay(timeStep)

    await page.click('#new-playlist-button > div')
    await delay(timeStep)

    await page.type('#create-playlist-form > ytcp-form-textarea > div > textarea', playlistTitle)
    await delay(timeStep)

    await page.type("ytcp-button#create-button")
    await delay(timeStep)
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

    // console.log("Start Login")
    // if (!existsSync(`${baseDir}cookie.txt`)) {
    //     await signInWithUsernamePassword(page)
    // } else {
    //     await signInWithCookies(page)
    // }
    // console.log("Logged")

    // await readEmail(page, browser)
    // console.log("Readed")

    // await sendEmail(page)
    // console.log('Sent Mail')

    // await browser.close()
    // process.exit()

    console.log("Start Login Youtube")
    if (!existsSync(pathFileCookiesYoutube)) {
        await signInYoutubeWithUsernamePassword(page)
    } else {
        await signInYoutubeWithCookies(page)
    }
    console.log("Logged Youtube")

    await createPlaylist(page)

})()