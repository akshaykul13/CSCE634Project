var ChromeLangauger = {};
var LanguagerisEnabled = true;
var currentTabID;

var settings = new Store("settings", {
    "sourceLang": "en",
    "targetLang": "fr",
    "engine": "google_free",
    "googleApiKey": "",
    "vocalize": true
});

ChromeLangauger.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};


ChromeLangauger.setBadge = function(tabId) {
    chrome.browserAction.setBadgeText({
        text: ChromeLangauger.capitalize(settings.get('targetLang')),
        tabId: tabId
    });
}

ChromeLangauger.settings = function(settings){
    var ret = {
        sourceLang: settings.get('sourceLang'),
        targetLang: settings.get('targetLang'),
        googleApiKey: settings.get('googleApiKey'),
        vocalize: settings.get('vocalize')
    };
    return ret;
}

ChromeLangauger.activate = function(tab) {	
	chrome.tabs.sendMessage(tab.id, { msgId: "isLangaugerLoaded" }, function(result) {
        // not already loaded
        if (typeof(result) == "undefined") {
        	ChromeLangauger.setBadge(tab.id);
            console.log(settings.get("vocalize"));
        	console.log("activated");

            var files = ["scripts/inject/jquery.min.js", "scripts/inject/rangy-core.js", "scripts/inject/parser.js", "scripts/inject/langauger.js"];
            for (var i = 0; i < files.length; i++) {
                chrome.tabs.executeScript(tab.id, {file: files[i]});
            }
            chrome.tabs.insertCSS(tab.id, {file: "css/langauger.css"});
            chrome.tabs.executeScript(tab.id, {file: "scripts/inject/inject.js"}, function(){
                chrome.tabs.sendMessage(tab.id, {
                    msgId: "bootLangauger",
                    config: ChromeLangauger.settings(settings)
                });
            });
            // The initial click on the browserAction (Langauger icon) will activate it on the current tab.
             // Subsequet clicks will display the settings popup, which includes a CSS file to clean it up.
            chrome.browserAction.setPopup({
                tabId: tab.id,
                popup: 'popup.html'
            });
        } else {
          // langauger is already activated, but might need to be re-triggered (eg in case of context menu)
            chrome.tabs.sendMessage(tab.id, {
                msgId: "bootLangauger",
                config: ChromeLangauger.settings(settings)
            });
        }
    });
};

chrome.browserAction.onClicked.addListener(ChromeLangauger.activate);


ChromeLangauger.play = function(url) {
    if (typeof(ChromeLangauger.currentlyPlaying) !== "undefined") {
        ChromeLangauger.currentlyPlaying.pause();
    }
    ChromeLangauger.currentlyPlaying = new Audio(url);
    ChromeLangauger.currentlyPlaying.play();
}

/**
 * Listens for vocalization requests from content scripts.
 * This must be done in background.js since otherwise html5 audio doesn't work cross-domain.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'vocalize') {
        return;
    }

    // Try to play the text (note that there's a 100 char limit; should
    // chunk on sentences.
    var text = encodeURIComponent(request.text);
    var url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl='
            + settings.get('targetLang')
            + '&total=1&idx=0&textlen=77&client=t&prev=input&q='
            + text;
    // Voice RSS API
    var url1 = 'http://api.voicerss.org/?key=6e069bbaccb64cedac38c4b63c325dd4&src=' + text + '&hl=es-es'
    console.log("vocalizing", url1);
    ChromeLangauger.play(url1);
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'toggleExtension') {
        return;
    }
    LanguagerisEnabled = !LanguagerisEnabled;
    chrome.tabs.reload(currentTabID);
});

chrome.tabs.onUpdated.addListener(function(tabId , info) {
    console.log(info);
    if (info.status == "complete" && LanguagerisEnabled) {
        currentTabID = tabId;
        ChromeLangauger.activate({id: tabId});
    }
});
