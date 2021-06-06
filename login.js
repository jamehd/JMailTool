const { readFile, writeFile, existsSync } = require('fs');
const delayTime = require('./delayTime');

const baseDir = './data/';
const pathFileUserInfo = `${baseDir}user-credentials.txt`;
const pathFileCookiesGmail = `${baseDir}cookieGmail.txt`;
const pathFileCookiesGoogle = `${baseDir}cookieGoogle.txt`;
const pathFileCookiesYoutube = `${baseDir}cookieYoutube.txt`;

const gmailUrl = 'https://mail.google.com';
const googleUrl = 'https://google.com';
const youtubeUrl = 'https://youtube.com';

const gmailCheckExpireCookieUrl = 'https://mail.google.com/mail/u/0/feed/atom';
const googleCheckExpireCookieUrl = googleUrl;
const youtubeCheckExpireCookieUrl = youtubeUrl;

const config = {
    "gmail": {
        "pathCookie": pathFileCookiesGmail,
        "pathExpireCookie": gmailCheckExpireCookieUrl
    },
    "google": {
        "pathCookie": pathFileCookiesGoogle,
        "pathExpireCookie": googleCheckExpireCookieUrl
    },
    "youtube": {
        "pathCookie": pathFileCookiesYoutube,
        "pathExpireCookie": youtubeCheckExpireCookieUrl
    }
};

const fetchCredentials = () => {
    return new Promise((resolve, reject) => {
        readFile(pathFileUserInfo, 'utf8', (err, content) => {
            if (err)
                reject('Error reading user credentials from file.');

            resolve(content.split('\n'));
        });
    })
}

const fetchCookies = (file) => {
    return new Promise((resolve, reject) => {
        readFile(file, 'utf8', (err, content) => {
            if (err)
                reject('Error reading Cookies from file.');

            resolve(content);
        });
    })
}


const signInWithUsernamePassword = async (page, mode) => {
    let pathCookies = config[mode]["pathCookie"];
    console.log("SignIn with UserName and Password: ", pathCookies);
    const [user, pass] = await fetchCredentials();

    await page.type('input#identifierId', user);
    await page.click('div#identifierNext');
    await delayTime.delayStep();

    await page.type('input[type="password"]', pass);
    await page.click('div#passwordNext');
    await page.waitForNavigation();

    // await delayTime.delayStep()
    // await page.evaluate(() => {
    //     [...document.getElementsByTagName('li')].filter(i => i.textContent.indexOf('52') != -1)[0].firstChild.click()
    // })

    // await delayTime.delayStep()
    // readline.question('OTP: ', async otp => {
    //     await page.type('input#idvPin', otp)
    //     await page.click('div#idvPreregisteredPhoneNext')
    // })

    // await page.waitForNavigation()
    // await delayTime.delayStep()

    const cookie = await page.cookies();

    return new Promise((resolve, reject) => {
        writeFile(
            pathCookies,
            JSON.stringify(cookie),
            'utf8',
            (err, status) => {
                if (err)
                    reject(err);
                else
                    resolve(status);
            }
        )
    })
}

const signInWithCookies = async (page, mode) => {
    let pathCookies = config[mode]["pathCookie"];
    let pathExpireCookies = config[mode]["pathExpireCookie"];
    console.log("SignIn with Cookies: ", pathCookies);
    const cookies = await fetchCookies(pathCookies);
    let cookieObjs = JSON.parse(cookies);

    for (let c of cookieObjs) {
        await page.setCookie(c);
    }

    try {
        await page.goto(pathExpireCookies);
    } catch (err) {
        console.log(err);
        // cookie probably expired and Gmail returned a 401
        await signInWithUsernamePassword(page);
    }
}

const loginGmail = async (page) => {
    console.log("Start Login");
    if (!existsSync(pathFileCookiesGmail)) {
        await page.goto(gmailUrl);
        await delayTime.delayStep();
        await signInWithUsernamePassword(page, 'gmail');
    } else {
        await signInWithCookies(page, 'gmail');
    }
    console.log("Logged");
}

const loginGoogle = async (page) => {
    console.log("Start Login");
    if (!existsSync(pathFileCookiesGoogle)) {
        await page.goto(googleUrl);
        await delayTime.delayStep();
        await page.click("a.gb_3.gb_4.gb_9d.gb_3c");
        await delayTime.delayStep();
        await signInWithUsernamePassword(page, 'google');
    } else {
        await signInWithCookies(page, 'google');
    }
    console.log("Logged");
}

const loginYoutube = async (page) => {
    console.log("Start Login");
    if (!existsSync(pathFileCookiesYoutube)) {
        await page.goto(youtubeUrl);
        await delayTime.delayStep();
        await page.click("#buttons > ytd-button-renderer > a");
        await delayTime.delayStep();
        await signInWithUsernamePassword(page, 'youtube');
    } else {
        await signInWithCookies(page, 'youtube');
    }
    console.log("Logged");
}

module.exports = {
    loginGmail,
    loginGoogle,
    loginYoutube
}