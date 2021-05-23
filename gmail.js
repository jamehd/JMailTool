const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

const baseDir = './data/'

const { readFile, writeFile, existsSync } = require('fs')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

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

const signInAndGrabCookies = async page => {
    const [user, pass] = await fetchCredentials()

    await page.goto('https://mail.google.com')

    await delay(1500)
    await page.type('input#identifierId', user)
    await page.click('div#identifierNext')

    await delay(1500)
    await page.type('input[type="password"]', pass)
    await page.click('div#passwordNext')

    await delay(8000)
    // await page.evaluate(() => {
    //     [...document.getElementsByTagName('li')].filter(i => i.textContent.indexOf('52') != -1)[0].firstChild.click()
    // })

    // await delay(1000)
    // readline.question('OTP: ', async otp => {
    //     await page.type('input#idvPin', otp)
    //     await page.click('div#idvPreregisteredPhoneNext')
    // })

    // await delayNavigation()
    // await delay(25000)

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

const fetchEmail = (page, browser) => {
    console.log('Fetch Email');
    readFile(`${baseDir}cookie.txt`, 'utf8', async (err, cookie) => {
        if (err) {
            console.log('Error reading cookie from cookie.txt, aborting...')
        } else {
            let cookieObjs = JSON.parse(cookie)

            for (let c of cookieObjs) {
                await page.setCookie(c)
            }

            try {
                const response = await page.goto('https://mail.google.com/mail/u/0/#inbox')
            } catch (err) {
                console.log(err)
                // cookie probably expired and Gmail returned a 401
                await signInAndGrabCookies(page)
            }

            let mails = await page.evaluate(() => {
                
                // let doc = new DOMParser().parseFromString(document.body.innerHTML.match(/<feed.*feed>/gi)[0], 'text/xml')

                let mailString = ''

                    ;[...document.querySelectorAll('entry')].map(e => {
                        mailString += new Date(e.querySelector('issued').textContent).toLocaleString() + '\n'
                        mailString += 'From: '
                        mailString += e.querySelector('author').querySelector('name').textContent
                        mailString += ' (' + e.querySelector('author').querySelector('email').textContent + ')\n'
                        mailString += 'Subject: ' + e.querySelector('title').textContent + '\n\n'
                        mailString += e.querySelector('summary').textContent + '\n\n'
                        mailString += '——\n\n'
                    })

                return mailString
            })

            writeFile(
                `${baseDir}mails.txt`,
                mails,
                'utf8',
                async (err, status) => {
                    if (err) {
                        writeFile(`${baseDir}error.txt`, err, 'utf8', () => { })
                    } else {
                        await browser.close()
                        process.exit()
                    }
                }
            )
        }
    })
};

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=800,600', '--window-position=320,150']
    })

    const page = await browser.newPage()

    if (!existsSync(`${baseDir}cookie.txt`)) {
        await signInAndGrabCookies(page)
    }

    fetchEmail(page, browser);

})()