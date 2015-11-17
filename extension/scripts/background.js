var ChromeLangauger = {};

console.log("here");

var settings = new Store("settings", {
	"sourceLang": "en",
	"targetLang": "fr",
	"engine": "google_free",
	"googleApiKey": "",
	"vocalize": false
});

ChromeLangauger.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};


ChromeLangauger.setBadge = function(tabId) {
  chrome.browserAction.setBadgeText({
    text: ChromeLangauger.capitalize(settings.get('sourceLang')),
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
    	console.log("activated");

      var files = ["scripts/inject/jquery.min.js", "scripts/inject/rangy-core.js", "scripts/inject/langauger.js"];
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
