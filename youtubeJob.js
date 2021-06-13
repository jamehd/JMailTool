// Library
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Global Variable
const youtubeStudioUrl = 'https://studio.youtube.com'
const playlistTitle = "My Playlist 2"

// Job
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

    await createPlaylist(page)

})()