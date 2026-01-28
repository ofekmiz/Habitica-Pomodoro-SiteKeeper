
"use strict";

// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

console.log("This prints to the console of the service worker (background script)")


// Importing and using functionality from external files is also possible.
// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.
importScripts('library/habiticaAPI.js');
importScripts('library/utility.js')

//------synced variables with popup.js , includes only data (not pointers nor functions)------//
var Consts = {
    xClientHeader: "5a8238ab-1819-4f7f-a750-f23264719a2d-HabiticaPomodoroSiteKeeper-v2",
    serverUrl: 'https://habitica.com/api/v3/',
    serverPathUser: 'user/',
    serverPathTask: 'tasks/sitepass',
    serverPathPomodoroHabit: 'tasks/sitepassPomodoro',
    serverPathPomodoroSetHabit: 'tasks/sitepassPomodoroSet',
    serverPathUserTasks: 'tasks/user',
    serverPathUserHabits: 'tasks/user?type=habits',
    RewardTemplate: {
        text: "SitePass",
        value: 0,
        notes: "Reward utilized by Habitica SiteKeeper." +
            " Changes value depending on last accessed website.",
        alias: "sitepass",
        type: "reward"
    },
    PomodoroHabitTemplate: {
        text: "🍅🍅 Pomodoro",
        type: "habit",
        alias: "sitepassPomodoro",
        notes: "Habit utilized by Habitica SiteKeeper. " +
            "Change the difficulty manualy according to your needs.",
        priority: 1
    },
    PomodoroSetHabitTemplate: {
        text: "🍅🍅 Pomodoro Combo! 🍅🍅",
        type: "habit",
        alias: "sitepassPomodoroSet",
        notes: "Habit utilized by Habitica SiteKeeper. " +
            "Change the difficulty manualy according to your needs.",
        down: false,
        priority: 1.5
    },
    userDataKey: "USER_DATA",
    HistogramDataKey: "Histogram",
    NotificationId: "sitepass_notification",
    Sounds: ["Sound1.mp3", "Sound2.mp3", "Sound3.mp3", "Sound4.mp3", "Sound5.mp3", "Sound6.mp3", "Sound7.mp3", "Sound8.mp3", "Sound9.mp3"],
    AmbientSounds: ["Ambient Clock.mp3", "Ambient Rain.mp3", "Ambient Crickets.mp3", "Ambient Birds.mp3"],
    POMODORO_DONE_TEXT: "GOOD!"
};

var Vars = {
    RewardTask: Consts.RewardTemplate,
    PomodoroTaskId: null,
    PomodoroSetTaskId: null,
    PomodoroTaskCustomList: [],
    Histogram: {}, //Histogram example: {2020-29-10:{pomodoros:3,minutes:75,weekday:Thursday},2020-30-10:{pomodoros:2,minutes:50,weekday:Friday}}
    Monies: 0,
    Exp: 0,
    Hp: 0,
    UserData: new UserSettings(),
    ServerResponse: 0,
    Timer: "00:00",
    TimerValue: 0, //in seconds
    TimerRunnig: false,
    TimerFreeze: false, //(Pause)
    onBreak: false,
    onBreakExtension: false,
    PomoSetCounter: 0,
    onManualTakeBreak: false,
    versionUpdate: false
};
// -------------------------background variables----------------------------- //
var currentAmbientAudio = null; //current playing ambient sound
const BROWSER = getBrowser();
const PageOverlayCSS = "foreground/pageOverlay.css";
const PageOverlayJS = "foreground/pageOverlay.js";
// -------------------------------------------------------------------------- //

function UserSettings(copyFrom) {
    //Get User Setting from copyFrom , or set default user settings
    this.BlockedSites = copyFrom ? copyFrom.BlockedSites : {}; //array of site objects {hostname, cost, passExpiry} or false
    this.Whitelist = copyFrom ? copyFrom.Whitelist : "";
    this.Credentials = copyFrom ? copyFrom.Credentials : {
        uid: "",
        apiToken: ""
    };
    this.PomoDurationMins = copyFrom ? copyFrom.PomoDurationMins : 25;
    this.PomoHabitPlus = copyFrom ? copyFrom.PomoHabitPlus : false; //Hit + on habit when pomodoro done
    this.PomoHabitMinus = copyFrom ? copyFrom.PomoHabitMinus : false; //Hit - on habit when pomodoro is interupted
    this.BreakDuration = copyFrom ? copyFrom.BreakDuration : 5;
    this.ManualBreak = copyFrom ? copyFrom.ManualBreak : true;
    this.BreakFreePass = copyFrom ? copyFrom.BreakFreePass : false;
    this.BreakExtention = copyFrom ? copyFrom.BreakExtention : 2;
    this.BreakExtentionFails = copyFrom ? copyFrom.BreakExtentionFails : false;
    this.BreakExtentionNotify = copyFrom ? copyFrom.BreakExtentionNotify : false;
    this.PomoSetNum = copyFrom ? copyFrom.PomoSetNum : 4;
    this.PomoSetHabitPlus = copyFrom ? copyFrom.PomoSetHabitPlus : false;
    this.LongBreakDuration = copyFrom ? copyFrom.LongBreakDuration : 30;
    this.LongBreakNotify = copyFrom ? copyFrom.LongBreakNotify : false;
    this.VacationMode = copyFrom ? copyFrom.VacationMode : false;
    this.FreePassTimes = copyFrom ? copyFrom.FreePassTimes : [];
    this.CustomPomodoroTask = copyFrom ? copyFrom.CustomPomodoroTask : false;
    this.CustomSetTask = copyFrom ? copyFrom.CustomSetTask : false;
    this.PomodoroSetTaskId = copyFrom ? copyFrom.PomodoroSetTaskId : null;
    this.PomodoroTaskId = copyFrom ? copyFrom.PomodoroTaskId : null;
    this.HideEdit = copyFrom ? copyFrom.HideEdit : false;
    this.ConnectHabitica = copyFrom ? copyFrom.ConnectHabitica : true;
    this.MuteBlockedSites = copyFrom ? copyFrom.MuteBlockedSites : true;
    this.TranspartOverlay = copyFrom ? copyFrom.TranspartOverlay : true;
    this.TickSound = copyFrom ? copyFrom.TickSound : false;
    this.showSkipToBreak = copyFrom ? copyFrom.showSkipToBreak : false;
    this.showFreeze = copyFrom ? copyFrom.showFreeze : false;
    this.pomodoroEndSound = copyFrom ? copyFrom.pomodoroEndSound : "None";
    this.breakEndSound = copyFrom ? copyFrom.breakEndSound : "None";
    this.ambientSound = copyFrom ? copyFrom.ambientSound : "None";
    this.pomodoroEndSoundVolume = copyFrom ? copyFrom.pomodoroEndSoundVolume : 0.5;
    this.breakEndSoundVolume = copyFrom ? copyFrom.breakEndSoundVolume : 0.5;
    this.ambientSoundVolume = copyFrom ? copyFrom.ambientSoundVolume : 0.5;
    this.ResetPomoAfterBreak = copyFrom ? copyFrom.ResetPomoAfterBreak : false;
    this.QuickBreak = copyFrom ? copyFrom.QuickBreak : 0;
    this.developerServerUrl = copyFrom ? copyFrom.developerServerUrl : "";
}

var BlockedSite = function (hostname, cost, passDuration, passExpiry) {
    this.hostname = hostname;
    this.cost = cost;
    this.passExpiry = passExpiry;
    this.passDuration = passDuration;
}

//returns BlockedSite object or fals if hostname is not in block list
function GetBlockedSite(hostname) {
    return Vars.UserData.BlockedSites[hostname];
}

function GetSiteCost(site) {
    var cost = site.cost ? site.cost : 0;
    return cost;
}
function GetSitePassDuration(site) {
    if(!site) return 30;
    var duration = site.passDuration ? site.passDuration : 30;
    return duration;
}

function GetSiteHostName(site) {
    return site.hostname;
}

function GetSitePassExpiry(site) {
    return site.passExpiry;
}

function isSitePassExpired(site) {
    return site.passExpiry <= Date.now();
}

// Safely parse a URL string and return a URL object only for http(s) URLs
function parseUrlSafe(urlString) {
    try {
        if (!urlString) return null;
        const u = new URL(urlString);
        if (u.protocol === 'http:' || u.protocol === 'https:') return u;
        return null;
    } catch (e) {
        return null;
    }
}

function RemoveBlockedSite(site) {
    if (site.hostname) {
        delete Vars.UserData.BlockedSites[site.hostname];
        console.log("BG", Vars.UserData.BlockedSites);
    } else
        delete Vars.UserData.BlockedSites[site];
};

function AddBlockedSite(hostname, cost, passDuration, passExpiry) {
    Vars.UserData.BlockedSites[hostname] = new BlockedSite(hostname, cost, passDuration, passExpiry);
    return Vars.UserData.BlockedSites[hostname];
}

// Runs on version update / Install
chrome.runtime.onInstalled.addListener(function () {
    Vars.versionUpdate = true;
});

// Checks the hostname and block it if the user dosent have enough gold or pomodoro is active.
// Returns Json object:
// if site not blocked: {block:false}
// if site is blocked and affordable: {block:true, payToPass: true, cost:string , hostname:string ,passTime:string}
// if site is blocked and not affordable {block:true, payToPass: false, hostname:string}
function checkBlockedUrl(siteUrl) {

    var hostname = siteUrl.hostname;

    //free pass during break session, or Vacation Mode and not in pomodoro session
    var freePass = ((Vars.UserData.BreakFreePass && Vars.onBreak && Vars.TimerRunnig) || ((Vars.UserData.VacationMode || isFreePassTimeNow()) && (!Vars.TimerRunnig || Vars.onBreak)));
    var site = GetBlockedSite(hostname);
    var pomodoro = Vars.TimerRunnig && !Vars.onBreak;

    var unblocked = { block: false };

    if (!site || freePass) {
        return unblocked;
    }

    if (Vars.UserData.ConnectHabitica && site && !pomodoro) {
        if (site.passExpiry > Date.now() || site.cost == 0) {
            return unblocked;
        }
    }

    if (!Vars.UserData.ConnectHabitica && !pomodoro) {
        return unblocked;
    }

    if (isInWhiteList(siteUrl)) {
        return unblocked;
    }

    if (site.cost > Vars.Monies || !Vars.UserData.ConnectHabitica) {
        return {
            block: true,
            payToPass: false,
            hostname: hostname
        } //block website - can't afford
    } else return {
        block: true,
        payToPass: true,
        cost: site.cost.toFixed(2),
        hostname: hostname,
        passTime: GetSitePassDuration(site).toFixed(2)
    } //block website - pay to pass
}

function isInWhiteList(siteUrl) {
    var whitelist = Vars.UserData.Whitelist.split('\n');
    for (var i = 0; i < whitelist.length; i++) {
        var line = whitelist[i];
        if (line[0] === '/' && line[line.length - 1] === '/') {
            var re = new RegExp(line.substring(1, line.length - 1));
            if (re.test(siteUrl.toString())) {
                return true;
            }
        }
        if (line === siteUrl.toString()) {
            return true;
        }
    }
    return false;
}

const callbackTabActive = function (details) {
    chrome.tabs.get(details.tabId, function (tab) {
        chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: [PageOverlayCSS]
        });

        mainSiteBlockFunction(tab);

        // Pass Expiry time badge
        if (!Vars.TimerRunnig) {
            const siteUrl = parseUrlSafe(tab.url);
            if (siteUrl) {
                const site = GetBlockedSite(siteUrl.hostname);
                showPayToPassTimerBadge(site);
            } else {
                showPayToPassTimerBadge(null);
            }
        }
    });
};

function callbackTabUpdate(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        // Insert CSS
        chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: [PageOverlayCSS]
        });

        mainSiteBlockFunction(tab);

        // Pass Expiry time badge
        if (!Vars.TimerRunnig) {
            const siteUrl = parseUrlSafe(tab.url);
            if (siteUrl) {
                const site = GetBlockedSite(siteUrl.hostname);
                showPayToPassTimerBadge(site);
            } else {
                showPayToPassTimerBadge(null);
            }
        }
    });
}


function mainSiteBlockFunction(tab) {
    if (!Vars.TimerRunnig || Vars.onBreak) {
        unblockSiteOverlay(tab);
        var siteUrl = parseUrlSafe(tab.url);
        if (!siteUrl) return; // nothing to do for non-http(s) tabs
        var checkSite = checkBlockedUrl(siteUrl);

        //block - Pay to pass or can't afford page
        if (checkSite.block == true) {

            //pay to pass 
            if (checkSite.payToPass == true) {
                payToPassOverlay(tab, checkSite);
            }

            //can't afford
            else {
                cantAffordOverlay(tab, checkSite);
            }
            return;
        }

        //Check if the user is not on the same site for longer than passDuration
        var passDurationMiliSec = GetSitePassDuration(GetBlockedSite(siteUrl.hostname)) * 60 * 1000
        setTimeout(function (arg) {
            mainSiteBlockFunction(arg);
        }, passDurationMiliSec, tab);

        muteBlockedtabs();
    }

}


var passInterval;
//Shows the time until the paid site is blocked again
function showPayToPassTimerBadge(site) {

    clearInterval(passInterval);

    passInterval = setInterval(function () {
        passIntervalFuction();
    }, 1000);

    var passIntervalFuction = function () {
        if (site && !Vars.TimerRunnig) {
            var remainingTime = getSitePassRemainingTime(site);
            if (remainingTime) {
                chrome.action.setBadgeBackgroundColor({
                    color: "#F18E02"
                });
                var timeString = BROWSER === "Mozilla Firefox" ? shortTimeString(remainingTime) : remainingTime;
                chrome.action.setBadgeText({
                    text: timeString
                });
            } else {
                if (Vars.Timer != Consts.POMODORO_DONE_TEXT) {
                    chrome.action.setBadgeText({
                        text: ''
                    });
                }
                clearInterval(passInterval);
            }
        } else {
            if (Vars.Timer != Consts.POMODORO_DONE_TEXT) {
                chrome.action.setBadgeText({
                    text: ''
                });
            }
            clearInterval(passInterval);
        }
    }


}

//Create "Pay X coins To Visit" site overlay
function payToPassOverlay(tab, siteData) {
    const opacity = Vars.UserData.TranspartOverlay ? "0.85" : "1";
    const imageURLPayToPass = chrome.runtime.getURL("/img/siteKeeper2.png");

    // Inject CSS using a <style> tag (since dynamic CSS strings aren't supported directly)
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (imageURL, opacity) => {
            const style = document.createElement('style');
            style.textContent = `
                .payToPass:after { 
                    background-image: url("${imageURL}"); 
                }
                .payToPass::before {
                    background-color: rgba(0,0,0,${opacity}) !important;
                }
            `;
            document.head.appendChild(style);
        },
        args: [imageURLPayToPass, opacity]
    });

    // Inject external JS file
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [PageOverlayJS]
    }, () => {
        // After JS loads, run inline code to update DOM
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (hostname, cost, passTime) => {
                document.getElementById("payToPass_btn").style.display = 'block';
                const overlay = document.getElementById("SitekeeperOverlay");
                overlay.style.display = 'block';
                overlay.setAttribute(
                    "data-html",
                    `You're trying to Access ${hostname}\n Pay ${cost} Gold to access for ${passTime} Minutes`
                );
                overlay.className = "payToPass";
            },
            args: [siteData.hostname, siteData.cost, siteData.passTime]
        });
    });
}

//Create "Cant Afford To Visit" site overlay
function cantAffordOverlay(tab, siteData) {
    const opacity = Vars.UserData.TranspartOverlay ? "0.85" : "1";
    const imageURLNoPass = chrome.runtime.getURL("/img/siteKeeper3.png");

    // Inject CSS via <style> tag
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (imageURL, opacity) => {
            const style = document.createElement('style');
            style.textContent = `
                .noPass:after {
                    background-image: url("${imageURL}");
                }
                .noPass::before {
                    background-color: rgba(0, 0, 0, ${opacity});
                }
            `;
            document.head.appendChild(style);
        },
        args: [imageURLNoPass, opacity]
    });

    // Inject external JS file
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [PageOverlayJS]
    }, () => {
        // Inject inline DOM update script
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (hostname) => {
                const overlay = document.getElementById("SitekeeperOverlay");
                overlay.style.display = 'block';
                document.getElementById("payToPass_btn").style.display = 'none';
                overlay.setAttribute(
                    "data-html",
                    `You can't afford to visit ${hostname}\nYou shall not pass!`
                );
                overlay.className = "noPass";
            },
            args: [siteData.hostname]
        });
    });
}


//Switching and updating tabs
chrome.tabs.onActivated.addListener(callbackTabActive);
chrome.tabs.onUpdated.addListener(function (tabid, changeinfo, tab) {
    var url = tab.url;
    if (url !== undefined && changeinfo.status == "complete") {
        callbackTabUpdate(tabid);
    }
});

// ReSharper disable once PossiblyUnassignedProperty
chrome.storage.sync.get(Consts.userDataKey, function (result) {
    if (result[Consts.userDataKey]) {
        Vars.UserData = new UserSettings(result[Consts.userDataKey]);
        FetchHabiticaData();
        // Ensure periodic validation alarm exists and run an initial validation
        try {
            if (chrome.alarms && typeof chrome.alarms.create === 'function') {
                chrome.alarms.create('pomodoro_validate', { periodInMinutes: 360 });
            } else {
                console.warn('chrome.alarms API not available; skipping alarm creation');
            }
        } catch (e) {
            console.warn('Failed to create pomodoro_validate alarm', e);
        }
        // Run a validation pass immediately (don't block storage callback)
        ValidateStoredPomodoroIds();
    }
});

// Periodic alarm listener to validate stored Pomodoro IDs
chrome.alarms && chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm && alarm.name === 'pomodoro_validate') {
        ValidateStoredPomodoroIds();
    }
});


//Set Histogram from storage
chrome.storage.sync.get(Consts.HistogramDataKey, function (result) {
    if (result[Consts.HistogramDataKey]) {
        Vars.Histogram = result[Consts.HistogramDataKey];
    }
});

//Mute all tabs with blocked sites, unmute other tabs.
function muteBlockedtabs() {
    var pomodoro = Vars.TimerRunnig && !Vars.onBreak;
    if (Vars.UserData.MuteBlockedSites) {
        chrome.tabs.query({
            currentWindow: true
        }, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                const parsed = parseUrlSafe(tabs[i].url);
                if (!parsed) continue;
                var hostname = parsed.hostname;
                var site = GetBlockedSite(hostname);
                if (!site) {
                    chrome.tabs.update(tabs[i].id, {
                        "muted": false
                    });
                }
                else if (isInWhiteList(tabs[i].url)) {
                    chrome.tabs.update(tabs[i].id, {
                        "muted": false
                    });
                }
                else if (checkBlockedUrl(site).block || pomodoro) {
                    chrome.tabs.update(tabs[i].id, {
                        "muted": true
                    });
                } else {
                    chrome.tabs.update(tabs[i].id, {
                        "muted": false
                    });
                }
            }
        });
    }
}

// ----- Habitica Api general call ----- //
async function callAPI(method, route, postData) {
    if (!Vars.UserData.ConnectHabitica) {
        return null;
    }

     // Check if credentials are properly set
     if (!Vars.UserData.Credentials || !Vars.UserData.Credentials.uid || !Vars.UserData.Credentials.apiToken || 
        Vars.UserData.Credentials.uid.trim() === "" || Vars.UserData.Credentials.apiToken.trim() === "") {
        console.log("Habitica API: Cannot make API call - credentials not configured");
        return null;
    }

    var serverUrl = Vars.UserData.developerServerUrl && Vars.UserData.developerServerUrl !== "" ? Vars.UserData.developerServerUrl : Consts.serverUrl;
    return await callHabiticaAPI(serverUrl + route, Consts.xClientHeader, Vars.UserData.Credentials, method, postData);
}

async function getData(silent, credentials, serverPath) {
    if (!Vars.UserData.ConnectHabitica) {
        return null;
    }

    // Check if credentials are properly set
    if (!credentials || !credentials.uid || !credentials.apiToken || 
        credentials.uid.trim() === "" || credentials.apiToken.trim() === "") {
        if (!silent) {
            chrome.notifications.create(Consts.NotificationId, {
                type: "basic",
                iconUrl: "img/icon.png",
                title: "Habitica Connection Error",
                message: "Please configure your Habitica User ID and API Token in the extension settings."
            },
                function () { });
        }
        return null;
    }

    const serverUrl = Vars.UserData.developerServerUrl && Vars.UserData.developerServerUrl !== ""
        ? Vars.UserData.developerServerUrl
        : Consts.serverUrl;

    try {
        const response = await fetch(serverUrl + serverPath, {
            method: "GET",
            headers: {
                "x-client": Consts.xClientHeader,
                "x-api-user": credentials.uid,
                "x-api-key": credentials.apiToken
            }
        });

        Vars.ServerResponse = response.status;

        if (response.status == 401) {
            console.log("Habitica Credentials Error 401");
            if (!silent) {
                chrome.notifications.create(Consts.NotificationId, {
                    type: "basic",
                    iconUrl: "img/icon.png",
                    title: "Habitica Authentication Error",
                    message: "Invalid User ID or API Token. Please check your credentials in the extension settings."
                },
                    function () { });
            }
            return null;
        }

        if (response.status != 200 || !response.ok) {
            console.log("Habitica Connection Error, Status:" + response.status);
            if (!silent) {
                chrome.notifications.create(Consts.NotificationId, {
                    type: "basic",
                    iconUrl: "img/icon.png",
                    title: "Habitica Connection Error",
                    message: "The service might be temporarily unavailable. Contact the developer if it persists. Error = " + response.status
                });
            }
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error("Habitica Fetch Error:", error);
        return null;
    }
}

async function FetchHabiticaData(skipTasks) {
    var credentials = Vars.UserData.Credentials;
    var userObj = await getData(false, credentials, Consts.serverPathUser);
    if (userObj == null) return;
    else {
        Vars.Monies = userObj.data["stats"]["gp"];
        Vars.Exp = userObj.data["stats"]["exp"];
        Vars.Hp = userObj.data["stats"]["hp"];
    }
    if (!skipTasks) {
        var tasksObj;

        //get custom pomodoro tasks list (all habits)
        var allHabits;
        allHabits = await getData(false, credentials, Consts.serverPathUserHabits);
        console.log(allHabits);
        if (allHabits.success) {
            Vars.PomodoroTaskCustomList = [];
            for (var i in allHabits.data) {
                var title = allHabits.data[i].text;
                var id = allHabits.data[i].id;
                Vars.PomodoroTaskCustomList.push({
                    title,
                    id
                });
            }
            console.log(Vars.PomodoroTaskCustomList);
        }

        //get pomodoro task id
        if (!Vars.UserData.CustomPomodoroTask) {
            tasksObj = await getData(true, credentials, Consts.serverPathPomodoroHabit);
            if (tasksObj && tasksObj.data["alias"] == Consts.PomodoroHabitTemplate.alias) {
                Vars.PomodoroTaskId = tasksObj.data.id;
            } else {
                var result =await CreatePomodoroHabit();
                if (result.error) {
                    notify("ERROR", result.error);
                } else {
                    Vars.PomodoroTaskId = result;
                }

            }
        } else {
            Vars.PomodoroTaskId = Vars.UserData.PomodoroTaskId;
        }

        //get pomodoro Set task id
        if (!Vars.UserData.CustomSetTask) {
            tasksObj = await getData(true, credentials, Consts.serverPathPomodoroSetHabit);
            if (tasksObj && tasksObj.data["alias"] == Consts.PomodoroSetHabitTemplate.alias) {
                Vars.PomodoroSetTaskId = tasksObj.data.id;
            } else {
                var result = await CreatePomodoroSetHabit();
                if (result.error) {
                    notify("ERROR", result.error);
                } else {
                    Vars.PomodoroSetTaskId = result;
                }

            }
        } else {
            Vars.PomodoroSetTaskId = Vars.UserData.PomodoroSetTaskId;
        }

        // (removed emoji updater)

        //Reward task update/create
        tasksObj = await getData(true, credentials, Consts.serverPathTask);
        if (tasksObj && tasksObj.data["alias"] == "sitepass") {
            Vars.RewardTask = tasksObj.data;
            //UpdateRewardTask(0, false);
            return;
        }
        await UpdateRewardTask(0, true);
    }
}

async function UpdateRewardTask(cost, create) {
    
    // Check if credentials are properly set
    if (!Vars.UserData.Credentials || !Vars.UserData.Credentials.uid || !Vars.UserData.Credentials.apiToken || 
        Vars.UserData.Credentials.uid.trim() === "" || Vars.UserData.Credentials.apiToken.trim() === "") {
        console.log("Habitica API: Cannot update reward task - credentials not configured");
        return;
    }
        const serverUrl = Vars.UserData.developerServerUrl && Vars.UserData.developerServerUrl !== ""
            ? Vars.UserData.developerServerUrl
            : Consts.serverUrl;

        const normalizedServerUrl = serverUrl.replace(/\/$/, '');
        const url = create
            ? normalizedServerUrl + '/' + Consts.serverPathUserTasks.replace(/^\//, '')
            : `${normalizedServerUrl}/tasks/${Vars.RewardTask.id}`; //PUT to specific task

        const method = create ? "POST" : "PUT";

        try {
            // Build a safe payload. For updates (PUT) send only a numeric `value` field to avoid
            // accidentally sending an id/string as the value. For creates, send the full task data
            // but strip server-generated ids.
            let payload;
            if (create) {
                payload = Object.assign({}, Vars.RewardTask);
                delete payload.id;
                delete payload._id;
            } else {
                // coerce cost to number; if invalid, fall back to current numeric value or 0
                const n = Number(cost);
                const safeValue = (!isNaN(n)) ? n : (Number(Vars.RewardTask.value) || 0);
                payload = { value: safeValue };
            }

            console.log(`[UpdateRewardTask] ${method} to ${url}`, payload);

            const response = await fetch(url, {
                method,
                headers: {
                    'x-client': Consts.xClientHeader,
                    'Content-Type': 'application/json',
                    'x-api-user': Vars.UserData.Credentials.uid,
                    'x-api-key': Vars.UserData.Credentials.apiToken
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`[UpdateRewardTask] Server error: ${response.status} ${response.statusText}`, text);
                return false;
            }

            const json = await response.json();
            Vars.RewardTask = json.data; //updated task object (with id)
            return true;

        } catch (error) {
            console.error("[UpdateRewardTask] Fetch error:", error);
            return false;
        }
  }

async function CreatePomodoroHabit() {
    // Try to create the Pomodoro habit. If the server rejects (400), fall back
    // to searching the user's tasks for an existing task with the expected alias
    // and return that id instead of failing. This handles cases where a task
    // already exists but the POST was rejected due to validation or duplicate alias.
    try {
        var p = await callAPI("POST", Consts.serverPathUserTasks, Consts.PomodoroHabitTemplate);
        if (p && p.success === true && p.data && p.data.id) {
            const id = p.data.id;
            Vars.PomodoroTaskId = id;
            Vars.UserData.PomodoroTaskId = id;
            try {
                chrome.storage.sync.set({ [Consts.userDataKey]: Vars.UserData }, function () {
                    console.log('Persisted PomodoroTaskId to storage', id);
                });
            } catch (e) {
                console.warn('CreatePomodoroHabit: failed to persist id', e);
            }
            return id;
        }
    } catch (e) {
        console.warn('CreatePomodoroHabit: POST failed', e);
    }

    // Fallback: list user tasks and find one matching the alias
    try {
        const list = await getData(true, Vars.UserData.Credentials, Consts.serverPathUserTasks);
        if (list && list.success && Array.isArray(list.data)) {
            for (let i = 0; i < list.data.length; i++) {
                const t = list.data[i];
                if (t && t.alias === Consts.PomodoroHabitTemplate.alias) {
                    const id = t.id;
                    Vars.PomodoroTaskId = id;
                    Vars.UserData.PomodoroTaskId = id;
                    try {
                        chrome.storage.sync.set({ [Consts.userDataKey]: Vars.UserData }, function () {
                            console.log('Persisted PomodoroTaskId (fallback) to storage', id);
                        });
                    } catch (e) {
                        console.warn('CreatePomodoroHabit fallback: failed to persist id', e);
                    }
                    return id;
                }
            }
        }
    } catch (e) {
        console.warn('CreatePomodoroHabit fallback search failed', e);
    }

    return { error: 'Failed to Create Pomodoro Habit task' };
}

// (EnsurePomodoroTitlesHaveEmoji removed)

async function CreatePomodoroSetHabit() {
    try {
        var p = await callAPI("POST", Consts.serverPathUserTasks, Consts.PomodoroSetHabitTemplate);
        if (p && p.success === true && p.data && p.data.id) {
            const id = p.data.id;
            Vars.PomodoroSetTaskId = id;
            Vars.UserData.PomodoroSetTaskId = id;
            try {
                chrome.storage.sync.set({ [Consts.userDataKey]: Vars.UserData }, function () {
                    console.log('Persisted PomodoroSetTaskId to storage', id);
                });
            } catch (e) {
                console.warn('CreatePomodoroSetHabit: failed to persist id', e);
            }
            return id;
        }
    } catch (e) {
        console.warn('CreatePomodoroSetHabit: POST failed', e);
    }

    // Fallback: search for existing task with matching alias
    try {
        const list = await getData(true, Vars.UserData.Credentials, Consts.serverPathUserTasks);
        if (list && list.success && Array.isArray(list.data)) {
            for (let i = 0; i < list.data.length; i++) {
                const t = list.data[i];
                if (t && t.alias === Consts.PomodoroSetHabitTemplate.alias) {
                    const id = t.id;
                    Vars.PomodoroSetTaskId = id;
                    Vars.UserData.PomodoroSetTaskId = id;
                    try {
                        chrome.storage.sync.set({ [Consts.userDataKey]: Vars.UserData }, function () {
                            console.log('Persisted PomodoroSetTaskId (fallback) to storage', id);
                        });
                    } catch (e) {
                        console.warn('CreatePomodoroSetHabit fallback: failed to persist id', e);
                    }
                    return id;
                }
            }
        }
    } catch (e) {
        console.warn('CreatePomodoroSetHabit fallback search failed', e);
    }

    return { error: 'Failed to Create Pomodoro Set Habit task' };
}

// Update only the `text` field of existing Pomodoro tasks on Habitica (no scoring).
// This is a manual helper you can run from the Service Worker console or via
// `runBackgroundFunction("UpdatePomodoroTitlesOnServer", [])` from the popup.
async function UpdatePomodoroTitlesOnServer() {
    const results = { updated: [], errors: [] };

    try {
        if (!Vars.UserData || !Vars.UserData.Credentials) {
            results.errors.push('No credentials configured');
            return results;
        }

        // Helper to update a single task's title
        async function updateOne(id, text) {
            if (!id) return { skipped: true };
            try {
                const resp = await callAPI('PUT', 'tasks/' + id, { text: text });
                if (resp && resp.success) {
                    results.updated.push({ id: id, text: text });
                    return { id: id, success: true };
                } else {
                    results.errors.push({ id: id, reason: resp });
                    return { id: id, success: false, reason: resp };
                }
            } catch (e) {
                results.errors.push({ id: id, error: String(e) });
                return { id: id, success: false, error: String(e) };
            }
        }

        // Update the main Pomodoro task title
        await updateOne(Vars.PomodoroTaskId, Consts.PomodoroHabitTemplate.text);
        // Update the Pomodoro set/combo task title
        await updateOne(Vars.PomodoroSetTaskId, Consts.PomodoroSetHabitTemplate.text);

    } catch (e) {
        results.errors.push(String(e));
    }

    console.log('UpdatePomodoroTitlesOnServer result:', results);
    return results;
}

// Validate stored Pomodoro IDs: ensure the stored tasks still exist and match
// the expected alias/text. If missing or mismatched, recreate via the
// create flows and persist the new IDs to storage.
async function ValidateStoredPomodoroIds() {
    if (!Vars.UserData || !Vars.UserData.Credentials) return;
    const creds = Vars.UserData.Credentials;

    async function checkAndFix(idKey, templateAlias, templateText, createFn) {
        const storedId = Vars.UserData[idKey] || Vars[idKey];
        if (!storedId) {
            // No stored id — attempt to find or create
            const created = await createFn();
            if (created && !created.error) {
                Vars[idKey] = created;
                Vars.UserData[idKey] = created;
                chrome.storage.sync.set({ [Consts.userDataKey]: Vars.UserData }, () => {
                    console.log('ValidateStoredPomodoroIds: persisted new', idKey, created);
                });
            }
            return;
        }

        try {
            const taskResp = await getData(true, creds, 'tasks/' + storedId);
            if (taskResp && taskResp.success && taskResp.data) {
                const t = taskResp.data;
                if (t.alias === templateAlias || t.text === templateText) {
                    // Stored id is valid — ensure runtime vars reflect it
                    Vars[idKey] = storedId;
                    Vars.UserData[idKey] = storedId;
                    return;
                }
                console.log('ValidateStoredPomodoroIds: stored id mismatch', idKey, storedId, 'server alias/text:', t.alias, t.text);
            } else {
                console.log('ValidateStoredPomodoroIds: stored id not found on server', idKey, storedId);
            }
        } catch (e) {
            console.warn('ValidateStoredPomodoroIds: check failed for', idKey, storedId, e);
        }

        // If we reach here, the stored id is invalid or mismatched — recreate
        try {
            const result = await createFn();
            if (result && !result.error) {
                Vars[idKey] = result;
                Vars.UserData[idKey] = result;
                chrome.storage.sync.set({ [Consts.userDataKey]: Vars.UserData }, () => {
                    console.log('ValidateStoredPomodoroIds: recreated and persisted', idKey, result);
                });
            } else {
                console.warn('ValidateStoredPomodoroIds: recreate failed for', idKey, result);
            }
        } catch (e) {
            console.warn('ValidateStoredPomodoroIds: recreate exception for', idKey, e);
        }
    }

    await checkAndFix('PomodoroTaskId', Consts.PomodoroHabitTemplate.alias, Consts.PomodoroHabitTemplate.text, CreatePomodoroHabit);
    await checkAndFix('PomodoroSetTaskId', Consts.PomodoroSetHabitTemplate.alias, Consts.PomodoroSetHabitTemplate.text, CreatePomodoroSetHabit);
}

// Scan Habitica tasks for Pomodoro duplicates (non-destructive). Returns an
// object with arrays for `pomodoro` and `pomodoroSet` matches.
async function ScanPomodoroDuplicates() {
    if (!Vars.UserData || !Vars.UserData.Credentials) {
        console.warn('ScanPomodoroDuplicates: no credentials configured');
        return null;
    }

    const list = await getData(true, Vars.UserData.Credentials, Consts.serverPathUserTasks);
    const result = { pomodoro: [], pomodoroSet: [], otherMatches: [] };
    if (!list || !list.success || !Array.isArray(list.data)) return result;

    for (const t of list.data) {
        if (!t || !t.id) continue;
        const text = (t.text || '').toString();
        const alias = t.alias || '';

        // Match primary pomodoro habit by alias or by containing Pomodoro emoji/text
        const isPomodoroAlias = alias === Consts.PomodoroHabitTemplate.alias;
        const isPomodoroText = /pomodoro/i.test(text) || text.indexOf('🍅') !== -1;
        if (isPomodoroAlias || isPomodoroText) result.pomodoro.push({ id: t.id, text: text, alias: alias });

        // Match pomodoro set/combo by alias or text hints
        const isSetAlias = alias === Consts.PomodoroSetHabitTemplate.alias;
        const isSetText = /combo/i.test(text) || /set/i.test(text) && text.indexOf('🍅') !== -1;
        if (isSetAlias || isSetText) result.pomodoroSet.push({ id: t.id, text: text, alias: alias });

        if ((isPomodoroAlias || isPomodoroText || isSetAlias || isSetText) && !(isPomodoroAlias || isSetAlias || isPomodoroText || isSetText)) {
            result.otherMatches.push({ id: t.id, text: text, alias: alias });
        }
    }

    // Log findings for convenience
    console.log('ScanPomodoroDuplicates result:', result);
    return result;
}

// Clean duplicates: keep `preferredPomodoroId` and `preferredSetId` when provided,
// or fallback to persisted IDs. Deletes other matching tasks. Use cautiously.
async function CleanPomodoroDuplicates(preferredPomodoroId, preferredSetId) {
    if (!Vars.UserData || !Vars.UserData.Credentials) {
        console.warn('CleanPomodoroDuplicates: no credentials configured');
        return { error: 'No credentials' };
    }

    const scan = await ScanPomodoroDuplicates();
    if (!scan) return { error: 'Scan failed' };

    // Helper to delete extras in a group, keeping one id
    async function deleteExtras(group, keepId) {
        const deleted = [];
        for (const item of group) {
            if (item.id === keepId) continue;
            try {
                const resp = await callAPI('DELETE', 'tasks/' + item.id);
                if (resp && resp.success) {
                    deleted.push(item.id);
                    console.log('Deleted duplicate task', item.id, item.text);
                } else {
                    console.warn('Failed to delete task', item.id, resp);
                }
            } catch (e) {
                console.warn('Exception deleting task', item.id, e);
            }
        }
        return deleted;
    }

    // Determine keep ids
    const keepPomodoro = preferredPomodoroId || Vars.UserData.PomodoroTaskId || Vars.PomodoroTaskId || (scan.pomodoro[0] && scan.pomodoro[0].id);
    const keepSet = preferredSetId || Vars.UserData.PomodoroSetTaskId || Vars.PomodoroSetTaskId || (scan.pomodoroSet[0] && scan.pomodoroSet[0].id);

    const result = { deleted: { pomodoro: [], pomodoroSet: [] }, kept: { pomodoro: keepPomodoro, pomodoroSet: keepSet } };

    if (Array.isArray(scan.pomodoro) && scan.pomodoro.length > 1) {
        result.deleted.pomodoro = await deleteExtras(scan.pomodoro, keepPomodoro);
    }
    if (Array.isArray(scan.pomodoroSet) && scan.pomodoroSet.length > 1) {
        result.deleted.pomodoroSet = await deleteExtras(scan.pomodoroSet, keepSet);
    }

    // Persist chosen kept ids
    if (keepPomodoro) Vars.UserData.PomodoroTaskId = keepPomodoro, Vars.PomodoroTaskId = keepPomodoro;
    if (keepSet) Vars.UserData.PomodoroSetTaskId = keepSet, Vars.PomodoroSetTaskId = keepSet;
    try {
        chrome.storage.sync.set({ [Consts.userDataKey]: Vars.UserData }, () => {
            console.log('CleanPomodoroDuplicates: persisted kept IDs', result.kept);
        });
    } catch (e) {
        console.warn('CleanPomodoroDuplicates: failed to persist kept IDs', e);
    }

    // Run a quick validation after cleanup
    await ValidateStoredPomodoroIds();
    console.log('CleanPomodoroDuplicates result:', result);
    return result;
}

//------------------Handle messaging, communication with popup and overlay-----------------------------
chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name == "timer");
    port.onMessage.addListener((msg) => {
        if (msg === "sync") {
            port.postMessage({ vars: Vars, complete: true });
        }
    });

});

async function handleMessage(request, sender, sendResponse) {

    var response = { complete: true };

    //Confirm Purchase page overlay
    if (request.sender === "pageOverlay") {
        if (request.msg === "Confirm_Purchase") {
            var site = GetBlockedSite(request.hostname);
            console.log('confirming Purchase for ' + site.hostname);
            ConfirmPurchase(site);
        }
    }

    //Popup communication
    else if (request.sender === "popup") {
        if (request.msg === "get_data") {
            response = { vars: Vars, consts: Consts, complete: true };
        }
        else if (request.msg === "set_data") {
            Vars = request.data.vars;
        }
        else if (request.msg === "run_function") {
            // If the popup asks to run FetchHabiticaData but the worker hasn't yet
            // initialised `Vars.UserData` from storage, load it first to ensure
            // credentials and developerServerUrl are available for API calls.
            if (request.functionName === 'FetchHabiticaData') {
                if (!Vars.UserData || !Vars.UserData.Credentials || !Vars.UserData.Credentials.uid) {
                    try {
                        await new Promise((resolve) => {
                            chrome.storage.sync.get(Consts.userDataKey, function (result) {
                                if (result && result[Consts.userDataKey]) {
                                    Vars.UserData = new UserSettings(result[Consts.userDataKey]);
                                }
                                resolve();
                            });
                        });
                    } catch (e) {
                        console.warn('Failed to lazy-load UserData before FetchHabiticaData', e);
                    }
                }
            }

            if (request.args) {
                //what spread(...) is doing here is taking the array element and expanding or unpacking it into a list of arguments
                response = { result: executeFunctionByName(request.functionName, ...request.args), complete: true };
            } else {
                response = { result: executeFunctionByName(request.functionName), complete: true };
            }
        }
    }

    sendResponse(response);

    // return true from the event listener to indicate you wish to send a response asynchronously
    // (this will keep the message channel open to the other end until sendResponse is called).
    return true;
}

function executeFunctionByName(functionName /*, args */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var context = self;
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

//-------------------------------------------------------------------------------------------
async function ConfirmPurchase(site) {
    UpdateRewardTask(site.cost, false);
    var p = await callAPI("POST", Consts.serverPathTask + "/score/down");
    if (p.success != true) {
        notify("ERROR", 'Failed to pay ' + site.cost + 'coins for ' + site.hostname + ' in Habitica');
    } else {
        Vars.Monies -= site.cost;
        var passDurationMiliSec = GetSitePassDuration(site) * 60 * 1000;
        site.passExpiry = Date.now() + passDurationMiliSec;
    }
}

//direction 'up' or 'down'
async function ScoreHabit(habitId, direction) {
    var p = await callAPI("POST", '/tasks/' + habitId + '/score/' + direction)
    if (p.success != true) {
        return {
            error: 'Failed to score task ' + habitId + ', doublecheck its ID'
        };
    }
    return {
        lvl: p.data.lvl,
        hp: p.data.hp,
        exp: p.data.exp,
        mp: p.data.mp,
        gp: p.data.gp
    };
}

//--------------- Hot Keys -------------------------------
chrome.commands.onCommand.addListener(function (command) {
    if (command === "PomodoroHotKey") {
        ActivatePomodoro();
    }
});

function ActivatePomodoro() {
    if(Vars.TimerFreeze){
        pomoUnFreeze();
    }
    else if (Vars.onBreak && !Vars.TimerRunnig) {
        startBreak();
    }
    else if (!Vars.TimerRunnig || Vars.onBreak || Vars.onBreakExtension) {
        if (Vars.PomoSetCounter == Vars.UserData.PomoSetNum) { //Set complete
            pomoReset();
        } else {//next pomodoro
            startPomodoro();
        }
    } else {
        pomodoroInterupted(true);
    }
}

// ------------- Pomodoro Timer ---------------------------

var timerInterval; //Used for timer interval in startTimer() function.

/**
 * Start Timer: 
 * @param {int} duration the duration in seconds.
 * @param {function} duringTimerFunction this function runs every second while the timer runs.
 * @param {function} endTimerFunction this function runs when timer reachs 00:00.
 */
function startTimer(duration, duringTimerFunction, endTimerFunction) {

    var timer = duration;
    var duringTimer = function () {
        duringTimerFunction()
    };
    var endTimer = function () {
        endTimerFunction()
    };
    
    timerInterval = setInterval(function () {

        Vars.Timer = secondsToTimeString(timer);
        Vars.TimerValue = timer;

        duringTimer();

        //Times Up
        if (--timer < 0) {
            endTimer();
        }

    }, 1000);
}


//start pomodoro session - duration in seconds
function startPomodoro() {
    stopTimer();
    var duration = 60 * Vars.UserData.PomoDurationMins;
    Vars.TimerRunnig = true;
    Vars.onBreak = false;
    Vars.TimerFreeze = false;
    startTimer(duration, duringPomodoro, pomodoroEnds);
    muteBlockedtabs();
    playSound(Vars.UserData.ambientSound, Vars.UserData.ambientSoundVolume, true);
}

//runs during pomodoro session
function duringPomodoro() {
    //Show time on icon badge 
    chrome.action.setBadgeBackgroundColor({
        color: "green"
    });
    var timeString = BROWSER === "Mozilla Firefox" ? shortTimeString(Vars.Timer) : Vars.Timer;
    chrome.action.setBadgeText({
        text: timeString
    });
    //Block current tab if necessary
    CurrentTab(blockSiteOverlay);
    playSound(Vars.UserData.ambientSound, Vars.UserData.ambientSoundVolume, true);
}

function setTodaysHistogram(pomodoros, minutes) {
    Vars.Histogram[getDate()] = { pomodoros: pomodoros, minutes: minutes, weekday: getWeekDay() };

    //update storage
    var storageKeyVal = {}; //{key: value} for chrome.storage.sync.set
    storageKeyVal[Consts.HistogramDataKey] = Vars.Histogram; // {HistogramDataKey : Vars.Histogram}
    chrome.storage.sync.set(storageKeyVal, function () {
        console.log('updated Todays Histogram ' + JSON.stringify(storageKeyVal));
    });
}

function increasePomodorosToday() {
    var todaysData = Vars.Histogram[getDate()];
    if (todaysData) {
        setTodaysHistogram(todaysData.pomodoros + 1, todaysData.minutes + Vars.UserData.PomoDurationMins);
    } else {
        setTodaysHistogram(1, Vars.UserData.PomoDurationMins);
    }
}

function clearHistogram() {
    Vars.Histogram = {};
    //update storage
    var storageKeyVal = {}; //{key: value} for chrome.storage.sync.set
    storageKeyVal[Consts.HistogramDataKey] = Vars.Histogram; // {HistogramDataKey : Vars.Histogram}
    chrome.storage.sync.set(storageKeyVal);
}

//runs When Pomodoro Timer Ends
async function pomodoroEnds() {

    stopTimer();
    stopAmbientSound();
    increasePomodorosToday();
    var title = "Time's Up"
    var msg = "Pomodoro ended." + "\n" + "You have done " + Vars.Histogram[getDate()].pomodoros + " today!"; //default msg if habit not enabled
    var setComplete = Vars.PomoSetCounter >= Vars.UserData.PomoSetNum - 1;
    //If Pomodoro / Pomodoro Set Habit + is enabled
    if (Vars.UserData.PomoHabitPlus || (setComplete && Vars.UserData.PomoSetHabitPlus)) {
        await FetchHabiticaData(true);
        var result = (setComplete && Vars.UserData.PomoSetHabitPlus) ? await ScoreHabit(Vars.PomodoroSetTaskId, 'up') : await ScoreHabit(Vars.PomodoroTaskId, 'up');
        if (!result.error) {
            var deltaGold = (result.gp - Vars.Monies).toFixed(2);
            var deltaExp = (result.exp - Vars.Exp).toFixed(2);
            var expText = deltaExp < 0 ? "You leveled up!" : "You Earned Exp: +" + deltaExp;
            msg = "You Earned Gold: +" + deltaGold + "\n" + expText;
            FetchHabiticaData(true);
        } else {
            msg = "ERROR: " + result.error;
        }
    }

    Vars.PomoSetCounter++; //Update set counter

    if (setComplete) {
        title = "Pomodoro Set Complete!";
    }
    if (Vars.UserData.ManualBreak) {
        manualBreak();
    } else {
        startBreak();
    }

    //Badge
    chrome.action.setBadgeBackgroundColor({
        color: "green"
    });
    chrome.action.setBadgeText({
        text: "\u2713"
    });

    //notify
    notify(title, msg);

    //play sound
    playSound(Vars.UserData.pomodoroEndSound, Vars.UserData.pomodoroEndSoundVolume, false);
    Vars.TimerFreeze = false;
}

//start break session - duration in seconds
function startBreak() {
    stopTimer();
    var duration;
    if (Vars.PomoSetCounter == Vars.UserData.PomoSetNum) {
        duration = 60 * Vars.UserData.LongBreakDuration
    } else {
        duration = 60 * Vars.UserData.BreakDuration;
    }
    stopTimer();
    Vars.TimerRunnig = true;
    Vars.onBreak = true;
    Vars.TimerFreeze = false;
    startTimer(duration, duringBreak, breakEnds);
}

//take manual break (in popup quick setting) - duration in seconds
function takeBreak(duration) {
    stopTimer();
    Vars.PomoSetCounter = Vars.UserData.PomoSetNum;
    Vars.onManualTakeBreak = true;
    Vars.TimerRunnig = true;
    Vars.onBreak = true;
    startTimer(60 * duration, duringBreak, breakEnds);
}

//start break session - duration in seconds
function manualBreak() {
    stopTimer();
    Vars.TimerRunnig = false;
    Vars.onBreak = true;
    Vars.Timer = Consts.POMODORO_DONE_TEXT;
}

//runs during Break session
function duringBreak() {
    //Show time on icon badge 
    chrome.action.setBadgeBackgroundColor({
        color: "blue"
    });
    var timeString = BROWSER === "Mozilla Firefox" ? shortTimeString(Vars.Timer) : Vars.Timer;
    chrome.action.setBadgeText({
        text: timeString
    });
}

//runs when Break session ends
function breakEnds() {
    var onManualTakeBreak = Vars.onManualTakeBreak
    stopTimer();
    var msg;

    //Long break
    if (Vars.PomoSetCounter == Vars.UserData.PomoSetNum) {
        msg = onManualTakeBreak ? "Break is 0ver" : "Long Break is over";
        pomoReset();
        if (Vars.UserData.LongBreakNotify) {
            notifyHabitica(msg);
        }
    }

    //Break Extension on end
    else {
        msg = "Back to work";
        startBreakExtension(Vars.UserData.BreakExtention * 60);
    }

    //notify
    notify("Time's Up", msg);
    //play sound
    playSound(Vars.UserData.breakEndSound, Vars.UserData.breakEndSoundVolume, false);
}

//start break session - duration in seconds
function startBreakExtension(duration) {
    stopTimer();
    Vars.TimerRunnig = true;
    Vars.TimerFreeze = false;
    Vars.onBreakExtension = true;
    Vars.onBreak = true;
    var endFunc = Vars.UserData.ResetPomoAfterBreak ? (() => { pomodoroInterupted(true) }) : pomodoroInterupted;
    startTimer(duration, duringBreakExtension, endFunc);
    if (Vars.UserData.BreakExtentionNotify) {
        notifyHabitica("Back to work! " + secondsToTimeString(Vars.UserData.BreakExtention * 60) + " minutes left for Break Extension.");
    }
}

//runs during Break session
function duringBreakExtension() {
    //Show time on icon badge 
    chrome.action.setBadgeBackgroundColor({
        color: "red"
    });
    chrome.action.setBadgeText({
        text: Vars.Timer
    });
}

//runs when pomodoro is interupted (stoped before timer ends/break extension over)
async function pomodoroInterupted(breakPomoStreak) {

    stopAmbientSound();

    var failedBreakExtension = Vars.UserData.BreakExtentionFails && Vars.onBreakExtension;
    var breakExtensionZero = !Vars.UserData.BreakExtentionFails && (Vars.UserData.BreakExtention == 0);
    if (breakPomoStreak) {
        pomoReset();
    } else {
        pauseTimer();
        Vars.Timer = "GO!";
    }

    if (breakExtensionZero) {
        return;
    }

    if (Vars.UserData.PomoHabitMinus || failedBreakExtension) {
        await FetchHabiticaData(true);
        var result = await ScoreHabit(Vars.PomodoroTaskId, 'down');
        var msg = "";
        if (!result.error) {
            var deltaHp = (result.hp - Vars.Hp).toFixed(2);
            msg = "You Lost Health: " + deltaHp;
            FetchHabiticaData(true);
        } else {
            msg = "ERROR: " + result.error;
        }
        notify("Pomodoro Failed!", msg);
    }
}

//Stop timer
function stopTimer() {

    clearInterval(timerInterval);
    Vars.Timer = "00:00";
    chrome.action.setBadgeText({
        text: ''
    });

    CurrentTab(unblockSiteOverlay); //if current tab is blocked, unblock it
    CurrentTab(mainSiteBlockFunction); //Confirm Purchase check
    Vars.TimerRunnig = false;
    Vars.onBreak = false;
    Vars.onBreakExtension = false;
    Vars.onManualTakeBreak = false;
    Vars.TimerFreeze = false;

}

//Pause timer (not like freeze, e,g pause before starting break)
function pauseTimer() {
    clearInterval(timerInterval);
}

//Freeze pomodoro timer (pause)
function pomoFreeze() {
    Vars.TimerFreeze = true;
    pauseTimer();
    stopAmbientSound();
}

function pomoUnFreeze(){
    Vars.TimerFreeze=false;
    startTimer(Vars.TimerValue, duringPomodoro, pomodoroEnds);
}

//Stop timer - reset to start position
function pomoReset() {
    stopAmbientSound();
    stopTimer();
    Vars.PomoSetCounter = 0; //Reset Pomo set Count
    Vars.TimerFreeze = false;
}

//End pomodoro and start a break
function skipToBreak() {
    stopAmbientSound();
    stopTimer();
    var title = "Time's Up";
    var msg = "Take a break";
    Vars.PomoSetCounter++; //Updae set counter
    startBreak();
    notify(title, msg);
    Vars.TimerFreeze = false;
}



//Create Chrome Notification
function notify(title, message, callback) {
    var options = {
        title: title,
        message: message,
        type: "basic", // Which type of notification to display - https://developer.chrome.com/extensions/notifications#type-TemplateType
        iconUrl: "img/icon.png" // A URL to the sender's avatar, app icon, or a thumbnail for image notifications.
    };
    // The first argument is the ID, if left blank it'll be automatically generated.
    // The second argument is an object of options. More here: https://developer.chrome.com/extensions/notifications#type-NotificationOptions
    return chrome.notifications.create("", options, callback);
}

//Run function(tab) on currentTab
function CurrentTab(func) {
    chrome.tabs.query({
        'active': true,
        'windowId': chrome.windows.WINDOW_ID_CURRENT
    },
        function (tabs) {
            if (tabs[0]) {
                func(tabs[0]);
            }
        });
}

//Block Site With Timer Overlay
function blockSiteOverlay(tab) {
    const opacity = Vars.UserData.TranspartOverlay ? "0.85" : "1";
    const url = parseUrlSafe(tab.url);
    if (!url) return; // ignore non-http(s) tabs
    const message = "Stay Focused! Time Left: " + Vars.Timer;

    if (GetBlockedSite(url.hostname) && !isInWhiteList(url)) {
        const imageURL = chrome.runtime.getURL("/img/siteKeeper.png");

        // Inject JS to modify DOM
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (message, imageURL, opacity) => {
                document.body.classList.add('blockedSite');
                document.body.setAttribute('data-html', message);

                const style = document.createElement('style');
                style.textContent = `
                    .blockedSite:after {
                        background-image: url("${imageURL}");
                    }
                    .blockedSite:before {
                        background-color: rgba(0, 0, 0, ${opacity});
                    }
                `;
                document.head.appendChild(style);
            },
            args: [message, imageURL, opacity]
        });
    }
}

//Remove Overlay from current Blocked Site
function unblockSiteOverlay(tab) {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            document.body.className = document.body.className.replace("blockedSite", '');
            const blockElementExists = document.getElementById("SitekeeperOverlay");
            if (blockElementExists) {
                blockElementExists.style.display = 'none';
            }
        }
    });
}

//Sends Private Message to the user in Habitica (Used as notification in the mobile app!)
async function notifyHabitica(msg) {
    var data = {
        message: msg,
        toUserId: Vars.UserData.Credentials.uid
    };
    await callAPI("POST", 'members/send-private-message', data);
}

function isFreePassTimeNow() {
    var freePassTimes = Vars.UserData.FreePassTimes;
    for (var i = 0; i < freePassTimes.length; i++) {
        var freePass = freePassTimes[i]
        if (freePass.day == getWeekDay()) {
            if (isTimeBetween(freePass.fromTime, freePass.toTime)) {
                return true;
            }
        }
    }
    return false;
}

//---Offscreen Sound Manager---
// Ensure offscreen audio page exists
async function ensureOffscreenDocument() {
    const exists = await chrome.offscreen.hasDocument();
    if (!exists) {
      await chrome.offscreen.createDocument({
        url: "offscreen/soundManager.html",
        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
        justification: "Play ambient audio in background"
      });
    }
  }
  
  // Play a sound
  async function playSound(filename, volume = 1, loop = false) {
    await ensureOffscreenDocument();
    await chrome.runtime.sendMessage({
      type: "playSound",
      soundFileName: filename,
      volume,
      loop
    });
  }
  
  // Stop ambient sound
  async function stopAmbientSound() {
    await ensureOffscreenDocument();
    await chrome.runtime.sendMessage({ type: "stopAmbientSound" });
  }
  
  // Play an ambient sample (preview for 3s)
  async function playAmbientSample(filename, volume = 1) {
    await ensureOffscreenDocument();
    await chrome.runtime.sendMessage({
      type: "playAmbientSample",
      soundFileName: filename,
      volume
    });
  }
  //---END Offscreen Sound Manager---