// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log("Hbitiac bomodoro manifest V3 content script)")

var currentHostname = window.location.hostname;
block = document.createElement('div');
block.setAttribute("id", "SitekeeperOverlay");
document.body.append(block);
var btn = document.createElement('button');
btn.setAttribute("id", "payToPass_btn");
btn.innerHTML = "Pay To Pass"
document.getElementById("SitekeeperOverlay").append(btn);

btn.onclick = function(){
    chrome.runtime.sendMessage({sender:"pageOverlay",msg:"Confirm_Purchase",hostname:currentHostname});
    btn.innerHTML =  "&#10004 Loading...";
    setTimeout(function(){ location.reload(); }, 1500);
};
createReloadBtn();

function createReloadBtn(){
    var reload = document.createElement('div');
    reload.setAttribute("id", "reload_btn");
    reload.innerHTML = "Reload";
    document.getElementById("SitekeeperOverlay").append(reload);
    reload.onclick = function(){location.reload();};
}
