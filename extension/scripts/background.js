var ChromeLangauger = {};

console.log("here");

var settings = new Store("settings", {
	"sourceLang": "en",
	"translateLang": "fr",
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

ChromeLangauger.activate = function(tab) {
	ChromeLangauger.setBadge(tab.id);
	console.log("activated");
};

chrome.browserAction.onClicked.addListener(ChromeLangauger.activate);
