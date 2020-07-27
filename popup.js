async function foo() {

    let allUrls = await getAllKeys();


    for (let i = 0; i < allUrls.length; i++) {
        let url = allUrls[i];
        allUrlToList(url);
    }

    document.getElementById('add-url').onclick = async function () {
        let urlToBlock = document.getElementById('url').value;

        if (urlToBlock !== undefined) {

            let message = {
                url: urlToBlock
            }
            await sendMessageToBackGround(message);
            allUrlToList(urlToBlock);

            document.getElementById('url').value = '';
        }
    }

    function allUrlToList(url) {
        var ul = document.getElementById("block-list");
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(url));
        ul.appendChild(li);
    }

    function sendMessageToBackGround(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, function () {
                resolve();
            });

        })
    }

    function getAllKeys() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(null, function (items) {
                let allKeys = Object.keys(items);
                resolve(allKeys);
            });
        })
    }
}

foo();