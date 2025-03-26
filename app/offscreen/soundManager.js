let currentAmbientAudio = null;
let ambientSampleTimeout = null;
let myAudio = null;


function playSound(soundFileName, volume, loop) {
    if (soundFileName && soundFileName !== "None") {
        myAudio = new Audio(chrome.runtime.getURL("../audio/" + soundFileName));
        
        console.log(loop,myAudio?.src,currentAmbientAudio?.src,currentAmbientAudio?.src == myAudio?.src,currentAmbientAudio?.paused)
        
        if (loop && currentAmbientAudio?.src == myAudio?.src && !currentAmbientAudio?.paused){
            return;
        }  
        
        if (loop && currentAmbientAudio?.src !== myAudio?.src || currentAmbientAudio.paused) {
            stopAmbientSound();
            currentAmbientAudio = myAudio;
        }

        myAudio.volume = volume ?? 1;
        myAudio?.play();

    }
}

function stopAmbientSound() {
    myAudio?.pause(); // make sure no soumds leftovers are left
    if (currentAmbientAudio instanceof Audio) {
        currentAmbientAudio.pause();
        currentAmbientAudio.currentTime = 0;
    }
}

function playAmbientSample(soundName, volume) {
    stopAmbientSound();
    clearTimeout(ambientSampleTimeout);
    setTimeout(() => {
        playSound(soundName, volume, true);
    }, 100);
    ambientSampleTimeout = setTimeout(() => {
        stopAmbientSound();
    }, 3000);
}

// Listen for commands from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "playSound") {
        playSound(message.soundFileName, message.volume, message.loop);
        sendResponse({ success: true });
    } else if (message.type === "stopAmbientSound") {
        stopAmbientSound();
        sendResponse({ success: true });
    } else if (message.type === "playAmbientSample") {
        playAmbientSample(message.soundFileName, message.volume);
        sendResponse({ success: true });
    }
});