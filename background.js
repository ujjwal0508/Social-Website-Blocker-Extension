let allBlockingUrls = [];
const TIME_TO_BLOCK_IN_SECONDS = 10;

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {

    console.log(message);
    if (message.url !== undefined) {

        let dataObj = {
            date: getCurrentDate(),
            timeSpent: 0
        };

        await setDataInStorage(message.url, dataObj);
        allBlockingUrls.push(message.url);
    }
});

async function foo() {

    await clearStorage();
    console.log("Starting task");


    allBlockingUrls = await getAllKeys();

    (async function pollForCurrentTab() {

        // your code logic here

        let tab = await getCurrentTab();

        if (tab !== undefined) {

            try {
                let url = getHostName(tab.url);
                let urlIdx = allBlockingUrls.indexOf(url);
                // console.log(allBlockingUrls);
                if (urlIdx !== -1) {

                    console.log('found a blocking url')
                    let url = allBlockingUrls[urlIdx];

                    let result = await getDataFromStorage(url);

                    shouldBeBlocked(result, tab);

                    let resultDate = Date.parse(result.date);
                    resultDate = new Date(resultDate);

                    let currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);

                    await setBadgeText((TIME_TO_BLOCK_IN_SECONDS - 1 - result.timeSpent)     + '');
                    if (resultDate.getTime() === currentDate.getTime()) {
                        result.timeSpent++;
                        shouldBeBlocked(result, tab);
                    } else {
                        result.date = getCurrentDate();
                        result.timeSpent = 1;
                    }
                    await setDataInStorage(url, result);

                } else {
                    await setBadgeText('');
                }
            } catch (err) {
                console.log(err);
            }
        }

        setTimeout(pollForCurrentTab, 1000);

    })();

}

function setBadgeText(value) {
    return new Promise((resolve, reject) => {
        chrome.browserAction.setBadgeText({ text: value }, function () {
            resolve();
        })
    })
}

function getCurrentDate() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toJSON();

}

function getAllKeys() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, function (items) {
            let allKeys = Object.keys(items);
            resolve(allKeys);
        });
    })
}

function getHostName(url) {

    if (url === undefined)
        throw 'url is undefined';

    var hostname = (new URL(url)).hostname;
    return hostname;
}

async function shouldBeBlocked(result, tab) {

    let resultDate = Date.parse(result.date);
    resultDate = new Date(resultDate);
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (resultDate.getTime() === currentDate.getTime()) {
        if (result.timeSpent >= TIME_TO_BLOCK_IN_SECONDS) {
            console.log('code yha alert pe aaya')
            alert("Kaam krle loser");

            try {
                await closeTab(tab.id);
            } catch (err) {
                console.log(err);
                console.log('tab not closed');
            }
        }
    }
}

function closeTab(tabId) {

    return new Promise((resolve, reject) => {
        chrome.tabs.get(tabId, function () {

            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError.message);
            } else {
                // Tab exists
                chrome.tabs.remove(tabId, function () {
                    resolve();
                });
            }
        })


    })
}

function setDataInStorage(url, dataObject) {
    console.log(dataObject);

    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [url]: dataObject }, function () {

            resolve();
        });
    })
}

function getDataFromStorage(url) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([url], function (result) {
            resolve(result[url])
        })
    })
}

function getCurrentTab() {

    return new Promise((resolve, reject) => {
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabArray) {

                resolve(tabArray[0]);
            })
    })
}
// testing ke liye kre hai 
function clearStorage() {
    return new Promise((resolve, reject) => {

        chrome.storage.sync.clear(function () {
            resolve()
        });
    })
}

foo();

