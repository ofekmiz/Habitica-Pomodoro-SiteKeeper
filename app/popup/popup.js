Node.prototype.AppendText = function (string) { this.appendChild(document.createTextNode(string)); }
Node.prototype.AppendBreak = function () { this.appendChild(document.createElement("br")); }

var CurrentTabHostname;
var updatedHabitica = false;
var HistoryChart;
var HistoryFromDay = 0;
var HistoryToDay = 7;
var HistoryPomodoroSelected = true;
const BROWSER = getBrowser();

//----- on popup load -----//
document.addEventListener("DOMContentLoaded", async function () {
    await runBackgroundFunction("FetchHabiticaData", [true]);
    await getBackgroundData();
    console.log("Vars", Vars);
    onPopupPageLoad();
});

function onPopupPageLoad() {

    //Link to app store by browser in feedback section
    setBrowserReviewLink();

    //Custome pomodoro habits
    $("#customPomodoroTask").empty();
    $("#customSetTask").empty();
    for (var i in Vars.PomodoroTaskCustomList) {
        const title = Vars.PomodoroTaskCustomList[i].title;
        const taskId = Vars.PomodoroTaskCustomList[i].id;
        const option = document.createElement("option");
        option.value = taskId;
        option.innerHTML = title;
        $("#customPomodoroTask").append(option);
        $("#customSetTask").append(option.cloneNode(true));
    }

    //Sounds list
    for (var i in Consts.Sounds) {
        const FileName = Consts.Sounds[i];
        const option = document.createElement("option");
        option.value = FileName;
        option.innerHTML = FileName.split(".")[0];
        $("#pomodoroEndSound").append(option);
        $("#breakEndSound").append(option.cloneNode(true));
    }
    for (var i in Consts.AmbientSounds) {
        var FileName = Consts.AmbientSounds[i];
        var option = document.createElement("option");
        option.value = FileName;
        option.innerHTML = FileName.split(".")[0];
        $("#ambientSound").append(option);
    }

    //update settings
    CredentialFields();

    //On version update or install show info
    console.log(Vars.versionUpdate);
    if (Vars.versionUpdate) {
        $("#VersionUpdate").show();
        $("#VersionUpdate .version").html("version " + chrome.runtime.getManifest().version);
    }
    $("#VersionUpdate .closeAlert").click(function () {
        $("#VersionUpdate").hide();
        Vars.versionUpdate = false;
        updateBackgroundData();
    });

    getCurrentTabUrl(function (url) {
        CurrentTabHostname = new URL(url).hostname;
        UpdateBlockCommand();
    });

    $("#BlockLink").click(function () {
        $('#welcomeInfo').hide();
        var currentSite = Vars.UserData.BlockedSites[CurrentTabHostname];
        if (currentSite) {
            removeSite(currentSite);
        }
        else {
            currentSite = { hostname: CurrentTabHostname, cost: 0, passExpiry: Date.now() }
            Vars.UserData.BlockedSites[CurrentTabHostname] = currentSite;
            AddSiteToTable(currentSite, true);
            SaveUserSettings();
            UpdateBlockCommand();
        }
        return false;
    });

    //open popup in new window
    $("#PopupNewWindow").click(function () {
        window.open('popup.html',
            'newwindow',
            `width=400,height=520`);
        return false;
    });


    var blockedSites = Vars.UserData.BlockedSites;
    for (var site in blockedSites) {
        if (blockedSites.hasOwnProperty(site)) {
            AddSiteToTable(blockedSites[site]);
        }
    }

    $("#Dosh").append(Vars.Monies.toFixed(1));
    $("#MyHp").append(Vars.Hp.toFixed(0));

    //Update Timer display - Main Interval
    updateTimerDisplay();
    setInterval(function () {
        updateTimerDisplay();
        updateSiteExpireDisplay();
    }, 250);

    //Credentials Error tip
    $(".credErrorTip").click(function () { credErrorTipAnimation() });

    //Pomodoro Button actions
    $("#PomoButton").click(function () {
        runBackgroundFunction("ActivatePomodoro");
    });

    //Menu
    $(".menu-item").change(function () {
       
        window.scrollTo(0, 0);
        var selected = $(this).find("input");
        console.log( "HIII");
        var menu_container = $(this).attr("menu-container-id");

        $(".menu-container").hide();
        $(".menu-item").removeClass("selected");
        $("#SaveButton").hide();

        if ($(selected).is(':checked')) {
            $(".menu-item label input").prop( "checked", false );
            selected.prop( "checked", true );  
            $("#" + menu_container).fadeIn();
            $("#SaveButton").slideDown();
            $(this).addClass("selected");
        }else{
            $(".menu-item label input").prop( "checked", false );
            $("#SaveButton").hide();
        }
        if (menu_container == "Settings") {
            $("#SaveButton").html("<span>&#9998;&nbsp;</span>SAVE &nbsp;&nbsp;");
        } else {
            $("#SaveButton").html("CLOSE");
        }
    });

    //Pomodoro Quick Settings
    $("#QuickSettings").click(function () {
        $("#pomodoroSettings").show();
        $("#pomodoro").hide();
        $("#quickSet-PomoDuration").val(Vars.UserData.PomoDurationMins);
        $("#quickSet-BreakDuration").val(Vars.UserData.BreakDuration);
        $("#quickSet-LongBreakDuration").val(Vars.UserData.LongBreakDuration);
        $("#quickSet-PomoSetNum").val(Vars.UserData.PomoSetNum);
    });

    $("#quickSave").click(function () { //Quick setting save (ok button)
        $("#pomodoroSettings").hide();
        $("#pomodoro").show();
        $("#PomoDuration").val($("#quickSet-PomoDuration").val());
        $("#BreakDuration").val($("#quickSet-BreakDuration").val());
        $("#LongBreakDuration").val($("#quickSet-LongBreakDuration").val());
        $("#PomoSetNum").val($("#quickSet-PomoSetNum").val());
        updateCredentials();
    });

    //Take manual break in quick settings
    $("#quickSet-takeBreak").click(function () {
        var duration = $("#quickSet-takeBreakDuration").val();
        runBackgroundFunction("takeBreak", [duration]);
        $("#pomodoroSettings").hide();
        $("#pomodoro").show();
    });

    //Pomodoro X button (stop pomodoro during break)
    $("#PomoStop").click(function () {
        runBackgroundFunction("pomoReset");
    });

    //Pomodoro >> skip to break button
    $("#SkipToBreak").click(function () {
        runBackgroundFunction("skipToBreak");
    });

    //Pomodoro FREEZE button
    $("#PomoFreeze").click(function () {
        runBackgroundFunction("pomoFreeze");
    });

    //Refresh stats button
    $("#RefreshStats").click(function () {
        runBackgroundFunction("FetchHabiticaData", []).then(location.reload());
    });

    //Free pass schedule
    $("#addFreePassBlock").click(() => addFreePassTimeBlock(getWeekDay(), "00:00", "00:00"));

    //Vacation Mode Banner
    runBackgroundFunction("isFreePassTimeNow", []).then((response) => {
        if (Vars.UserData.VacationMode || response == true) {
            $(".vacationBanner").show();
        }
    });

    $("#VacationMode").click(function () {
        if (Vars.UserData.VacationMode) {
            $(".vacationBanner").show();
        } else {
            $(".vacationBanner").hide();
        }
    });

    //Hide Edit Options
    if (Vars.UserData.HideEdit) {
        $("#BlockLink").hide();
        $(".edit").hide();
        $(".delete").hide();
    }

    if (!Vars.UserData.ConnectHabitica) {
        $(".habitica-setting").fadeTo("slow", 0.3);
        $(".buy").hide();
        $(".edit").hide();
        $("#Footer").hide();
        $("#CredError").hide();
    }

    $("#ConnectHabitica").click(function () {
        if ($("#ConnectHabitica").is(':checked')) {
            $(".habitica-setting").fadeTo("slow", 1);
            $(".buy").show();
            $(".edit").show();
            $("#Footer").slideDown();
        } else {
            $(".habitica-setting").fadeTo("slow", 0.3);
            $(".buy").hide();
            $(".edit").hide();
            $("#Footer").slideUp();
        }
    });

    //block table message
    var tbl = $('#SiteTable');
    if ($('#SiteTable tr').length == 0) {
        tbl.append(`<p id="welcomeInfo">Navigate to the sites you want to block during Pomodoro and click on 'Block Site'.<br><br> If Habitica is connected, choose a cost for visiting the site (cost 0 is blocked only during Pomodoro).</p>`);
    }

    // Save Button
    $("#SaveButton").click(function () {
        updateCredentials();
        //Got over it.
        SaveUserSettings();
        if (updatedHabitica) {
            runBackgroundFunction("FetchHabiticaData", []).then(location.reload());
        }
        location.reload();
    });

    //Habitica setting changed - longer save (full data fetch)
    $(".habitica-setting, .habitica-setting input,.habitica-setting select ").click(function () { updatedHabitica = true; });

    //Sounds
    $('#breakEndSound').on('change', function () {
        runBackgroundFunction("playSound", [this.value, Vars.UserData.breakEndSoundVolume, false]);
    });

    $('#pomodoroEndSound').on('change', function () {
        runBackgroundFunction("playSound", [this.value, Vars.UserData.pomodoroEndSoundVolume, false]);
    });

    $('#ambientSound').on('change', function () {
        runBackgroundFunction("playAmbientSample",[this.value, Vars.UserData.ambientSoundVolume]);
    });

    $('#pomodoroEndSoundVolume').mouseup(function () {
        runBackgroundFunction("playSound", [Vars.UserData.pomodoroEndSound, Vars.UserData.pomodoroEndSoundVolume, false]);
    });

    $('#breakEndSoundVolume').mouseup(function () {
        runBackgroundFunction("playSound", [Vars.UserData.breakEndSound, Vars.UserData.breakEndSoundVolume, false]);
    });

    $('#ambientSoundVolume').mouseup(function () {
        runBackgroundFunction("playAmbientSample",[Vars.UserData.ambientSound, Vars.UserData.ambientSoundVolume]);
    });

    //History Update
    const Canvas = document.getElementById('HistoryChart').getContext('2d');
    HistoryChart = new Chart(Canvas, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "",
                data: [],
                backgroundColor: "#87819091"
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    $("#MenuHistory").click(function () {
        updateHistory();
    });

    $('body').removeClass("loading");
}

//----- Functions -----//

function AddSiteToTable(site, fadein) {
    var table = $("#SiteTable");
    var cost = site.cost;
    var duration = site.passDuration;
    if (cost % 1 != 0) cost = cost.toFixed(2);
    if(!duration) duration = 30;

    var passExpiryElement = "";
    if (site.passExpiry) {
        if (site.passExpiry > Date.now()) {

            //Remaining time in minutes
            var remainingTime = getSitePassRemainingTime(site)
            passExpiryElement = '<br><span class="passExp" data-hostname=' + site.hostname + '>' + remainingTime + '</span>';
        }
    }

    var tbody = $(document.createElement("tbody"));
    tbody.attr("id", site.hostname);

    //Single Blocked wensite UI
    var html =
        '<tr class="reward-item">' +
        '<td class="gp">' +
        '<a class="buy" href="#">' +
        '<div class="siteCost"><span class="gold_icon"></span>' + cost + '</div>' +
        '<div class="siteDuration"><span class="hourglass_icon"></span>' + duration + '</div>' +
        '</a></td>' +
        '<td><div class="hostname">' + site.hostname + passExpiryElement + '</div></td>' +
        '<td><a class="edit"><img src="../img/pencil.png"></a></td>' +
        '<td><a class="delete"><img src="../img/trash.png"></a></td>' +
        '</tr>' +
        '<tr class="cost-duration-input" style="display:none;">' +
        '<td style="white-space:nowrap;text-align:center;" colspan="4">' +
        '<label>Cost <input class="cost" type="text"maxlength="8" size="8" value="' + cost + '"></label>' +
        '<label>Pass duration (minutes) <input class="time" type="text"maxlength="8" size="8" value="' + duration + '"></label>' +
        '</td></tr>' +
        '<tr><td></td><tr>';

    tbody.html(html);


    tbody.data("site", site);
    var inputRow = tbody.find('.cost-duration-input');
    var inputCost = inputRow.find('.cost');
    var inputDuration = inputRow.find('.time');
    inputCost.on("keyup", CreateDelegate(updateSiteCostDuration, { site: site, cost: inputCost, passDuration: inputDuration }));
    inputDuration.on("keyup", CreateDelegate(updateSiteCostDuration, { site: site, cost: inputCost, passDuration: inputDuration }));
    inputCost.on("keypress", CostDurationSubmit(inputRow));
    inputDuration.on("keypress", CostDurationSubmit(inputRow));
    tbody.find('.buy').click(CreateDelegate(chrome.tabs.create, { url: "http://" + site.hostname }));
    tbody.find('.edit').click(CreateDelegate(Toggle, inputRow));
    tbody.find('.delete').click(CreateDelegate(removeSite, site));
    table.append(tbody);
    if (fadein) {
        Toggle(inputRow);
        tbody.hide();
        tbody.fadeIn();
    }
    if (!Vars.UserData.ConnectHabitica) {
        $(".buy").hide();
        $(".edit").hide();
        $(".cost-input").hide();
    }
}

function Toggle(obj) {
    if ($(obj).is(":visible")) {
        obj.fadeOut({
            complete: function () {
                $("tbody").each(function () {
                    var cost = $(this).data("site").cost;
                    var passDuration = $(this).data("site").passDuration;
                    if (!passDuration) passDuration = 30;  
                    $(this).find(".buy")
                        .html(
                            '<div class="siteCost"><span class="gold_icon"></span>' + cost + '</div>' +
                            '<div class="siteDuration"><span class="hourglass_icon"></span>' + passDuration + '</div>'
                        );
                });
            }
        });
    } else {
        obj.fadeIn();
        obj.find("input").first().select();
    }
}

function CostDurationSubmit(r) {
    return function (e) {
        if (e.which == 13) { //press enter
            SaveUserSettings();
            Toggle(r);
            return false;
        }
        return true;
    }
}

function CredentialFields() {

    if (Vars.ServerResponse == 401 && Vars.UserData.ConnectHabitica) {
        $("#CredError").slideDown();
    }

    //Come on, Google!

    //Set Options according to UserData in background.js
    $("#UID").val(Vars.UserData.Credentials.uid);
    $("#APIToken").val(Vars.UserData.Credentials.apiToken);
    // $("#Duration").val(Vars.UserData.PassDurationMins);
    $("#PomoDuration").val(Vars.UserData.PomoDurationMins);
    $("#BreakDuration").val(Vars.UserData.BreakDuration);
    $("#BreakExtention").val(Vars.UserData.BreakExtention);
    $("#LongBreakDuration").val(Vars.UserData.LongBreakDuration);
    $("#Whitelist").val(Vars.UserData.Whitelist);
    $("#PomoHabitPlus").prop('checked', Vars.UserData.PomoHabitPlus);
    $("#PomoHabitMinus").prop('checked', Vars.UserData.PomoHabitMinus);
    $("#ManualBreak").prop('checked', Vars.UserData.ManualBreak);
    $("#BreakFreePass").prop('checked', Vars.UserData.BreakFreePass);
    $("#BreakExtentionFails").prop('checked', Vars.UserData.BreakExtentionFails);
    $("#BreakExtentionNotify").prop('checked', Vars.UserData.BreakExtentionNotify);
    $("#HideEdit").prop('checked', Vars.UserData.HideEdit);
    $("#PomoSetNum").val(Vars.UserData.PomoSetNum);
    $("#PomoSetHabitPlus").prop('checked', Vars.UserData.PomoSetHabitPlus);
    $("#LongBreakNotify").prop('checked', Vars.UserData.LongBreakNotify);
    $("#VacationMode").prop('checked', Vars.UserData.VacationMode);
    $("#customPomodoroTaskEnabled").prop('checked', Vars.UserData.CustomPomodoroTask);
    $("#customSetTaskEnabled").prop('checked', Vars.UserData.CustomSetTask);
    $("#customPomodoroTask").val(Vars.UserData.PomodoroTaskId);
    $("#customSetTask").val(Vars.UserData.PomodoroSetTaskId);
    $("#ConnectHabitica").prop('checked', Vars.UserData.ConnectHabitica);
    $("#MuteBlockedSites").prop('checked', Vars.UserData.MuteBlockedSites);
    $("#TranspartOverlay").prop('checked', Vars.UserData.TranspartOverlay);
    $("#TickSound").prop('checked', Vars.UserData.TickSound);
    $("#showSkipToBreak").prop('checked', Vars.UserData.showSkipToBreak);
    $("#showFreeze").prop('checked', Vars.UserData.showFreeze);
    $("#pomodoroEndSound").val(Vars.UserData.pomodoroEndSound);
    $("#breakEndSound").val(Vars.UserData.breakEndSound);
    $("#ambientSound").val(Vars.UserData.ambientSound);
    $("#pomodoroEndSoundVolume").val(Vars.UserData.pomodoroEndSoundVolume);
    $("#breakEndSoundVolume").val(Vars.UserData.breakEndSoundVolume);
    $("#ambientSoundVolume").val(Vars.UserData.ambientSoundVolume);
    $("#ResetPomoAfterBreak").prop('checked', Vars.UserData.ResetPomoAfterBreak);
    $("#quickSet-takeBreakDuration").val(Vars.UserData.QuickBreak);
    $("#developerServerUrl").val(Vars.UserData.developerServerUrl);

    createFreePassTimeBlocks(Vars.UserData.FreePassTimes);

    var dataToday = Vars.Histogram[getDate()];
    if (!dataToday) {
        // background.setTodaysHistogram(0, 0);
        runBackgroundFunction("setTodaysHistogram", [0, 0]).then(
            getBackgroundData().then(() => {
                dataToday = Vars.Histogram[getDate()];
                $("#PomoButton").attr("data-pomodoros", dataToday.pomodoros);
            })
        );
    } else {
        $("#PomoButton").attr("data-pomodoros", dataToday.pomodoros);
    }

    //Update Options on change
    $("#UID").on("keyup", function () { updateCredentials(); });
    $("#APIToken").on("keyup", function () { updateCredentials(); });
    $("#Duration").on("keyup", function () { updateCredentials(); });
    $("#PomoDuration").on("keyup", function () { updateCredentials(); });
    $("#BreakDuration").on("keyup", function () { updateCredentials(); });
    $("#BreakExtention").on("keyup", function () { updateCredentials(); });
    $("#LongBreakDuration").on("keyup", function () { updateCredentials(); });
    $("#Whitelist").on("keyup", function () { updateCredentials(); });
    $("#developerServerUrl").on("keyup", function () { updateCredentials(); });
    $("#PomoHabitPlus").click(function () { updateCredentials(); });
    $("#PomoHabitMinus").click(function () { updateCredentials(); });
    $("#ManualBreak").click(function () { updateCredentials(); });
    $("#BreakFreePass").click(function () { updateCredentials(); });
    $("#BreakExtentionFails").click(function () { updateCredentials(); });
    $("#BreakExtentionNotify").click(function () { updateCredentials(); });
    $("#HideEdit").click(function () { updateCredentials(); });
    $("#PomoSetNum").bind('keyup input change', function () { updateCredentials(); });
    $("#PomoSetHabitPlus").click(function () { updateCredentials(); });
    $("#LongBreakNotify").click(function () { updateCredentials(); });
    $("#VacationMode").click(function () { updateCredentials(); });
    $(".freePassBlock select").change(function () { updateCredentials(); });
    $(".freePassBlock input").change(function () { updateCredentials(); });
    $("#customPomodoroTask").click(function () { updateCredentials(); });
    $("#customSetTask").click(function () { updateCredentials(); });
    $("#customPomodoroTaskEnabled").click(function () { updateCredentials(); });
    $("#customSetTaskEnabled").click(function () { updateCredentials(); });
    $("#ConnectHabitica").click(function () { updateCredentials(); });
    $("#MuteBlockedSites").click(function () { updateCredentials(); });
    $("#TranspartOverlay").click(function () { updateCredentials(); });
    $("#TickSound").click(function () { updateCredentials(); });
    $("#showSkipToBreak").click(function () { updateCredentials(); });
    $("#showFreeze").click(function () { updateCredentials(); });
    $("#pomodoroEndSound").click(function () { updateCredentials(); });
    $("#breakEndSound").click(function () { updateCredentials(); });
    $("#ambientSound").click(function () { updateCredentials(); });
    $("#pomodoroEndSoundVolume").mouseup(function () { updateCredentials(); });
    $("#breakEndSoundVolume").mouseup(function () { updateCredentials(); });
    $("#ambientSoundVolume").mouseup(function () { updateCredentials(); });
    $("#ResetPomoAfterBreak").click(function () { updateCredentials(); });
    $("quickSet-takeBreak").click(function () { updateCredentials(); });
    //ugh.
    updateBackgroundData();
}

function CreateDelegate(onclick, param1) {
    return function () { onclick(param1); }
}

function NewTab(url) {
    return function () { chrome.tabs.create({ url: url }); }
}

function UpdateBlockCommand() {
    getBackgroundData().then(() => {
        var currentSite = Vars.UserData.BlockedSites[CurrentTabHostname];
        if (currentSite) {
            $("#BlockLink").html("<div class='unBlockSite'><span class='unblock_Icon small_icon'></span>Un-Block Site</div>");
        } else {
            $("#BlockLink").html("<div class='blockSite'><span class='block_Icon small_icon'></span>Block Site!</div>");
        }
        updateTimerDisplay();
    });
}

function SaveUserSettings() {
    var dataPack = {}
    dataPack[Consts.userDataKey] = Vars.UserData;
    // ReSharper disable once PossiblyUnassignedProperty
    chrome.storage.sync.set(dataPack, function () { });
    updateBackgroundData();
}

//{site:site , cost:inputObj, Duration:inputObj}
function updateSiteCostDuration(siteCostDuration) {
    var hostname = siteCostDuration.site.hostname;
    var costSelection = parseFloat(siteCostDuration.cost.val());
    var durationSelection = parseFloat(siteCostDuration.passDuration.val());
    if (!isNaN(costSelection) && costSelection >= 0 && Vars.UserData.BlockedSites[hostname]) {
        Vars.UserData.BlockedSites[hostname].cost = costSelection;
        siteCostDuration.site.cost = costSelection;
    }
    if (!isNaN(durationSelection) && durationSelection >= 0 && Vars.UserData.BlockedSites[hostname]) {
        Vars.UserData.BlockedSites[hostname].passDuration = durationSelection;
        siteCostDuration.site.passDuration = durationSelection;
    }
    updateBackgroundData();
}

function removeSite(site) {
    var siterow = $(document.getElementById(site.hostname));
    siterow.fadeOut({ complete: function () { siterow.remove() } });
    runBackgroundFunction("RemoveBlockedSite", [site]).then(() => {
        UpdateBlockCommand();
    });
}

function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };
    chrome.tabs.query(queryInfo, function (tabs) {
        var tab = tabs[0];
        var url = tab.url;
        console.assert(typeof url == "string", "tab.url should be a string");
        callback(url);
    });
}
function updateCredentials() {

    Vars.UserData.Credentials.uid = $("#UID").val();
    Vars.UserData.Credentials.apiToken = $("#APIToken").val();

    //TODO better code...
    // var flDuration = parseFloat($("#Duration").val());
    // if (!isNaN(flDuration)) Vars.UserData.PassDurationMins = flDuration;
    var pmDuration = parseFloat($("#PomoDuration").val());
    if (!isNaN(pmDuration)) Vars.UserData.PomoDurationMins = pmDuration;
    var brDuration = parseFloat($("#BreakDuration").val());
    if (!isNaN(brDuration)) Vars.UserData.BreakDuration = brDuration;
    var exDuration = parseFloat($("#BreakExtention").val());
    if (!isNaN(exDuration)) Vars.UserData.BreakExtention = exDuration;
    var pomoNum = parseFloat($("#PomoSetNum").val());
    if (!isNaN(pomoNum)) Vars.UserData.PomoSetNum = pomoNum;
    var longBr = parseFloat($("#LongBreakDuration").val());
    if (!isNaN(longBr)) Vars.UserData.LongBreakDuration = longBr;

    Vars.UserData.PomoHabitPlus = $("#PomoHabitPlus").prop('checked');
    Vars.UserData.PomoHabitMinus = $("#PomoHabitMinus").prop('checked');
    Vars.UserData.ManualBreak = $("#ManualBreak").prop('checked');
    Vars.UserData.BreakFreePass = $("#BreakFreePass").prop('checked');
    Vars.UserData.BreakExtentionFails = $("#BreakExtentionFails").prop('checked');
    Vars.UserData.BreakExtentionNotify = $("#BreakExtentionNotify").prop('checked');
    Vars.UserData.PomoSetHabitPlus = $("#PomoSetHabitPlus").prop('checked');
    Vars.UserData.LongBreakNotify = $("#LongBreakNotify").prop('checked');
    Vars.UserData.VacationMode = $("#VacationMode").prop('checked');
    Vars.UserData.CustomPomodoroTask = $("#customPomodoroTaskEnabled").prop('checked');
    Vars.UserData.CustomSetTask = $("#customSetTaskEnabled").prop('checked');
    Vars.UserData.HideEdit = $("#HideEdit").prop('checked');
    Vars.UserData.PomodoroSetTaskId = $("#customSetTask").val();
    Vars.UserData.PomodoroTaskId = $("#customPomodoroTask").val();
    Vars.UserData.ConnectHabitica = $("#ConnectHabitica").prop('checked');
    Vars.UserData.MuteBlockedSites = $("#MuteBlockedSites").prop('checked');
    Vars.UserData.TranspartOverlay = $("#TranspartOverlay").prop('checked');
    Vars.UserData.TickSound = $("#TickSound").prop('checked');
    Vars.UserData.showSkipToBreak = $("#showSkipToBreak").prop('checked');
    Vars.UserData.showFreeze = $("#showFreeze").prop('checked');
    Vars.UserData.pomodoroEndSound = $("#pomodoroEndSound").val();
    Vars.UserData.breakEndSound = $("#breakEndSound").val();
    Vars.UserData.ambientSound = $("#ambientSound").val();
    Vars.UserData.pomodoroEndSoundVolume = $("#pomodoroEndSoundVolume").val();
    Vars.UserData.breakEndSoundVolume = $("#breakEndSoundVolume").val();
    Vars.UserData.ambientSoundVolume = $("#ambientSoundVolume").val();
    Vars.UserData.ResetPomoAfterBreak = $("#ResetPomoAfterBreak").prop('checked');
    Vars.UserData.Whitelist = $("#Whitelist").val();
    Vars.UserData.FreePassTimes = getFreePassTimes();
    Vars.UserData.QuickBreak = $("#quickSet-takeBreakDuration").val();
    Vars.UserData.developerServerUrl = $("#developerServerUrl").val();

    updateBackgroundData();
}

function updateTimerDisplay() {
    timerPort.postMessage("sync");
    $('#Time').html(Vars.Timer);
    if (Vars.onManualTakeBreak) {
        $("#Time").attr("data-pomodoros-set", "--/--");
    } else {
        $("#Time").attr("data-pomodoros-set", Vars.PomoSetCounter + "/" + Vars.UserData.PomoSetNum);
    }

    var pomodoros = (Vars && Vars.Histogram[getDate()]) ? Vars.Histogram[getDate()].pomodoros : 0;
    $("#PomoButton").attr("data-pomodoros", pomodoros);

    if (Vars.onBreakExtension) { //---On Break Extension---
        $("#QuickSettings").hide();
        $(".unBlockSite").show();
        $('#pomodoro').css("background-color", "red");
        $('#pomodoro').css("color", "coral");
        tomatoSetClass("tomatoWarning");
        if (!Vars.onManualTakeBreak) {
            $("#PomoStop").show();
        }
        $("#SkipToBreak").hide();
        $("#PomoFreeze").hide();
    }
    else if (Vars.onBreak) {
        $(".unBlockSite").show();
        $("#QuickSettings").hide();
        if (Vars.TimerRunnig) { //---On Break---
            $('#pomodoro').css("background-color", "cornflowerblue");
            $('#pomodoro').css("color", "aqua");
            tomatoSetClass("tomatoBreak");
        }
        else {//---Manual Break---
            $('#pomodoro').css("background-color", "green");
            $('#pomodoro').css("color", "lightgreen");
            tomatoSetClass("tomatoWin");
        }
        if (!Vars.onManualTakeBreak) {
            $("#PomoStop").fadeIn();
        } else {
            $("#PomoStop").hide();
        }
        $("#SkipToBreak").hide();
        $("#PomoFreeze").hide();
        $("#SiteTable tbody").toggleClass('blocked', false);
    }
    else if (Vars.TimerRunnig) { //---Pomodoro running or freeze---
        
        $(".unBlockSite").hide();
        $("#SiteTable tbody").toggleClass('blocked', true);
        $("#PomoStop").hide();
        $("#QuickSettings").hide();

        if(Vars.TimerFreeze){
            tomatoSetClass("tomatoFreeze");
            $('#pomodoro').css("background-color", "lightsteelblue");
            $('#pomodoro').css("color", "steelblue");
        }else{
            tomatoSetClass("tomatoProgress");
            $('#pomodoro').css("background-color", "green");
            $('#pomodoro').css("color", "lightgreen");
        }

        if (Vars.UserData.showSkipToBreak && !Vars.TimerFreeze) {
            $("#SkipToBreak").show();
        } else {
            $("#SkipToBreak").hide();
        }
        
        if (Vars.UserData.showFreeze && !Vars.TimerFreeze) {
            $("#PomoFreeze").show();
        } else {
            $("#PomoFreeze").hide();
        }

    } else { //---pomodoro not running---
        $(".unBlockSite").show();
        $("#QuickSettings").show();
        $('#pomodoro').css("background-color", "#8ccff1")
        $('#pomodoro').css("color", "#553889");
        tomatoSetClass("tomatoWait");
        $("#SiteTable tbody").toggleClass('blocked', false);
        $("#PomoStop").hide();
        $("#SkipToBreak").hide();
        $("#PomoFreeze").hide();
    }
}

var TOMATO_CLASSES = ["tomatoProgress", "tomatoWait", "tomatoBreak", "tomatoWin", "tomatoWarning","tomatoFreeze"];
function tomatoSetClass(className) {
    TOMATO_CLASSES.forEach(function (entry) {
        $('.tomato').toggleClass(entry, false);
    });
    $('.tomato').toggleClass(className, true);
}

function credErrorTipAnimation() {
    $("#MenuSettings label input").prop("checked", true).change();
    $("#MenuHabiticaSettings").prop("checked", true).change();
    $('.connect-habitica-animate').animate(
        {
            fontSize: "20px"
        }, 700);
    $('.connect-habitica-animate').animate(
        {
            fontSize: "14px"
        }, 700);
}

function updateSiteExpireDisplay() {
    $(".passExp").each(function () {
        var hostname = $(this).attr("data-hostname")
        var site = Vars.UserData.BlockedSites[hostname];
        var time = getSitePassRemainingTime(site);
        if (time) {
            $(this).html(time);
        } else {
            $(this).remove();
        }

    });
}

function addFreePassTimeBlock(day, fromTime, toTime) {
    var block = $(`
    <div class="freePassBlock">
        <select name="weekday">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
        </select>
        <input value="${fromTime}" name="fromTime" type="time"> -
        <input value="${toTime}" name="toTime" type="time">
        <span class="trash_icon small_icon"></span>
    </div>
     `)
    block.find('select[name="weekday"]').val(day);
    $("#freePassBlocks").append(block);
    block.hide().fadeIn(function () {
        updateCredentials();
    });

    block.find(".trash_icon").click(function () {
        $(this).closest('.freePassBlock').fadeOut(function () {
            $(this).remove();
            updateCredentials();
        });
    });
}

//data is array of {day:'weekday name',fromTime:'hh:mm',toTime:'hh:mm'} objects
function createFreePassTimeBlocks(data) {
    for (var i in data) {
        addFreePassTimeBlock(data[i].day, data[i].fromTime, data[i].toTime);
    }
}

//returns array of objects {day:'weekday name',fromTime:'hh:mm',toTime:'hh:mm'}
function getFreePassTimes() {
    var times = [];
    $("#freePassBlocks .freePassBlock").each(function () {
        var day = $(this).find("select[name='weekday']").val();
        var fromTime = $(this).find("input[name='fromTime']").val();
        var toTime = $(this).find("input[name='toTime']").val();
        times.push({
            day: day,
            fromTime: fromTime,
            toTime: toTime
        });
    });
    return times;
}

function sumOfArray(array) {
    var total = 0;
    for (var i = 0; i < array.length; i++) {
        array[i] = Number(array[i]);
        total += array[i] << 0;
    }
    return total;
}

function updateHistory() {

    var dataToday = Vars.Histogram[getDate()];
    if (!dataToday) {
        runBackgroundFunction("setTodaysHistogram", [0, 0]).then(
            getBackgroundData().then(() => {
                updateHistoryHTML();
            })
        );
    } else {
        updateHistoryHTML();
    }

    function updateHistoryHTML() {
        dataToday = Vars.Histogram[getDate()];
        $("#PomoToday").html(dataToday.pomodoros);
        var hrs = dataToday.minutes <= 0 ? 0 : (dataToday.minutes / 60).toFixed(1);
        $("#HoursToday").html(hrs);

        var totalPomodoros = 0;
        var totalHours = 0;
        var dataSize = 0;
        var chartData = { dates: [], pomodoros: [], hours: [], weekdays: [] };

        //collect data from histogram
        for (var key in Vars.Histogram) {
            dataSize++;
            if (Vars.Histogram.hasOwnProperty(key)) {
                var data = Vars.Histogram[key];
                var hrs = data.minutes <= 0 ? 0 : (data.minutes / 60).toFixed(1);
                totalPomodoros += Number(data.pomodoros);
                totalHours += Number(hrs);
                chartData.dates.push(`${key} (${data.weekday.slice(0, 2)})`);
                chartData.weekdays.push(data.weekday)
                chartData.pomodoros.push(data.pomodoros);
                chartData.hours.push(hrs);
            }
        }


        $("#PomoTotal").html(totalPomodoros);
        $("#HoursTotal").html(totalHours.toFixed(1));
        $("#PomoAvg").html((totalPomodoros / dataSize).toFixed(1));
        $("#HoursAvg").html((totalHours / dataSize).toFixed(1));

        HistoryFromDay = chartData.dates.length - 7 > 0 ? chartData.dates.length - 7 : 0;
        HistoryToDay = chartData.dates.length;
        udateHistoryTable(HistoryChart, chartData.dates, chartData.pomodoros, chartData.weekdays, "Pomodoros");

        $("#HistoryChartShowPomodoros").click(function () {
            udateHistoryTable(HistoryChart, chartData.dates, chartData.pomodoros, chartData.weekdays, "Pomodoros");
            HistoryPomodoroSelected = true;
        });
        $("#HistoryChartShowHours").click(function () {
            udateHistoryTable(HistoryChart, chartData.dates, chartData.hours, chartData.weekdays, "Hours");
            HistoryPomodoroSelected = false;
        });

        $("#DownloadHistogram").click(function (e) {
            var dataStr = getJsonDownloadHref(Vars.Histogram);
            this.setAttribute("href", dataStr);
            this.setAttribute("download", "Histogram.json");
        });

        $("#ImportHistogram").click(async function () {
            //ImportObjectAsJson
            var files = document.getElementById('selectHistogramFile').files;
            var json = await readJsonFileAsync(files);
            Vars.Histogram = json;
            await updateBackgroundData();
            location.reload();
        });

        $("#ClearHistogram").click(function () {
            runBackgroundFunction("clearHistogram", []).then(location.reload());
        });

        $("#HistoryChartNext").click(function () {
            HistoryFromDay = HistoryFromDay + 7 > chartData.dates.length - 7 ? chartData.dates.length - 7 : HistoryFromDay + 7;
            HistoryToDay = HistoryToDay + 7 > chartData.dates.length ? chartData.dates.length : HistoryToDay + 7;
            if (HistoryPomodoroSelected) {
                udateHistoryTable(HistoryChart, chartData.dates, chartData.pomodoros, chartData.weekdays, "Pomodoros");
            } else {
                udateHistoryTable(HistoryChart, chartData.dates, chartData.hours, chartData.weekdays, "Hours");
            }
        });
        $("#HistoryCharPrev").click(function () {
            HistoryFromDay = HistoryFromDay - 7;
            HistoryToDay = HistoryToDay - 7;
            if (HistoryFromDay <= 0 || HistoryToDay <= 0) {
                HistoryFromDay = 0;
                HistoryToDay = 7;
            }
            if (HistoryPomodoroSelected) {
                udateHistoryTable(HistoryChart, chartData.dates, chartData.pomodoros, chartData.weekdays, "Pomodoros");
            } else {
                udateHistoryTable(HistoryChart, chartData.dates, chartData.hours, chartData.weekdays, "Hours");
            }
        });
    }

}

function udateHistoryTable(Chart, datesArary, dataArray, weekDaysArray, label) {

    var showDates = datesArary.slice(HistoryFromDay, HistoryToDay);
    var showData = dataArray.slice(HistoryFromDay, HistoryToDay);
    var showWeekDays = weekDaysArray.slice(HistoryFromDay, HistoryToDay);

    Chart.data.labels = showDates;
    Chart.data.datasets[0].data = showData;
    Chart.data.datasets[0].label = label;
    Chart.options.tooltips.callbacks.title = function (tooltipItem, data) {
        return tooltipItem[0].label + " " + showWeekDays[showDates.indexOf(tooltipItem[0].label)];
    }

    $("#HistoryChartTotal").html(`Sum: ${sumOfArray(showData)} | Avg: ${(sumOfArray(showData) / (HistoryToDay - HistoryFromDay)).toFixed(1)}`);
    Chart.update();
}

function setBrowserReviewLink() {
    var rateAndReviewLink = $("#rateAndReviewLink");
    if (BROWSER === "Mozilla Firefox") {
        rateAndReviewLink.attr("href", "https://addons.mozilla.org/en/firefox/addon/habitica-pomodoro-sitekeeper");
    } else if (BROWSER.includes("Microsoft Edge")) {
        rateAndReviewLink.attr("href", "https://microsoftedge.microsoft.com/addons/detail/habitica-pomodoro-sitekee/loclmeljcebbomgebpnbdmcmofmhoand");
    }
}




