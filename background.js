let allBlockingUrls = [];

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

            let url = getHostName(tab.url);
            let urlIdx = allBlockingUrls.indexOf(url);
            if (urlIdx !== -1) {

                console.log('found a blocking url')
                let url = allBlockingUrls[urlIdx];

                let result = await getDataFromStorage(url);

                shouldBeBlocked(result, tab);

                let resultDate = Date.parse(result.date);
                resultDate = new Date(resultDate);

                let currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                await setBadgeText((50 - 1 - result.timeSpent) + '');
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
    var hostname = (new URL(url)).hostname;
    return hostname;
}

async function shouldBeBlocked(result, tab) {

    let resultDate = Date.parse(result.date);
    resultDate = new Date(resultDate);
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (resultDate.getTime() === currentDate.getTime()) {
        if (result.timeSpent >= 50) {
            alert("Kaam krle loser");
            await closeTab(tab.id);
        }
    }
}

function closeTab(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.remove(tabId, function () {
            resolve();
        });
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

function clearStorage() {
    return new Promise((resolve, reject) => {

        chrome.storage.sync.clear(function () {
            resolve()
        });
    })
}

foo();

