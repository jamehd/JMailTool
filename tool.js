// Library
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const login = require('./login');
const delayTime = require('./delayTime')

// Global Variable
const googleKeyWord = 'vi gia re';
const youtubeKeyWord = 'con gio la';
const news = 'https://tinmoi.vn/dich-virus-corona-dich-covid-19-e872.html';
const video = 'https://www.youtube.com/watch?v=i6p90R-koeY';
// Job
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 500);
        });
    });
}

const searchGoogle = async (page) => {
    console.log('Start Search');
    await login.loginGoogle(page);
    await page.click('input[type="text"]');
    await delayTime.delayStep();
    await page.type('input[type="text"]', googleKeyWord);
    await delayTime.delayStep();
    await page.keyboard.press('Enter');
    await delayTime.delayStep();

    let searchResult = await page.evaluate(() => {
        let searchResult = [];
        [...document.querySelectorAll("div.g")].map(e => {
            searchResult.push(e.querySelector('a').getAttribute('href'))
        });

        return searchResult;
    })
    console.log(searchResult);
    console.log('End Search');
};

const readNews = async (page) => {
    console.log('Start Read News');
    await page.goto(news);
    await autoScroll(page);
    console.log('End Read News');
};

const searchYoutube = async (page) => {
    console.log('Start Search Youtube');
    await login.loginYoutube(page);
    await delayTime.delayStep();
    await page.type('input#search', youtubeKeyWord);
    await delayTime.delayStep();
    await page.keyboard.press('Enter');
    await delayTime.delayStep();

    let searchResult = await page.evaluate(() => {
        let searchResult = [];
        [...document.querySelectorAll("ytd-video-renderer")].map(e => {
            searchResult.push(e.querySelector('a#video-title').getAttribute('title'))
        });

        return searchResult;
    })
    console.log(searchResult);

    console.log('End Search Youtube');
}

const watchVideo = async (page) => {
    console.log('Start watchVideo');
    await page.goto(video);
    await delayTime.delayStep();
    await page.click("#movie_player > div.ytp-cued-thumbnail-overlay > button");
    await delayTime.delay(1000000);
    console.log('End watchVideo');
};

// Main
const main = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--window-size=1600,900',
            '--window-position=0,0',
            "--disable-notifications"
        ]
    });
    const page = await browser.newPage();

    await searchGoogle(page);

    // await readNews(page);

    await searchYoutube(page);

    // await watchVideo(page);

    await browser.close();
    // process.exit();
};

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');
const topic = 'JOB';
const api = require('./api');

client.on('connect', () => {
    client.subscribe(topic);
})

client.on('message', async (topic, message) => {
    try {
        message = message.toString();
        console.log(message);
        let obj = JSON.parse(message);
        if (obj.Action === 'StartGmailJob') {
            let jobId = obj.Data.JobId;
            api.receivedJob(jobId);
            await delayTime.delay(3000);
            try {
                await main();
                api.finishedJobSuccess(jobId);
            } catch (error) {
                api.finishedJobFailed(jobId);
            }
        }
    } catch (error) {
        console.log(error)
    }
});
