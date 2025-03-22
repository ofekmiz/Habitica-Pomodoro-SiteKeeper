// chrome.extension.getBackgroundPage() has issues in firefox 
//-------- background.js communication (with firefox support) -------//
var browser = browser || chrome; //for firefox support (browser.runtime instead of chrome.runtime)
var Vars = {};
var Consts = {};

var timerPort = chrome.runtime.connect({ name: "timer" });
timerPort.onMessage.addListener(function (response) {
    if (response.complete) {
        Vars = response.vars;
    }
});

/**
 * @param {*} functionName String
 * @param {*} args array with the function args
 */
async function runBackgroundFunction(functionName, args) {
    try {
        //FireFox
        if (BROWSER === "Mozilla Firefox") {
            var response = await browser.runtime.sendMessage({ sender: "popup", msg: "run_function", functionName: functionName, args: args });
            return response.result;
        }
        //Chromium
        else {
            var response = await sendMessagePromise({ sender: "popup", msg: "run_function", functionName: functionName, args: args });
            return response.result;
        }
    }
    catch (e) {
        console.log(e)
        return e;
    }
}

async function getBackgroundData() {
    try {
        //FireFox
        if (BROWSER === "Mozilla Firefox") {
            var response = await browser.runtime.sendMessage({ sender: "popup", msg: "get_data" });
            Vars = response.vars;
            Consts = response.consts;

        }
        //Chromium
        else {
            var response = await sendMessagePromise({ sender: "popup", msg: "get_data" });
            Vars = response.vars;
            Consts = response.consts;
        }
    } catch (e) {
        console.log(e)
        return e;
    }
}

async function updateBackgroundData() {
    try {
        //FireFox
        if (BROWSER === "Mozilla Firefox") {
            await browser.runtime.sendMessage({ sender: "popup", msg: "set_data", data: { vars: Vars } });
        }
        //Chromium
        else {

            await sendMessagePromise({ sender: "popup", msg: "set_data", data: { vars: Vars } });

        }
    } catch (e) {
        console.log(e)
        return e;
    }
}

/**
 * Promise wrapper for chrome.tabs.sendMessage (not returning promise bug in chrome)
 * @param item
 * @returns {Promise<any>}
 */
function sendMessagePromise(item) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(item, (response) => {
            console.log(item);
            console.log(response);
            if (response.complete) {
                resolve(response);
            } else {
                reject('Something wrong');
            }
        });
    });
}


//-------- background.js communication [END]-------------------------------