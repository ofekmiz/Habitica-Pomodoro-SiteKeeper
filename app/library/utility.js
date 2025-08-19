//========== Time Functions =============

//returns the current date, "yyyy-mm-dd" format
function getDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

//returns the current weekday
function getWeekDay() {
    var today = new Date();
    var weekdays = new Array(
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    );
    var day = today.getDay();
    return weekdays[day];
}

//returns the current time in 24hrs format
function getTime() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    return time;
}

//input time str like "18:30", returns number of minutes since "00:00".
function getMinutes(str) {
    var time = str.split(':');
    return time[0] * 60 + time[1] * 1;
}

//Input: Time strings 'hh:mm' in 24hr format i.e. '23:28'
function isTimeBetween(fromTime, toTime) {

    if (fromTime == "" || toTime == "") {
        return false;
    }

    var nowMinutes = getMinutes(getTime());
    var startMinutes = getMinutes(fromTime);
    var endMinutes = getMinutes(toTime);

    if ((nowMinutes > startMinutes) && (nowMinutes < endMinutes)) {
        return true
    }
    return false;
}

//Convert seconds to time string, for example: 65 -> "01:05"
function secondsToTimeString(seconds) {
    var minutes = parseInt(seconds / 60, 10)
    var seconds = parseInt(seconds % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return minutes + ":" + seconds;
}

//Convert time string to short time string, for example: "01:05" -> "1m" , "00:35" -> "35"
function shortTimeString(timeString) {
    var time = timeString.split(":");
    var minutes = parseInt(time[0]);
    var seconds = parseInt(time[1]);
    return minutes > 0 ? minutes.toString() + "m" : seconds.toString();
}

//========== Site Blocker =============
function getSitePassRemainingTime(site) {
    if (site.passExpiry - Date.now() <= 0) {
        return false;
    }
    var seconds = (site.passExpiry - Date.now()) / 1000;
    return secondsToTimeString(seconds);
}
//========== Other Utilities ==========//

function getBrowser() {
    var sBrowser, sUsrAg = navigator.userAgent;

    // The order matters here, and this may report false positives for unlisted browsers.

    if (sUsrAg.indexOf("Firefox") > -1) {
        sBrowser = "Mozilla Firefox";
        // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
    } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
        sBrowser = "Samsung Internet";
        // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
    } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
        sBrowser = "Opera";
        // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
    } else if (sUsrAg.indexOf("Trident") > -1) {
        sBrowser = "Microsoft Internet Explorer";
        // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
    } else if (sUsrAg.indexOf("Edge") > -1) {
        sBrowser = "Microsoft Edge (Legacy)";
        // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
    } else if (sUsrAg.indexOf("Edg") > -1) {
        sBrowser = "Microsoft Edge (Chromium)";
        // Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.64
    } else if (sUsrAg.indexOf("Chrome") > -1) {
        sBrowser = "Google Chrome or Chromium";
        // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
    } else if (sUsrAg.indexOf("Safari") > -1) {
        sBrowser = "Apple Safari";
        // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
    } else {
        sBrowser = "unknown";
    }

    console.log(sBrowser);
    return sBrowser;
}

function getJsonDownloadHref(JSONData) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JSONData));
    return dataStr;
}

function readJsonFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(JSON.parse(reader.result));
        };

        reader.onerror = reject;
        reader.readAsText(file.item(0));
    })
}
